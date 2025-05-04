import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/InboundPage.module.css";
import { useAuth } from "../context/AuthContext";

const INBOUND_BASE = "http://localhost:5040/api";
const TRADEITEM_BASE = "http://localhost:5010/api";
const BIN_BASE = "http://localhost:5030/api";
const SUPPLIER_BASE = "http://localhost:5040/api/suppliers/dropdown/list";

const InboundPage = () => {
    const { authState } = useAuth();
    const userId = authState?.user?.id;

    const [form, setForm] = useState({
        TradeItemID: "",
        StorageBinID: "",
        ReceivedQuantity: "",
        BatchNumber: "",
        SupplierID: "",
        DeliveryDocument: "",
        Remarks: "",
        LocationID: ""
    });

    const [inbounds, setInbounds] = useState([]);
    const [tradeItems, setTradeItems] = useState([]);
    const [bins, setBins] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [locations, setLocations] = useState([]);
    const [message, setMessage] = useState("");
    const [editId, setEditId] = useState(null);

    const fetchDropdowns = async () => {
        if (!userId) return;
        const [tradeItemRes, supplierRes, locationRes] = await Promise.all([
            axios.get(`${TRADEITEM_BASE}/trade-items/dropdown`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            }),
            axios.get(SUPPLIER_BASE, {
                headers: { Authorization: `Bearer ${authState.token}` },
            }),
            axios.get(`${INBOUND_BASE}/inbounds/accessible-locations/${userId}`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            }),
        ]);
        setTradeItems(tradeItemRes.data || []);
        setSuppliers(supplierRes.data || []);
        setLocations(locationRes.data || []);
    };

    const fetchAllBins = async () => {
        try {
            const res = await axios.get(`${BIN_BASE}/bins/dropdown/list`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            setBins(res.data || []);
        } catch (err) {
            console.error("Failed to fetch all bins", err);
        }
    };

    const fetchBinsByLocation = async (locationId) => {
        if (!locationId) return setBins([]);
        try {
            const res = await axios.get(`${BIN_BASE}/bins/location/${locationId}`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            setBins(res.data || []);
        } catch (err) {
            console.error("Error fetching bins by location", err);
        }
    };

    const fetchInbounds = async () => {
        try {
            const res = await axios.get(`${INBOUND_BASE}/inbounds`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            const inboundsWithLabels = res.data.map((inbound) => {
                const bin = bins.find((b) => b.id === inbound.StorageBinID);
                return {
                    ...inbound,
                    SelectedBinLabel: bin?.label || inbound.StorageBin?.BinNumber || "-"
                };
            });
            setInbounds(inboundsWithLabels);
        } catch (err) {
            console.error("Failed to fetch inbounds", err);
        }
    };

    const autoGenerateBatch = () => {
        const now = new Date();
        return `BATCH-${form.TradeItemID}-${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}-${now.getTime()}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = ["StorageBinID", "TradeItemID", "SupplierID", "LocationID"].includes(name)
            ? parseInt(value, 10)
            : value;

        setForm({ ...form, [name]: parsedValue });

        if (name === "LocationID") {
            fetchBinsByLocation(value);
            setForm((prev) => ({ ...prev, StorageBinID: "" }));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        const payload = {
            ...form,
            BatchNumber: form.BatchNumber || autoGenerateBatch()
        };
        try {
            if (editId) {
                await axios.put(`${INBOUND_BASE}/inbounds/${editId}`, payload, {
                    headers: { Authorization: `Bearer ${authState.token}` },
                });
                setMessage("✅ Inbound record updated successfully");
            } else {
                await axios.post(`${INBOUND_BASE}/inbounds`, payload, {
                    headers: { Authorization: `Bearer ${authState.token}` },
                });
                setMessage("✅ Inbound record created successfully");
            }
            setForm({
                TradeItemID: "",
                StorageBinID: "",
                ReceivedQuantity: "",
                BatchNumber: "",
                SupplierID: "",
                DeliveryDocument: "",
                Remarks: "",
                LocationID: ""
            });
            setEditId(null);
            fetchInbounds();
        } catch (err) {
            console.error("Error submitting inbound", err);
            setMessage("❌ Failed to submit inbound");
        }
    };

    const handleEdit = (record) => {
        setForm({
            TradeItemID: record.TradeItemID,
            StorageBinID: record.StorageBinID,
            ReceivedQuantity: record.ReceivedQuantity,
            BatchNumber: record.BatchNumber,
            SupplierID: record.SupplierID,
            DeliveryDocument: record.DeliveryDocument,
            Remarks: record.Remarks,
            LocationID: record.LocationID,
        });
        setEditId(record.InboundID);
        fetchBinsByLocation(record.LocationID);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure to delete this inbound record?")) return;
        try {
            await axios.delete(`${INBOUND_BASE}/inbounds/${id}`, {
                headers: { Authorization: `Bearer ${authState.token}` },
            });
            setMessage("✅ Inbound deleted");
            fetchInbounds();
        } catch (err) {
            console.error("Delete error", err);
            setMessage("❌ Failed to delete inbound");
        }
    };

    useEffect(() => {
        if (userId) {
            fetchDropdowns();
            fetchInbounds();
            fetchAllBins();
        }
    }, [userId]);

    return (
        <div className={styles.wrapper}>
            <h2>Inbound Goods</h2>
            {message && <p className={styles.message}>{message}</p>}

            <form onSubmit={handleSubmit} className={styles.form}>
                <select name="TradeItemID" value={form.TradeItemID} onChange={handleChange} required>
                    <option value="">Select Trade Item</option>
                    {tradeItems.map((ti) => (
                        <option key={ti.TradeItemID} value={ti.TradeItemID}>
                            {ti.MaterialNumber} - {ti.GTIN}
                        </option>
                    ))}
                </select>

                <select name="LocationID" value={form.LocationID} onChange={handleChange} required>
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                        <option key={loc.LocationID} value={loc.LocationID}>
                            {loc.LocationName}
                        </option>
                    ))}
                </select>

                <select name="StorageBinID" value={form.StorageBinID} onChange={handleChange} required disabled={!form.LocationID}>
                    <option value="">Select Storage Bin</option>
                    {bins.map((bin) => (
                        <option key={bin.BinID} value={bin.BinID}>
                            {bin.label || bin.BinNumber}
                        </option>
                    ))}
                </select>

                <input
                    name="ReceivedQuantity"
                    type="number"
                    placeholder="Received Quantity"
                    value={form.ReceivedQuantity}
                    onChange={handleChange}
                    required
                />
                <input name="BatchNumber" placeholder="Batch Number (Optional)" value={form.BatchNumber} onChange={handleChange} />

                <select name="SupplierID" value={form.SupplierID} onChange={handleChange} required>
                    <option value="">Select Supplier</option>
                    {suppliers.map((supplier) => (
                        <option key={supplier.SupplierID} value={supplier.SupplierID}>
                            {supplier.SupplierName}
                        </option>
                    ))}
                </select>

                <input name="DeliveryDocument" placeholder="Delivery Document (filename/url)" value={form.DeliveryDocument} onChange={handleChange} />
                <input name="Remarks" placeholder="Remarks" value={form.Remarks} onChange={handleChange} />
                <button type="submit">{editId ? "Update Inbound" : "Create Inbound"}</button>
            </form>

            <h3>Inbound History</h3>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Trade Item</th>
                        <th>Location</th>
                        <th>Bin</th>
                        <th>Qty</th>
                        <th>Batch</th>
                        <th>Supplier</th>
                        <th>Received</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {inbounds.map((i) => (
                        <tr key={i.InboundID}>
                            <td>{i.InboundID}</td>
                            <td>{i.TradeItem?.MaterialNumber}</td>
                            <td>{i.Location?.LocationName || "-"}</td>
                            <td>{i.SelectedBinLabel || "-"}</td>
                            <td>{i.ReceivedQuantity}</td>
                            <td>{i.BatchNumber}</td>
                            <td>{i.Supplier?.SupplierName}</td>
                            <td>{new Date(i.ReceivedAt).toLocaleDateString()}</td>
                            <td>
                                <button onClick={() => handleEdit(i)}>Edit</button>
                                <button onClick={() => handleDelete(i.InboundID)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default InboundPage;
