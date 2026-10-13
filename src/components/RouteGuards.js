import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader } from "./PageState";

// Only logged-in users; others are sent to /login and returned afterwards.
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

// Login/register pages are hidden from logged-in users.
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
