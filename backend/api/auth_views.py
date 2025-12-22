from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


def _set_jwt_cookies(response: Response, access: str, refresh: str | None = None):
    # Dev settings: secure=False for http, samesite=Lax works on same-site usage
    response.set_cookie(
        settings.JWT_AUTH_COOKIE,
        access,
        httponly=True,
        secure=False,
        samesite="Lax",
        path="/",
    )
    if refresh is not None:
        response.set_cookie(
            settings.JWT_REFRESH_COOKIE,
            refresh,
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/api/auth/",  # refresh cookie only sent to auth endpoints
        )
    return response


def _clear_jwt_cookies(response: Response):
    response.delete_cookie(settings.JWT_AUTH_COOKIE, path="/")
    response.delete_cookie(settings.JWT_REFRESH_COOKIE, path="/api/auth/")
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)
    if not user:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    resp = Response({"detail": "ok"}, status=status.HTTP_200_OK)
    return _set_jwt_cookies(resp, access_token, refresh_token)


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh(request):
    refresh_token = request.COOKIES.get(settings.JWT_REFRESH_COOKIE)
    if not refresh_token:
        return Response({"detail": "Missing refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        refresh = RefreshToken(refresh_token)
        # rotate refresh (if enabled)
        new_refresh = str(refresh) if not settings.SIMPLE_JWT.get("ROTATE_REFRESH_TOKENS") else str(refresh)
        access_token = str(refresh.access_token)
    except Exception:
        return Response({"detail": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

    resp = Response({"detail": "ok"}, status=status.HTTP_200_OK)
    return _set_jwt_cookies(resp, access_token, new_refresh)


@api_view(["POST"])
def logout(request):
    resp = Response({"detail": "ok"}, status=status.HTTP_200_OK)
    return _clear_jwt_cookies(resp)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    u = request.user
    return Response({"id": u.id, "username": u.get_username(), "email": u.email})
