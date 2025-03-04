import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // Import useLocation
import styles from "../styles/HomePage.module.css";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext"; // Import AuthContext

const HomePage = () => {
  const [userId, setUserId] = useState(null); // State for user_id
  const { authState } = useAuth(); // Access global auth state
  const location = useLocation(); // Access the location object

  useEffect(() => {
    // Extract user_id from query parameters or AuthContext
    const params = new URLSearchParams(location.search);
    const userIdFromQuery = params.get("user_id");

    // Update user_id state
    if (userIdFromQuery) {
      setUserId(userIdFromQuery);
    } else if (authState.isAuthenticated) {
      setUserId(authState.user.user_id); // Use AuthContext if available
    }
  }, [location, authState]);


  return (
    <div className={styles.homePage}>
      <Navbar />

      {/* Running Update Section */}
      <div className={styles.runningUpdate}>
        <p>⚡️ Latest upgrades and news about SAP ⚡️</p>
      </div>

      {/* Hero Container */}
      <div className={styles.heroContainer}>
        <div className={styles.heroText}>
          <h1>Testing component and will be updated with the Func</h1>
          <p>
            {userId
              ? `Welcome User #${userId}, start planning your next adventure!`
              : "Perfect for Track, Trace, Serialization and WareHouse Management!"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;