from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """
    Authenticate using JWT stored in HttpOnly cookie.
    Falls back to Authorization header if present.
    """

    def authenticate(self, request):
        # 1. Try Authorization header first
        header = self.get_header(request)
        if header is not None:
            return super().authenticate(request)

        # 2. Fallback to cookie
        raw_token = request.COOKIES.get(settings.JWT_AUTH_COOKIE)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
