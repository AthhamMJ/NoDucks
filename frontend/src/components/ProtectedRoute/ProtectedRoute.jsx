import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import styles from "./ProtectedRoute.module.css";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Wait for the /auth/me check before deciding anything
  if (loading) {
    return (
      <div className={styles.loading} role="status" aria-live="polite">
        <LoaderCircle size={24} className={styles.spin} aria-hidden="true" />
        <span className={styles.visuallyHidden}>Checking your session</span>
      </div>
    );
  }

  //if the user Token just failed, automatically go to the Home page
  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
