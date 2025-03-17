import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Import AuthContext
import "bootstrap-icons/font/bootstrap-icons.css";
import styles from "../styles/Navbar.module.css";

const Navbar = () => {
  const { authState, logout } = useAuth(); // Access authState and logout function
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Reset authentication state
    navigate("/login"); // Redirect to login page after logout
  };

  if (!authState) {
    return null; // Prevent crash if authState is undefined
  }

  return (
    <nav className={styles.navbar}>
      <h1 className={styles.logo}>
        <Link to="/">Track-Trace</Link>
      </h1>
      <div className={styles.links}>
        <Link to="/" className={styles.navButton}>
          <i className="bi bi-house-door" /> Home
        </Link>
        <Link to="/about-us">
          <i className="bi bi-info-circle" /> About Us
        </Link>
        <Link to="/contact-us">
          <i className="bi bi-telephone" /> Contact Us
        </Link>

        {authState.isAuthenticated ? (
          <>
            <span className={styles.username}>
              <i className="bi bi-person-circle" /> Welcome, {authState.user?.username}
            </span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <i className="bi bi-box-arrow-right" /> Logout
            </button>
          </>
        ) : (
          <Link to="/login">
            <i className="bi bi-person" /> Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
