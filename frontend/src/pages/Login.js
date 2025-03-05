import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "../styles/LoginForm.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate(); // ✅ Initialize navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }

    try {
      await login(email, password, navigate); // ✅ Pass `navigate`
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h1>Login</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
