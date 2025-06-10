// components/VehicleService.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/VehicleService.module.css";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "http://localhost:5050/api";

const VehicleService = () => {
    const { authState } = useAuth();
    const token = authState?.token;
    const [vehicles, setVehicles] = useState([]);
    const [form, setForm] = useState({
        VehicleNumber: "",
        VehicleType: "",
        DriverName: "",
        ContactNumber: "",
        Capacity: "",
        Status: "AVAILABLE",
    });
    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchVehicles();
    }, [token]);

    const fetchVehicles = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/vehicles`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setVehicles(res.data);
        } catch (err) {
            console.error("Fetch error", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (editId) {
                await axios.put(`${BASE_URL}/vehicles/${editId}`, form, config);
                setMessage("✅ Vehicle updated.");
            } else {
                await axios.post(`${BASE_URL}/vehicles`, form, config);
                setMessage("✅ Vehicle added.");
            }
            setForm({ VehicleNumber: "", DriverName: "", ContactNumber: "", Capacity: "", Status: "AVAILABLE" });
            setEditId(null);
            fetchVehicles();
        } catch (err) {
            console.error("Save failed", err);
            setMessage("❌ Failed to save vehicle.");
        }
    };

    const handleEdit = (v) => {
        setEditId(v.VehicleID);
        setForm({
            VehicleNumber: v.VehicleNumber,
            VehicleType: v.VehicleType,
            DriverName: v.DriverName,
            ContactNumber: v.ContactNumber,
            Capacity: v.Capacity,
            Status: v.Status,
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this vehicle?")) return;
        try {
            await axios.delete(`${BASE_URL}/vehicles/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage("✅ Vehicle deleted.");
            fetchVehicles();
        } catch (err) {
            console.error("Delete error", err);
            setMessage("❌ Failed to delete.");
        }
    };

    return (
        <div className={styles.container}>
            <h2>Vehicle Management</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
                <input type="text" name="VehicleNumber" value={form.VehicleNumber} onChange={handleChange} placeholder="Vehicle Number" required />
                <select name="VehicleType" value={form.VehicleType} onChange={handleChange} required>
                    <option value="">Select Vehicle Type</option>
                    <option value="Truck">Truck</option>
                    <option value="Van">Van</option>
                    <option value="Bike">Bike</option>
                    <option value="Container">Container</option>
                </select>

                <input type="text" name="DriverName" value={form.DriverName} onChange={handleChange} placeholder="Driver Name" required />
                <input type="text" name="ContactNumber" value={form.ContactNumber} onChange={handleChange} placeholder="Contact Number" required />
                <input type="number" name="Capacity" value={form.Capacity} onChange={handleChange} placeholder="Capacity" />
                <select name="Status" value={form.Status} onChange={handleChange}>
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="IN_USE">IN USE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
                <button type="submit">{editId ? "Update" : "Create"}</button>
            </form>

            {message && <p className={styles.message}>{message}</p>}

            <h3>Vehicle List</h3>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Vehicle</th>
                        <th>Type</th>
                        <th>Driver</th>
                        <th>Contact</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {vehicles.map((v) => (
                        <tr key={v.VehicleID}>
                            <td>{v.VehicleID}</td>
                            <td>{v.VehicleNumber}</td>
                            <td>{v.VehicleType}</td>
                            <td>{v.DriverName}</td>
                            <td>{v.ContactNumber}</td>
                            <td>{v.Capacity || "-"}</td>
                            <td>{v.Status}</td>
                            <td>
                                <button onClick={() => handleEdit(v)}>Edit</button>
                                <button onClick={() => handleDelete(v.VehicleID)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VehicleService;
