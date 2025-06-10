import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/DispatchSummary.module.css";
import { useAuth } from "../context/AuthContext";

const DispatchSummary = () => {
  const { authState } = useAuth();
  const token = authState?.token;

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const res = await axios.get("http://localhost:5050/api/outbounds/dispatches/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching dispatch summary", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerManualScan = async () => {
    try {
      await axios.get("http://localhost:5050/api/outbounds/second-leg/manual-scan", {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSummary();
      alert("✅ Manual scan executed successfully");
    } catch (err) {
      console.error("Manual scan failed", err);
      alert("❌ Manual scan failed");
    }
  };

  useEffect(() => {
    if (token) fetchSummary();
  }, [token]);

  return (
    <div className={styles.summaryCard}>
      <h3>📊 Dispatch Summary</h3>
      {loading ? (
        <p>Loading summary...</p>
      ) : summary ? (
        <>
          <ul>
            <li>Total Dispatches: <strong>{summary.total}</strong></li>
            <li>Final-Leg Dispatches: <strong>{summary.finalLegs}</strong></li>
            <li>Pending Second-Leg Assignments: <strong>{summary.pendingSecondLegs}</strong></li>
          </ul>
          <button onClick={triggerManualScan} className={styles.scanButton}>
            🔁 Manual Scan
          </button>
        </>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default DispatchSummary;
