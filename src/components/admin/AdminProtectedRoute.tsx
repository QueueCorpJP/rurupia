
import { Navigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";

const AdminProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated = sessionStorage.getItem("adminAuthenticated") === "true";

  if (!isAuthenticated) {
    // Redirect to admin login page, but remember where they were trying to go
    return <Navigate to="/admin-auth" state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default AdminProtectedRoute;
