import { Navigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { ReactNode } from "react";

interface AdminProtectedRouteProps {
  children?: ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("admin_session") === "true";

  if (!isAuthenticated) {
    // Redirect to admin login page, but remember where they were trying to go
    return <Navigate to="/admin-auth" state={{ from: location }} replace />;
  }

  // If children are provided, render them
  if (children) {
    return <>{children}</>;
  }

  // Otherwise, render the child routes via Outlet
  return <Outlet />;
};

export default AdminProtectedRoute;
