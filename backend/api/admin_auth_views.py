from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


def _set_admin_jwt_cookies(response: Response, access: str, refresh: str | None = None):
    # Access cookie same as public (path="/") so the API can authenticate everywhere.
    response.set_cookie(
        settings.JWT_AUTH_COOKIE,
        access,
        httponly=True,
        secure=False,
        samesite="Lax",
        path="/",
    )

    # Refresh cookie for ADMIN endpoints only
    if refresh is not None:
        response.set_cookie(
            settings.JWT_REFRESH_COOKIE,
            refresh,
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/api/admin/auth/",
        )
    return response


def _clear_admin_jwt_cookies(response: Response):
    response.delete_cookie(settings.JWT_AUTH_COOKIE, path="/")
    response.delete_cookie(settings.JWT_REFRESH_COOKIE, path="/api/admin/auth/")
    return response


def _require_admin(user) -> bool:
    return bool(user and (user.is_staff or user.is_superuser))


@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    # keep same payload shape as your public login
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(request, username=username, password=password)
    if not user:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    if not _require_admin(user):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    resp = Response({"detail": "ok"}, status=status.HTTP_200_OK)
    return _set_admin_jwt_cookies(resp, access_token, refresh_token)


@api_view(["POST"])
@permission_classes([AllowAny])
def admin_refresh(request):
    refresh_token = request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
    if not refresh_token:
        return Response({"detail": "Missing refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        # Keep it identical to your existing approach (no rotation logic changes)
        new_refresh = str(refresh)
    except Exception:
        return Response({"detail": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

    resp = Response({"detail": "ok"}, status=status.HTTP_200_OK)
    return _set_admin_jwt_cookies(resp, access_token, new_refresh)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_logout(request):
    # optional: block non-admins from using this endpoint
    if not _require_admin(request.user):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    resp = Response({"detail": "ok"}, status=status.HTTP_200_OK)
    return _clear_admin_jwt_cookies(resp)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_me(request):
    u = request.user
    if not _require_admin(u):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)

    return Response(
        {
            "id": u.id,
            "username": u.get_username(),
            "email": u.email,
            "is_staff": u.is_staff,
            "is_superuser": u.is_superuser,
        }
    )

from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status

@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def admin_models_upload(request):
    data = request.data.dict()  # text fields only
    f = request.FILES.get("file")  # must match your frontend form field name

    if not f:
        return Response({"detail": "No file uploaded (expected field 'file')."}, status=400)

    # Example: if serializer expects "file"
    payload = {**data, "file": f}

    ser = ModelUploadSerializer(data=payload)
    if not ser.is_valid():
        return Response(ser.errors, status=400)

    obj = ser.save()
    return Response({"id": obj.id, "name": obj.name}, status=201)

