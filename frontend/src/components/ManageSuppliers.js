import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/Supplier.module.css";
import { useAuth } from "../context/AuthContext"; // 🆕 Import auth

const BASE_URL = "http://localhost:5040/api/suppliers";

const ManageSuppliers = () => {
  const { authState } = useAuth(); // 🆕 Get authState for token
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ SupplierName: "", ContactEmail: "", PhoneNumber: "" });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // 🆕 Handle loading state

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(BASE_URL, {
        headers: { Authorization: `Bearer ${authState.token}` }, // 🆕 Attach token
      });
      setSuppliers(res.data || []);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        // Update Supplier
        await axios.put(`${BASE_URL}/${editId}`, form, {
          headers: { Authorization: `Bearer ${authState.token}` },
        });
        setMessage("Supplier updated successfully");
      } else {
        // Create New Supplier
        await axios.post(BASE_URL, form, {
          headers: { Authorization: `Bearer ${authState.token}` },
        });
        setMessage("Supplier created successfully");
      }
      setForm({ SupplierName: "", ContactEmail: "", PhoneNumber: "" });
      setEditId(null);
      fetchSuppliers();
    } catch (err) {
      console.error("Submit error", err);
      setMessage("Operation failed: " + (err.response?.data?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier) => {
    setEditId(supplier.SupplierID);
    setForm({
      SupplierName: supplier.SupplierName,
      ContactEmail: supplier.ContactEmail || "",
      PhoneNumber: supplier.PhoneNumber || ""
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await axios.delete(`${BASE_URL}/${id}`, {
          headers: { Authorization: `Bearer ${authState.token}` },
        });
        setMessage("Supplier deleted successfully");
        fetchSuppliers();
      } catch (err) {
        console.error("Delete error", err);
        setMessage("Delete failed: " + (err.response?.data?.message || "Unknown error"));
      }
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return (
    <div className={styles.wrapper}>
      <h2>Manage Suppliers</h2>
      {message && <p className={styles.message}>{message}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          name="SupplierName"
          placeholder="Supplier Name"
          value={form.SupplierName}
          onChange={handleChange}
          required
        />
        <input
          name="ContactEmail"
          placeholder="Contact Email"
          value={form.ContactEmail}
          onChange={handleChange}
        />
        <input
          name="PhoneNumber"
          placeholder="Phone Number"
          value={form.PhoneNumber}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>
          {editId ? (loading ? "Updating..." : "Update") : (loading ? "Creating..." : "Create")}
        </button>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Supplier Name</th>
            <th>Contact Email</th>
            <th>Phone</th>
            {/* <th>CreatedBy (optional future)</th> */}
            {/* <th>UpdatedBy (optional future)</th> */}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((supplier) => (
            <tr key={supplier.SupplierID}>
              <td>{supplier.SupplierID}</td>
              <td>{supplier.SupplierName}</td>
              <td>{supplier.ContactEmail || "—"}</td>
              <td>{supplier.PhoneNumber || "—"}</td>
              {/* <td>{supplier.CreatedByUserID || "—"}</td> */}
              {/* <td>{supplier.UpdatedByUserID || "—"}</td> */}
              <td>
                <button onClick={() => handleEdit(supplier)}>Edit</button>
                <button onClick={() => handleDelete(supplier.SupplierID)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageSuppliers;
