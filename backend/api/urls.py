
from django.urls import path
from .views import health
from .auth_views import login, refresh, logout, me

urlpatterns = [
    path("health/", health),

    path("auth/login/", login),
    path("auth/refresh/", refresh),
    path("auth/logout/", logout),
    path("auth/me/", me),
]

