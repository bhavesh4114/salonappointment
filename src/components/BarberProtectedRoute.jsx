import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BarberProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("🛡 BarberProtectedRoute:", { loading, user });

  // ⏳ wait for auth restore
  if (loading) {
    return <div>Loading...</div>;
  }

  // 🔒 not logged in
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // ⛔ not barber
  if (user.role !== "barber") {
    return <Navigate to="/" replace />;
  }

  // ✅ allowed
  return children;
};

export default BarberProtectedRoute;
