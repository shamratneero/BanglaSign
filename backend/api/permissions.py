from rest_framework.permissions import BasePermission


class IsAdminUserStrict(BasePermission):
    """
    Allow staff/superuser only.
    """
    def has_permission(self, request, view):
        u = getattr(request, "user", None)
        return bool(u and u.is_authenticated and (u.is_staff or u.is_superuser))
