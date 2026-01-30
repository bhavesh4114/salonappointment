import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BarberProtectedRoute = ({ children }) => {
  const { user, token, loading } = useAuth();

  // 🔥 WAIT till auth loads
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  // ❌ not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ logged in but not barber
  if (user.role !== "barber") {
    return <Navigate to="/" replace />;
  }

  // ✅ allow
  return children;
};

export default BarberProtectedRoute;
