import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { authState } = useAuth(); // Using Context API instead of Redux

  return (
    <div>
      <h1>Welcome, {authState.user ? authState.user.username : "Guest"}!</h1>
      <p>Role: {authState.roles.join(", ") || "No roles assigned"}</p>
    </div>
  );
};

export default Dashboard;
