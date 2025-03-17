import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRoles }) => {
  const { authState, loading } = useAuth();

  console.log("PrivateRoute Check - isAuthenticated:", authState.isAuthenticated);
  console.log("PrivateRoute Check - Roles:", authState.roles);

  // **Wait until loading completes**
  if (loading) {
    console.log("Auth is still loading... Holding PrivateRoute check.");
    return <p>Loading...</p>; // Show a proper loading UI
  }

  // **If not authenticated, redirect to login**
  if (!authState.isAuthenticated) {
    console.warn("Access Denied: User is not authenticated.");
    return <Navigate to="/login" />;
  }

  // **Ensure role-based access**
  if (allowedRoles?.length && !allowedRoles.some(role => authState.roles.includes(role))) {
    console.warn(`Access Denied: User roles [${authState.roles.join(", ")}] do not match required roles.`);
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PrivateRoute;
