import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { authState } = useAuth();

  // If the user is NOT authenticated, redirect to login
  if (!authState.isAuthenticated) {
    console.warn("Access Denied: User is not authenticated.");
    return <Navigate to="/login" />;
  }

  // If allowedRoles are specified and user has no matching roles, redirect to unauthorized
  if (allowedRoles?.length && !allowedRoles.some(role => authState.roles.includes(role))) {
    console.warn(
      `Access Denied: User with roles [${authState.roles.join(", ")}] tried to access a restricted page.`
    );
    return <Navigate to="/unauthorized" />;
  }

  // If authentication & authorization are valid, render the component
  return children;
};

export default PrivateRoute;
