from django.db import transaction
from django.db.models import Count
from django.utils import timezone
from datetime import timedelta

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from .authentication import CookieJWTAuthentication
from rest_framework.permissions import IsAuthenticated

from .permissions import IsAdminUserStrict
from .models import MLModel, InferenceEvent
from .serializers import MLModelSerializer, MLModelListSerializer

from django.contrib.auth import get_user_model



@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUserStrict])
def admin_overview(request):
    total_models = MLModel.objects.count()
    enabled_models = MLModel.objects.filter(enabled=True).count()
    active = MLModel.objects.filter(is_active=True).first()

    # last 7 days inference counts
    since = timezone.now() - timedelta(days=7)
    daily = (
        InferenceEvent.objects.filter(created_at__gte=since)
        .extra(select={"day": "date(created_at)"})
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )

    # unique users last 7d
    User = get_user_model()
    registrations_7d = User.objects.filter(date_joined__gte=since).count()


    return Response(
        {
            "models": {
                "total": total_models,
                "enabled": enabled_models,
                "active": MLModelListSerializer(active).data if active else None,
            },
            "usage": {
                "active_users_7d": registrations_7d,

                "daily_inferences_7d": list(daily),
            },
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUserStrict])
def admin_models_list(request):
    qs = MLModel.objects.all().order_by("-created_at")
    return Response(MLModelListSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUserStrict])
@parser_classes([MultiPartParser, FormParser])


def admin_models_upload(request):
    """
    multipart/form-data:
      - name
      - arch (resnet18|effnet_b0|mlp)
      - version (optional)
      - description (optional)
      - file (.pth)
    """
    data = request.data.dict()  # text fields
    uploaded = request.FILES.get("file")  # serializer field is "file"

    if not uploaded:
        return Response(
            {"detail": "No file uploaded (expected field 'file')."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    payload = {**data, "file": uploaded}

    ser = MLModelSerializer(data=payload)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    m = ser.save(created_by=request.user)
    return Response(MLModelSerializer(m).data, status=status.HTTP_201_CREATED)

@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUserStrict])
def admin_models_toggle(request, model_id: int):
    enabled = request.data.get("enabled")
    if enabled is None:
        return Response({"detail": "enabled is required"}, status=400)

    m = MLModel.objects.filter(id=model_id).first()
    if not m:
        return Response({"detail": "Model not found"}, status=404)

    m.enabled = bool(enabled)
    # if disabling active model, also unset active
    if not m.enabled and m.is_active:
        m.is_active = False
    m.save(update_fields=["enabled", "is_active"])
    return Response({"detail": "ok", "model": MLModelListSerializer(m).data})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUserStrict])
def admin_models_set_active(request, model_id: int):
    m = MLModel.objects.filter(id=model_id).first()
    if not m:
        return Response({"detail": "Model not found"}, status=404)
    if not m.enabled:
        return Response({"detail": "Cannot activate a disabled model"}, status=400)

    with transaction.atomic():
        MLModel.objects.filter(is_active=True).update(is_active=False)
        m.is_active = True
        m.save(update_fields=["is_active"])

    return Response({"detail": "ok", "active": MLModelListSerializer(m).data})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsAdminUserStrict])
def admin_models_delete(request, model_id: int):
    m = MLModel.objects.filter(id=model_id).first()
    if not m:
        return Response({"detail": "Model not found"}, status=404)

    # delete file from disk first
    if m.file:
        m.file.delete(save=False)

    m.delete()
    return Response({"detail": "deleted"}, status=204)

