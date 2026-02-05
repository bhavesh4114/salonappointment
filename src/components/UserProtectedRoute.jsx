import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const UserProtectedRoute = ({ children }) => {
  const auth = useAuth();

  // 🔒 Guard against undefined context
  if (!auth) {
    return null;
  }

  const { user = null, loading = true } = auth;

  // ⏳ Wait for auth to initialize
  if (loading) {
    return null;
  }

  // 🔐 Redirect unauthenticated users
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🔎 Safe role check
  const role = typeof user.role === "string"
    ? user.role.toLowerCase()
    : "";

  if (role !== "user") {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default UserProtectedRoute;
