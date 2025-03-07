import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import styles from "../styles/Dashboard.module.css";

const Dashboard = () => {
  const { authState } = useAuth();
  const { user, roles } = authState;

  // ** Role-based Access Checks **
  const isSuperAdmin = roles.includes("Super Admin");
  const isManager = roles.includes("Warehouse Manager");
  const isWorker = roles.includes("Warehouse Worker");
  const isAuditor = roles.includes("Auditor/Compliance Officer");
  const isDeliveryAgent = roles.includes("Delivery Agent");

  return (
    <div className={styles.dashboardContainer}>
      <h1>Welcome, {user ? user.username : "Guest"}!</h1>
      <p>Role: {roles.join(", ") || "No roles assigned"}</p>

      {/* Super Admin & Manager can manage users */}
      {(isSuperAdmin || isManager) && (
        <div className={styles.card}>
          <h2>User Management</h2>
          <p>Create, edit, and manage users.</p>
          <Link to="/manage-users" className={styles.button}>Manage Users</Link>
        </div>
      )}

      {/* Warehouse Worker can manage inventory */}
      {isWorker && (
        <div className={styles.card}>
          <h2>Inventory Management</h2>
          <p>View and update warehouse inventory.</p>
          <Link to="/inventory" className={styles.button}>Manage Inventory</Link>
        </div>
      )}

      {/* Auditor can view logs */}
      {isAuditor && (
        <div className={styles.card}>
          <h2>Audit Logs</h2>
          <p>View system activity and compliance logs.</p>
          <Link to="/audit-logs" className={styles.button}>View Logs</Link>
        </div>
      )}

      {/* Delivery Agent can update deliveries */}
      {isDeliveryAgent && (
        <div className={styles.card}>
          <h2>Delivery Tracking</h2>
          <p>Update shipment and delivery statuses.</p>
          <Link to="/deliveries" className={styles.button}>Manage Deliveries</Link>
        </div>
      )}

      {/* Serialization Management (Future Feature) */}
      {(isSuperAdmin || isManager) && (
        <div className={styles.card}>
          <h2>Serialization & Tracking</h2>
          <p>Manage serialized items and traceability.</p>
          <Link to="/serialization" className={styles.button}>Manage Serialization</Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
