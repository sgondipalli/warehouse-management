import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/Supplier.module.css";

const BASE_URL = "http://localhost:5040/api/suppliers";

const ManageSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ SupplierName: "", ContactEmail: "", PhoneNumber: "" });
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(BASE_URL);
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
    try {
      if (editId) {
        await axios.put(`${BASE_URL}/${editId}`, form);
        setMessage("Updated successfully");
      } else {
        // Soft-undelete logic
        const { data: existing } = await axios.get(BASE_URL);
        const duplicate = existing.find(
          s => s.SupplierName === form.SupplierName &&
               s.ContactEmail === form.ContactEmail &&
               s.PhoneNumber === form.PhoneNumber &&
               s.isDeleted === true
        );

        if (duplicate) {
          await axios.put(`${BASE_URL}/${duplicate.SupplierID}`, { ...form, isDeleted: false });
          setMessage("Reactivated existing supplier");
        } else {
          await axios.post(BASE_URL, form);
          setMessage("Created successfully");
        }
      }
      setForm({ SupplierName: "", ContactEmail: "", PhoneNumber: "" });
      setEditId(null);
      fetchSuppliers();
    } catch (err) {
      console.error("Submit error", err);
      setMessage("Operation failed");
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
    if (window.confirm("Are you sure?")) {
      try {
        await axios.delete(`${BASE_URL}/${id}`);
        setMessage("Deleted successfully");
        fetchSuppliers();
      } catch (err) {
        console.error("Delete error", err);
        setMessage("Delete failed");
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
          placeholder="Name"
          value={form.SupplierName}
          onChange={handleChange}
          required
        />
        <input
          name="ContactEmail"
          placeholder="Email"
          value={form.ContactEmail}
          onChange={handleChange}
        />
        <input
          name="PhoneNumber"
          placeholder="Phone"
          value={form.PhoneNumber}
          onChange={handleChange}
        />
        <button type="submit">{editId ? "Update" : "Create"}</button>
      </form>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.SupplierID}>
              <td>{s.SupplierID}</td>
              <td>{s.SupplierName}</td>
              <td>{s.ContactEmail || "—"}</td>
              <td>{s.PhoneNumber || "—"}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Edit</button>
                <button onClick={() => handleDelete(s.SupplierID)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageSuppliers;
