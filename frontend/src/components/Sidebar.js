import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import styles from "../styles/Sidebar.module.css";

const Sidebar = () => {
  const { authState, loading } = useAuth(); // ✅ include loading

  if (loading) return null; // ✅ wait for auth to be restored
  if (!authState.user) return null;

  const { roles, user } = authState;

  const isSuperAdmin = roles.includes("Super Admin");
  const isManager = roles.includes("Warehouse Manager");
  const isWorker = roles.includes("Warehouse Worker");
  const isAuditor = roles.includes("Auditor/Compliance Officer");
  const isDeliveryAgent = roles.includes("Delivery Agent");

  return (
    <div className={styles.sidebarContainer}>
      <h2 className={styles.title}>Welcome</h2>
      <p className={styles.userName}>{user ? `Welcome, ${authState.user.firstName}` : "Welcome, Guest"}</p>

      <ul className={styles.menuList}>
        <li>
          <Link to="/edit-profile" className={styles.sidebarLink}>
            <i className="fa-solid fa-user-pen"></i> Edit Profile
          </Link>
        </li>

        <h3 className={styles.sectionTitle}>Dashboard</h3>

        {isSuperAdmin && (
          <>
            <li>
              <Link to="/create-user" className={styles.sidebarLink}>
                <i className="fa-solid fa-user-plus"></i> Create User
              </Link>
            </li>
            <li>
              <Link to="/manage-users" className={styles.sidebarLink}>
                <i className="fa-solid fa-users-gear"></i> Manage Users
              </Link>
            </li>
            <li>
              <Link to="/create-trade-item" className={styles.sidebarLink}>
                <i className="fa fa-barcode"></i> Create Trade Item
              </Link>
            </li>
            <li>
              <Link to="/manage-trade-items" className={styles.gridItem}>
                <i className="fa-solid fa-warehouse"></i>
                <span>Manage Trade Items</span>
              </Link>
            </li>
            <li>
              <Link to="/stock-levels" className={styles.gridItem}>
                <i className="fa-solid fa-layer-group"></i>
                <span>Stock Level Service</span>
              </Link>
            </li>
            <li>
              <Link to="/locations" className={styles.gridItem}>
                <i className="fa-solid fa-location-dot"></i>
                <span>Manage Locations</span>
              </Link>
            </li>
            <li>
              <Link to="/locations/storage" className={styles.gridItem}>
                <i className="fa-solid fa-boxes-stacked"></i>
                <span>Zone & Bin Structure</span>
              </Link>
            </li>
            <li>
              <Link to="/inbounds" className={styles.gridItem}>
                <i className="fa-solid fa-arrow-down-a-z"></i>
                <span>Inbounds</span>
              </Link>
            </li>
            <li>
              <Link to="/suppliers" className={styles.gridItem}>
                <i className="fa-solid fa-building-circle-check"></i>
                <span>Manage Suppliers</span>
              </Link>
            </li>
          </>
        )}

        {isManager && (
          <>
            <li>
              <Link to="/serialization" className={styles.sidebarLink}>
                <i className="fa-solid fa-magnifying-glass"></i> Serialization & Tracking
              </Link>
            </li>
            <li>
              <Link to="/manage-inventory" className={styles.sidebarLink}>
                <i className="fa-solid fa-boxes-stacked"></i> Manage Inventory
              </Link>
            </li>
            <li>
              <Link to="/create-trade-item" className={styles.sidebarLink}>
                <i className="fa fa-barcode"></i> Create Trade Item
              </Link>
            </li>
            <li>
              <Link to="/manage-trade-items" className={styles.gridItem}>
                <i className="fa-solid fa-warehouse"></i>
                <span>Manage Trade Items</span>
              </Link>
            </li>
            <li>
              <Link to="/stock-levels" className={styles.gridItem}>
                <i className="fa-solid fa-layer-group"></i>
                <span>Stock Level Service</span>
              </Link>
            </li>
            <li>
              <Link to="/suppliers" className={styles.gridItem}>
                <i className="fa-solid fa-building-circle-check"></i>
                <span>Manage Suppliers</span>
              </Link>
            </li>
          </>
        )}

        {isWorker && (
          <>
            <li>
              <Link to="/inventory" className={styles.sidebarLink}>
                <i className="fa-solid fa-warehouse"></i> Inventory Management
              </Link>
            </li>
            <li>
              <Link to="/inbounds" className={styles.gridItem}>
                <i className="fa-solid fa-arrow-down-a-z"></i>
                <span>Inbounds</span>
              </Link>
            </li>
          </>
        )}

        {isAuditor && (
          <li>
            <Link to="/audit-logs" className={styles.sidebarLink}>
              <i className="fa-solid fa-file-alt"></i> View Audit Logs
            </Link>
          </li>
        )}

        {isDeliveryAgent && (
          <li>
            <Link to="/deliveries" className={styles.sidebarLink}>
              <i className="fa-solid fa-truck"></i> Delivery Tracking
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
