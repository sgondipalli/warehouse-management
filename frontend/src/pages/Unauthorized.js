import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/Unauthorized.module.css";  // CSS file for styling

const Unauthorized = () => {
  return (
    <div className={styles.container}>
      <h1>403 - Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
      <Link to="/dashboard" className={styles.backButton}>Go to Dashboard</Link>
    </div>
  );
};

export default Unauthorized;
