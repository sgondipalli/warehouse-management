import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/ManageUsers.module.css";

const BASE_URL_API = "http://localhost:5001/auth";

const ManageUsers = () => {
  const { authState } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "" });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL_API}/users`, {
          headers: { Authorization: `Bearer ${authState.token}` },
        });
        setUsers(response.data);
      } catch (err) {
        setError("Error fetching users.");
      }
    };
    fetchUsers();
  }, [authState.token]);

  // ** Handle Delete User **
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL_API}/delete-user/${id}`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      setUsers(users.filter(user => user.id !== id));
    } catch (err) {
      setError("Error deleting user.");
    }
  };

  // ** Handle Update User **
  const handleUpdate = async (id, updatedRole) => {
    try {
      await axios.put(
        `${BASE_URL_API}/update-user/${id}`,
        { role: updatedRole },
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      setUsers(users.map(user => (user.id === id ? { ...user, role: updatedRole } : user)));
    } catch (err) {
      setError("Error updating user role.");
    }
  };

  // ** Handle Create New User **
  const handleCreateUser = async () => {
    try {
      const response = await axios.post(`${BASE_URL_API}/register`, newUser, {
        headers: { Authorization: `Bearer ${authState.token}`, "Content-Type": "application/json" },
      });
  
      // Ensure the response contains the user object
      if (response.data && response.data.userId) {
        const createdUser = {
          id: response.data.userId,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role, // Ensure role is assigned correctly
        };
  
        setUsers([...users, createdUser]); // Add new user to state
        setNewUser({ username: "", email: "", password: "", role: "" }); // Clear form fields
        setError(""); // Clear previous errors if any
  
        // ✅ Show success message
        alert("User registered successfully!");
      } else {
        setError("User created, but no user data returned.");
      }
    } catch (err) {
      if (err.response && err.response.status === 400 && err.response.data.message === "User already exists") {
        setError("User already exists."); // ✅ Show a user-friendly message
      } else {
        setError("Error creating user. Please try again.");
      }
    }
  };
  
  

  return (
    <div className={styles.manageUsersContainer}>
      <h1>User Management</h1>
      {error && <p className={styles.error}>{error}</p>}

      {/* Create User Form */}
      <div className={styles.createUserForm}>
        <h2>Create New User</h2>
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="">Select Role</option>
          <option value="Super Admin">Super Admin</option>
          <option value="Warehouse Manager">Warehouse Manager</option>
          <option value="Warehouse Worker">Warehouse Worker</option>
          <option value="Auditor/Compliance Officer">Auditor</option>
          <option value="Delivery Agent">Delivery Agent</option>
        </select>
        <button onClick={handleCreateUser} className={styles.createButton}>
          Create User
        </button>
      </div>

      {/* User Table */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                {editingUser?.id === user.id ? (
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Warehouse Manager">Warehouse Manager</option>
                    <option value="Warehouse Worker">Warehouse Worker</option>
                    <option value="Auditor/Compliance Officer">Auditor</option>
                    <option value="Delivery Agent">Delivery Agent</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td>
                {editingUser?.id === user.id ? (
                  <button onClick={() => handleUpdate(user.id, editingUser.role)} className={styles.updateButton}>
                    Save
                  </button>
                ) : (
                  <button onClick={() => setEditingUser(user)} className={styles.updateButton}>
                    Update
                  </button>
                )}
                <button onClick={() => handleDelete(user.id)} className={styles.deleteButton}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};

export default ManageUsers;
