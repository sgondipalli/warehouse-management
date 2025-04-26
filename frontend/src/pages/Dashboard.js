import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import Footer from "../components/Footer";
import styles from "../styles/Dashboard.module.css";


const Dashboard = () => {
  const { authState, loading } = useAuth();
  

  if (loading) return <div>Loading dashboard...</div>; // ⬅️ Wait until restoreSession finishes

  if (!authState.isAuthenticated || !authState.user) {
    return <div>Unauthorized - Please login again</div>;
  }
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
            <h1>Welcome, {user ? user.lastName : "Guest"}!</h1>
            <p>Role: {Array.isArray(roles) && roles.length > 0 ? roles.join(", ") : "No roles assigned"}</p>

            {/* Role-based Content in a 4x4 Grid */}
            <div className={styles.gridContainer}>
              {(isSuperAdmin || isManager) && (
                <>
                  <Link to="/manage-users" className={styles.gridItem}>
                    <i className="fa-solid fa-users-cog"></i>
                    <span>Manage Users</span>
                  </Link>
                  <Link to="/suppliers" className={styles.gridItem}>
                    <i className="fa-solid fa-building-circle-check"></i>
                    <span>Manage Suppliers</span>
                  </Link>
                </>

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
                <>
                  <Link to="/serialization" className={styles.gridItem}>
                    <i className="fa-solid fa-barcode"></i>
                    <span>Serialization & Tracking</span>
                  </Link>
                  <Link to="/create-user" className={styles.gridItem}>
                    <i className="fa-solid fa-user-plus"></i>
                    <span>Create User</span>
                  </Link>
                  <Link to="/manage-users" className={styles.gridItem}>
                    <i className="fa-solid fa-users-gear"></i>
                    <span>Manage Users</span>
                  </Link>
                  <Link to="/create-trade-item" className={styles.gridItem}>
                    <i className="fa-solid fa-boxes-packing"></i>
                    <span>Create Trade Item</span>
                  </Link>
                  <Link to="/manage-trade-items" className={styles.gridItem}>
                    <i className="fa-solid fa-warehouse"></i>
                    <span>Manage Trade Items</span>
                  </Link>
                  <Link to="/stock-levels" className={styles.gridItem}>
                    <i className="fa-solid fa-layer-group"></i>
                    <span>Stock Level Service</span>
                  </Link>
                  <Link to="/locations" className={styles.gridItem}>
                    <i className="fa-solid fa-location-dot"></i>
                    <span>Manage Locations</span>
                  </Link>

                  <Link to="/locations/storage" className={styles.gridItem}>
                    <i className="fa-solid fa-boxes-stacked"></i>
                    <span>Zone & Bin Structure</span>
                  </Link>

                </>

              )}
              {(isSuperAdmin || isManager || isWorker) && (
                <Link to="/inbounds" className={styles.gridItem}>
                  <i className="fa-solid fa-arrow-down-a-z"></i>
                  <span>Inbounds</span>
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
