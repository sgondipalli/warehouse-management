import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import Footer from "../components/Footer";
import styles from "../styles/Dashboard.module.css";

const Dashboard = () => {
  const { authState } = useAuth();
  const { user, roles } = authState;

  // ** Role-based Access Checks **
  const isSuperAdmin = Array.isArray(roles) && roles.includes("Super Admin");
  const isManager = Array.isArray(roles) && roles.includes("Warehouse Manager");
  const isWorker = Array.isArray(roles) && roles.includes("Warehouse Worker");
  const isAuditor = Array.isArray(roles) && roles.includes("Auditor/Compliance Officer");
  const isDeliveryAgent = Array.isArray(roles) && roles.includes("Delivery Agent");

  return (
    <div className={styles.dashboardWrapper}>
      {/* Top Navigation Bar */}
      <DashboardNavbar />

      <div className={styles.contentWrapper}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className={styles.container}>
          <div className={styles.content}>
            <h1>Welcome, {user ? user.username : "Guest"}!</h1>
            <p>Role: {Array.isArray(roles) && roles.length > 0 ? roles.join(", ") : "No roles assigned"}</p>

            {/* Role-based Content in a 4x4 Grid */}
            <div className={styles.gridContainer}>
              {(isSuperAdmin || isManager) && (
                <Link to="/manage-users" className={styles.gridItem}>
                  <i className="fa-solid fa-users-cog"></i>
                  <span>Manage Users</span>
                </Link>
              )}

              {isWorker && (
                <Link to="/inventory" className={styles.gridItem}>
                  <i className="fa-solid fa-box-open"></i>
                  <span>Inventory Management</span>
                </Link>
              )}

              {isAuditor && (
                <Link to="/audit-logs" className={styles.gridItem}>
                  <i className="fa-solid fa-file-alt"></i>
                  <span>View Audit Logs</span>
                </Link>
              )}

              {isDeliveryAgent && (
                <Link to="/deliveries" className={styles.gridItem}>
                  <i className="fa-solid fa-truck"></i>
                  <span>Delivery Tracking</span>
                </Link>
              )}

              {(isSuperAdmin || isManager) && (
                <Link to="/serialization" className={styles.gridItem}>
                  <i className="fa-solid fa-barcode"></i>
                  <span>Serialization & Tracking</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer is placed outside of contentWrapper */}
      
    </div>
  );
};

export default Dashboard;
