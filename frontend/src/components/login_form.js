import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/LoginForm.module.css"; // Import modular CSS
import { useAuth } from "../context/AuthContext";

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        // Pass login data to parent (e.g., LoginPage)
        const user = result.user;
        onLogin(user);
        login(user);
        console.log("Login successful:", user);
        navigate(`/?user_id=${user.user_id}`);
      } else {
        setError(result.message || "Incorrect email or password.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className={styles.loginBox}>
      <h1>Login</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          className={styles.inputField}
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={styles.inputField}
          required
        />
        <input type="submit" value="Login" className={styles.submitButton} />
      </form>
      <div className={styles.linkContainer}>
        <Link to="/forgot-password" className={styles.link}>
          Forgot Password?
        </Link>
      </div>
      <div className={styles.linkContainer}>
        Don't have an account?{" "}
        <Link to="/signup" className={styles.link}>
          Sign Up
        </Link>
      </div>
      <div className={styles.linkContainer}>
        <Link to="/" className={styles.link}>
          Back to Homepage
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;
