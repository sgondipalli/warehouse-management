import React, { useEffect } from "react";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const { user, roles } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("User:", user);
    console.log("Roles:", roles);
  }, [user, roles]);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.username || "User"}!</p>
      <p>Your Roles: {roles?.join(", ") || "No roles assigned"}</p>
    </div>
  );
};

export default Dashboard;
