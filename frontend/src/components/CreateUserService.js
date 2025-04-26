import React, { useState, useEffect } from "react";
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
    locationIds: [],
  });
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState("");

  const clearForm = () => {
    setNewUser({
      username: "",
      email: "",
      password: "",
      role: "",
      firstName: "",
      lastName: "",
      locationIds: [],
    });
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get("http://localhost:5030/api/locations/dropdown", {
          headers: { Authorization: `Bearer ${authState.token}` },
        });
        setLocations(res.data);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };

    fetchLocations();
  }, [authState.token]);

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (e) => {
    const options = Array.from(e.target.selectedOptions);
    const values = options.map((o) => parseInt(o.value));
    setNewUser({ ...newUser, locationIds: values });
  };

  const handleCreateUser = async () => {
    const { username, email, password, role, firstName, lastName, locationIds } = newUser;

    if (!username || !email || !password || !role || !firstName || !lastName) {
      setError("All fields marked with * are required.");
      return;
    }

    if (role !== "Super Admin" && (!Array.isArray(locationIds) || locationIds.length === 0)) {
      setError("Please assign at least one location.");
      return;
    }

    const payload = {
      ...newUser,
      locationIds: role === "Super Admin" ? [] : locationIds,
    };

    try {
      const response = await axios.post("http://localhost:5001/auth/register", payload, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.user) {
        if (typeof onUserCreated === "function") {
          onUserCreated(response.data.user);
        }
        alert(response.data.message || "User created successfully!");
        clearForm();
        setError("");
      } else {
        setError("User created, but no user data returned.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error creating user.";
      const userIdToRestore = err.response?.data?.userId;

      if (errorMessage.includes("Allowing rejoin") && userIdToRestore) {
        const confirmRestore = window.confirm("This user was previously deleted. Do you want to restore them?");
        if (confirmRestore) {
          const newRole = window.prompt("Enter a new role for this user (or leave blank to keep the same role):", role);
          try {
            await axios.post(
              `http://localhost:5001/auth/restore-user/${err.response.data.userId}`,
              {
                newRole: newRole || newUser.role,
                locationIds: role === "Super Admin" ? [] : newUser.locationIds,
              },
              {
                headers: { Authorization: `Bearer ${authState.token}` },
              }
            );
            alert("User restored successfully!");
            clearForm();
            setError("");
          } catch (restoreErr) {
            console.error("Error restoring user:", restoreErr);
            setError("Failed to restore user.");
          }
        }
      } else {
        setError(errorMessage);
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
          <input type="text" name="firstName" value={newUser.firstName} onChange={handleInputChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Last Name </label>
          <input type="text" name="lastName" value={newUser.lastName} onChange={handleInputChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Username </label>
          <input type="text" name="username" value={newUser.username} onChange={handleInputChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Email </label>
          <input type="email" name="email" value={newUser.email} onChange={handleInputChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Password </label>
          <input type="password" name="password" value={newUser.password} onChange={handleInputChange} />
        </div>

        <div className={styles.formGroup}>
          <label>Role </label>
          <select name="role" value={newUser.role} onChange={handleInputChange}>
            <option value="">Select Role</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Warehouse Manager">Warehouse Manager</option>
            <option value="Warehouse Worker">Warehouse Worker</option>
            <option value="Auditor/Compliance Officer">Auditor</option>
            <option value="Delivery Agent">Delivery Agent</option>
          </select>
        </div>

        {newUser.role && newUser.role !== "Super Admin" && (
          <div className={styles.formGroup}>
            <label>Assign Locations *</label>
            <select
              name="locationIds"
              multiple
              value={newUser.locationIds}
              onChange={handleLocationChange}
            >
              {locations.map((loc) => (
                <option key={loc.LocationID} value={loc.LocationID}>
                  {loc.LocationName} ({loc.City})
                </option>
              ))}
            </select>
          </div>
        )}

        <button onClick={handleCreateUser} className={styles.createButton}>Create User</button>
      </div>
    </div>
  );
};

export default CreateUserService;
