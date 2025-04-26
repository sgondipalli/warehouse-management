import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const spinnerStyle = {
  textAlign: "center",
  padding: "80px",
  fontSize: "1.25rem",
  color: "#555",
};

const PrivateRoute = ({ children, allowedRoles }) => {
  const { authState, loading } = useAuth();

  // ⏳ Show spinner while auth is loading
  if (loading) {
    return (
      <div style={spinnerStyle}>
        <div className="spinner" style={{ fontSize: "3rem" }}>🔐</div>
        <p>Restoring session. Please wait...</p>
      </div>
    );
  }

  // ❌ Not authenticated — redirect to login
  if (!authState.isAuthenticated) {
    console.warn("🔒 Access Denied: Not authenticated");
    return <Navigate to="/login" replace />;
  }

  // 🔒 Role check failed — redirect to unauthorized
  if (allowedRoles?.length && !allowedRoles.some(role => authState.roles.includes(role))) {
    console.warn(`🚫 Access Denied: User lacks required roles (${allowedRoles.join(", ")})`);
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Access granted
  return children;
};

export default PrivateRoute;
