import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/LoginForm.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, loginWithOkta } = useAuth(); // Okta login function added
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      await login(email, password, navigate);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h1>Login</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className={styles.inputField}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            className={styles.inputField}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit" className={styles.submitButton}>
            Login
          </button>
        </form>

        {/* Okta Login Button */}
        <button className={styles.oktaButton} onClick={loginWithOkta}>
          Login with Okta
        </button>

        <div className={styles.linkContainer}>
          <Link to="/forgot-password" className={styles.link}>
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
