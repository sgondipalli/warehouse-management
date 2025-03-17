import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/CreateUserService.module.css";

const CreateUserService = ({ onUserCreated }) => {
  const { authState } = useAuth();
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  // ** Handle Input Change **
  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  // ** Create or Restore User **
  const handleCreateUser = async () => {
    // ** Validate Required Fields **
    if (!newUser.firstName || !newUser.lastName || !newUser.username || !newUser.email || !newUser.password || !newUser.role) {
      setError("All fields marked with * are required.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5001/auth/register",
        newUser,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.user) {
        onUserCreated(response.data.user); // Update state
        setNewUser({ username: "", email: "", password: "", role: "", lastName: "", firstName: "" });
        setError("");
        alert(response.data.message);
      } else {
        setError("User created, but no user data returned.");
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        const errorMessage = err.response.data.message;
        if (errorMessage.includes("Email already in use")) {
          setError("This email is already registered.");
        } else if (errorMessage.includes("Username is already taken")) {
          setError("This username is already taken.");
        } else if (err.response.data.message.includes("restore them")) {
          // Ask if admin wants to restore the user
          if (window.confirm(`This user was previously deleted. Do you want to restore them?`)) {
            const newRole = window.prompt("Enter a new role for this user (or leave blank to keep the same role):", newUser.role);

            await axios.post(
              `http://localhost:5001/auth/restore-user/${err.response.data.userId}`,
              { newRole: newRole || newUser.role },
              { headers: { Authorization: `Bearer ${authState.token}` } }
            );

            alert("User restored successfully!");
            setNewUser({ username: "", email: "", password: "", role: "", lastName: "", firstName: "" });
          }
        } else {
          setError(errorMessage);
        }
      } else {
        setError("Error creating user.");
      }
    }
  };


  return (
    <div className={styles.createUserContainer}>
      <h3>Create New User</h3>
      {error && <p className={styles.error}>{error}</p>}

      <div className="styles.createUserForm">
        <div className={styles.formGroup}>
          <label>First Name </label>
          <input type="text" name="firstName" value={newUser.firstName} onChange={handleInputChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>Last Name </label>
          <input type="text" name="lastName" value={newUser.lastName} onChange={handleInputChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>Username </label>
          <input type="text" name="username" value={newUser.username} onChange={handleInputChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>Email </label>
          <input type="email" name="email" value={newUser.email} onChange={handleInputChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>Password </label>
          <input type="password" name="password" value={newUser.password} onChange={handleInputChange} required />
        </div>

        <div className={styles.formGroup}>
          <label>Role </label>
          <select name="role" value={newUser.role} onChange={handleInputChange} required>
            <option value="">Select Role</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Warehouse Manager">Warehouse Manager</option>
            <option value="Warehouse Worker">Warehouse Worker</option>
            <option value="Auditor/Compliance Officer">Auditor</option>
            <option value="Delivery Agent">Delivery Agent</option>
          </select>
        </div>

        <button onClick={handleCreateUser} className={styles.createButton}>Create User</button>
      </div>
    </div>
  );
};

export default CreateUserService;
