import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import styles from "../styles/Sidebar.module.css";

const Sidebar = () => {
  const { authState } = useAuth();
  const { roles, user } = authState;

  // ** Role-based Access **
  const isSuperAdmin = roles.includes("Super Admin");
  const isManager = roles.includes("Warehouse Manager");
  const isWorker = roles.includes("Warehouse Worker");
  const isAuditor = roles.includes("Auditor/Compliance Officer");
  const isDeliveryAgent = roles.includes("Delivery Agent");

  return (
    <div className={styles.sidebarContainer}>
      <h2 className={styles.title}>Welcome</h2>
      <p className={styles.userName}>{user?.lastName || "Guest"}</p>

      <ul className={styles.menuList}>
        {/* Edit Profile */}
        <li>
          <Link to="/edit-profile" className={styles.sidebarLink}>
            <i className="fa-solid fa-user-pen"></i> Edit Profile
          </Link>
        </li>

        <h3 className={styles.sectionTitle}>Dashboard</h3>

        {/* Super Admin Access */}
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
          </>
        )}

        {/* Warehouse Manager Access */}
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
          </>
        )}

        {/* Warehouse Worker Access */}
        {isWorker && (
          <li>
            <Link to="/inventory" className={styles.sidebarLink}>
              <i className="fa-solid fa-warehouse"></i> Inventory Management
            </Link>
          </li>
        )}

        {/* Auditor Access */}
        {isAuditor && (
          <li>
            <Link to="/audit-logs" className={styles.sidebarLink}>
              <i className="fa-solid fa-file-alt"></i> View Audit Logs
            </Link>
          </li>
        )}

        {/* Delivery Agent Access */}
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
