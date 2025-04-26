import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/ManageUserService.module.css";

const BASE_URL_API = "http://localhost:5001/auth";

const ManageUserService = () => {
  const { authState } = useAuth();
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL_API}/users`, {
          headers: { Authorization: `Bearer ${authState.token}` },
        });
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching users.");
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await axios.get("http://localhost:5030/api/locations/dropdown", {
          headers: { Authorization: `Bearer ${authState.token}` },
        });
        setLocations(response.data);
      } catch (err) {
        console.error("Failed to fetch location dropdown:", err);
      }
    };

    fetchUsers();
    fetchLocations();
  }, [authState.token]);

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${BASE_URL_API}/delete-user/${id}`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      setUsers(users.map(user => user.id === id ? { ...user, isDeleted: true } : user));
      alert("User marked as deleted.");
    } catch (err) {
      console.error("Error deleting user.");
    }
  };

  const handleRestoreUser = async (user) => {
    const newRole = prompt("Enter a new role (or leave blank to keep the same):", user.role);
    if (!newRole) return;

    let locationIds = [];
    if (newRole !== "Super Admin") {
      const selectedLocations = window.prompt(
        `Enter comma-separated Location IDs to assign to this ${newRole} (e.g., 1,2):`
      );
      locationIds = selectedLocations
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
    }

    try {
      await axios.post(
        `${BASE_URL_API}/restore-user/${user.id}`,
        { newRole, locationIds },
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );

      setUsers(users.map(u => u.id === user.id ? { ...u, isDeleted: false, role: newRole || user.role } : u));
      alert("User restored successfully.");
    } catch (err) {
      console.error("Error restoring user.");
      alert("Restore failed: " + (err?.response?.data?.message || "Unknown error"));
    }
  };

  const handleUpdateUser = async (id, updatedRole) => {
    try {
      await axios.put(
        `${BASE_URL_API}/update-user/${id}`,
        { role: updatedRole },
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      setUsers(users.map(user => user.id === id ? { ...user, role: updatedRole } : user));
      setEditingUser(null);
      alert("User role updated successfully.");
    } catch (err) {
      console.error("Error updating user role.");
    }
  };

  const filteredUsers = users.filter((user) =>
    (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterRole ? user.role === filterRole : true)
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  return (
    <div className={styles.manageUserContainer}>
      <h3>Manage Users</h3>

      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="🔍 Search users..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className={styles.roleFilter}
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="Super Admin">Super Admin</option>
          <option value="Warehouse Manager">Warehouse Manager</option>
          <option value="Warehouse Worker">Warehouse Worker</option>
          <option value="Auditor/Compliance Officer">Auditor</option>
          <option value="Delivery Agent">Delivery Agent</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Assigned Locations</th>
              <th>Status</th>
              <th>Actions</th>

            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id} className={user.isDeleted ? styles.deletedUser : ""}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  {editingUser?.id === user.id ? (
                    <select value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
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
                  {user.locations && user.locations.length > 0 ? (
                    <div className={styles.locationBadges}>
                      {user.locations.map((loc, index) => (
                        <span key={index} className={styles.badge}>
                          {loc}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className={styles.noLocation}>N/A</span>
                  )}
                </td>
                <td>{user.isDeleted ? "Inactive (Deleted)" : "Active"}</td>
                <td>
                  {editingUser?.id === user.id ? (
                    <button onClick={() => handleUpdateUser(user.id, editingUser.role)} className={styles.updateButton}>Save</button>
                  ) : (
                    <button onClick={() => setEditingUser(user)} className={styles.updateButton}>Update</button>
                  )}
                  {user.isDeleted ? (
                    <button onClick={() => handleRestoreUser(user)} className={styles.restoreButton}>Restore</button>
                  ) : (
                    <button onClick={() => handleDeleteUser(user.id)} className={styles.deleteButton}>Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={styles.paginationButton}
        >
          ◀ Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? styles.activePage : styles.paginationButton}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={styles.paginationButton}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
};

export default ManageUserService;
