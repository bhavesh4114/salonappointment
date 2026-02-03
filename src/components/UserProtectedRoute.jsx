import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserProtectedRoute = ({ children }) => {
  const { user = null, loading = true } = useAuth();

  // Return loader while auth is not ready; do not access user until loading is false
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (user == null) {
    return <Navigate to="/login" replace />;
  }

  // Safe: only read role after null check; never access user.id without guard
  const role = user?.role != null ? String(user.role).toLowerCase() : "";
  if (role !== "user") {
    return <Navigate to="/" replace />;
  }

  return children != null ? children : <Outlet />;
};

export default UserProtectedRoute;
