import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Ensure roles exist before checking includes()
  if (allowedRoles && !authState.roles?.length) {
    return <Navigate to="/unauthorized" />;
  }

  if (allowedRoles && !allowedRoles.some(role => authState.roles.includes(role))) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PrivateRoute;
