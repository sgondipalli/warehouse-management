import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import styles from "../styles/ResetPasswordForm.module.css";

const BASE_URL_API = "http://localhost:5001/auth"; // Backend URL

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Extract token from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Auto-redirect if token is missing
  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Redirecting...");
      setTimeout(() => navigate("/forgot-password"), 3000);
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!password || !confirmPassword) {
      setError("Both fields are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL_API}/reset-password`, {
        token,
        password,
      });

      if (response.status === 200) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(response.data.message || "Failed to reset password.");
      }
    } catch (err) {
      console.error("Error:", err);

      if (err.response?.status === 400) {
        setError("Reset token expired or invalid. Please request a new one.");
        setTimeout(() => navigate("/forgot-password"), 3000);
      } else {
        setError(err.response?.data?.message || "An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className={styles.resetPasswordBox}>
      <h2>Reset Password</h2>
      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.inputField}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={styles.inputField}
          required
        />
        <button type="submit" className={styles.submitButton}>
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
