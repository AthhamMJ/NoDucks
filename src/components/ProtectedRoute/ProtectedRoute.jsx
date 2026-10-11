import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading your NoDucks workspace...</p>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}