import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for auth to load before checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // IMPORTANT
  if (user.role !== "user") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default UserProtectedRoute;
