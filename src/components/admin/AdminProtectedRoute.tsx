import { Navigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { ReactNode } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface AdminProtectedRouteProps {
  children?: ReactNode;
}

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const location = useLocation();
  const { isAdminAuthenticated } = useAdminAuth();

  if (!isAdminAuthenticated) {
    // Redirect to correct admin auth page, but remember where they were trying to go
    return <Navigate to="/admin/auth" state={{ from: location }} replace />;
  }

  // If children are provided, render them
  if (children) {
    return <>{children}</>;
  }

  // Otherwise, render the child routes via Outlet
  return <Outlet />;
};

export default AdminProtectedRoute;
