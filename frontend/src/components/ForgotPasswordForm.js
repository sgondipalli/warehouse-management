import React, { useState } from "react";
import styles from "../styles/ForgotPasswordForm.module.css";
import { Link } from "react-router-dom";
import axios from "axios";


const BASE_URL_API = "http://localhost:5001/auth"; // Backend base URL
const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Basic validation
    if (!email) {
      setError("Email is required.");
      return;
    }

    try {
      // Make the API call using axios
      const response = await axios.post(`${BASE_URL_API}/forgot-password`, { email });

      // Axios already parses the response into JSON
      if (response.status === 200) {
        setMessage(response.data.message || "Password reset email sent successfully.");
      } else {
        setError(response.data.message || "Failed to send password reset email.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again later.");
    }
  };

  return (
    <div className={styles.forgotPasswordBox}>
      <h2>Forgot Password</h2>
      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.inputField}
          required
        />
        <button type="submit" className={styles.submitButton}>
          Send Reset Link
        </button>
        <div className={styles.linkContainer}>
          <Link to="/" className={styles.link}>
            Back to Homepage
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
