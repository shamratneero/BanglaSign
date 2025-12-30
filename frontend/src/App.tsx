import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import { useAuth } from "./auth/useAuth";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminModels from "./pages/admin/AdminModels";

import InferDemo from "./pages/InferDemo";


function RequireAuth({ children }: { children: ReactElement }) {
  const { me, loading } = useAuth();

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!me) return <Navigate to="/login" replace />;

  return children;
}

function RequireAdmin({ children }: { children: ReactElement }) {
  const { loading } = useAuth();

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User app */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/models"
        element={
          <RequireAdmin>
            <AdminModels />
          </RequireAdmin>
        }
      />

     <Route path="/infer" element={
      <InferDemo />} />


      {/* Default routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
