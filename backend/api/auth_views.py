from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


def _set_jwt_cookies(response: Response, access: str, refresh: str | None = None):
    cookie_secure = getattr(settings, "JWT_COOKIE_SECURE", False)
    cookie_samesite = getattr(settings, "JWT_COOKIE_SAMESITE", "Lax")
    cookie_domain = getattr(settings, "JWT_COOKIE_DOMAIN", None)  # optional

    response.set_cookie(
        settings.JWT_AUTH_COOKIE,
        access,
        httponly=True,
        secure=cookie_secure,
        samesite=cookie_samesite,
        domain=cookie_domain,
        path="/",
    )

    if refresh is not None:
        response.set_cookie(
            settings.JWT_REFRESH_COOKIE,
            refresh,
            httponly=True,
            secure=cookie_secure,
            samesite=cookie_samesite,
            domain=cookie_domain,
            path="/api/auth/",
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
    return Response({
        "id": u.id,
        "username": u.get_username(),
        "email": getattr(u, "email", ""),
        "first_name": getattr(u, "first_name", ""),
        "last_name": getattr(u, "last_name", ""),
        "is_staff": bool(getattr(u, "is_staff", False)),
        "is_superuser": bool(getattr(u, "is_superuser", False)),
        "is_active": bool(getattr(u, "is_active", True)),
    })



from django.contrib.auth import get_user_model

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    User = get_user_model()

    username = request.data.get("username", "").strip()
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "")
    first_name = request.data.get("first_name", "").strip()
    last_name = request.data.get("last_name", "").strip()

    if not username or not password:
        return Response({"detail": "username and password required"}, status=status.HTTP_400_BAD_REQUEST)

    # Basic uniqueness checks (safe for default User)
    if User.objects.filter(username=username).exists():
        return Response({"detail": "username already exists"}, status=status.HTTP_409_CONFLICT)
    if email and hasattr(User, "email") and User.objects.filter(email=email).exists():
        return Response({"detail": "email already exists"}, status=status.HTTP_409_CONFLICT)

    user = User.objects.create_user(
        username=username,
        email=email if hasattr(User, "email") else "",
        password=password,
    )

    # Optional names (only if fields exist)
    if hasattr(user, "first_name"):
        user.first_name = first_name
    if hasattr(user, "last_name"):
        user.last_name = last_name
    user.save()

    # Auto-login after register (nice UX)
    refresh = RefreshToken.for_user(user)
    resp = Response({"detail": "ok"}, status=status.HTTP_201_CREATED)
    return _set_jwt_cookies(resp, str(refresh.access_token), str(refresh))
