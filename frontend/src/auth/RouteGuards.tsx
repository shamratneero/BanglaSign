
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

export function ProtectedRoute() {
  const { me, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null; // later we can show a loader
  if (!me) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  return <Outlet />;
}

export function AdminRoute() {
  const { me, loading } = useAuth();
  const loc = useLocation();

  if (loading) return null;
  if (!me) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  // admin check (you return is_superuser/is_staff)
  const isAdmin = me.is_superuser || me.is_staff;
  if (!isAdmin) return <Navigate to="/app" replace />;

  return <Outlet />;
}
