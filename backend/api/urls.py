from django.urls import path
from inference.views import InferView
from .views import health
from .auth_views import login, refresh, logout, me
from . import admin_auth_views
from . import admin_views
from django.urls import path
from . import auth_views
from django.urls import path, include


urlpatterns = [
    path("health/", health),

    # public auth
    path("login", auth_views.login),
    path("register", auth_views.register),
    path("refresh", auth_views.refresh),
    path("logout", auth_views.logout),
    path("me", auth_views.me),

    # admin auth
    path("admin/auth/login/", admin_auth_views.admin_login),
    path("admin/auth/refresh/", admin_auth_views.admin_refresh),
    path("admin/auth/logout/", admin_auth_views.admin_logout),
    path("admin/auth/me/", admin_auth_views.admin_me),

    # admin console APIs
    path("admin/overview/", admin_views.admin_overview),
    path("admin/models/", admin_views.admin_models_list),
    path("admin/models/upload/", admin_views.admin_models_upload),
    path("admin/models/<int:model_id>/toggle/", admin_views.admin_models_toggle),
    path("admin/models/<int:model_id>/activate/", admin_views.admin_models_set_active),

    #ML API

    path("infer", InferView.as_view()),


] 

