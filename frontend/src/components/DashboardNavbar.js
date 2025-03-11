import React from "react";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/DashboardNavbar.module.css";

const DashboardNavbar = () => {
  const { authState, logout } = useAuth();

  return (
    <div className={styles.navbarContainer}>
      <h2>Track-Trace</h2>
      <div className={styles.navLinks}>
        <span className={styles.user}>Welcome, {authState.user?.username}</span>
        <button onClick={logout} className={styles.logoutButton}>Logout</button>
      </div>
    </div>
  );
};

export default DashboardNavbar;
