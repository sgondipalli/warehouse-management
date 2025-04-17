import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/InboundPage.module.css";

const INBOUND_BASE = "http://localhost:5040/api";
const TRADEITEM_BASE = "http://localhost:5010/api";
const BIN_BASE = "http://localhost:5030/api";
const SUPPLIER_BASE = "http://localhost:5040/api/suppliers/dropdown/list";

const InboundPage = () => {
  const [form, setForm] = useState({
    TradeItemID: "",
    StorageBinID: "",
    ReceivedQuantity: "",
    BatchNumber: "",
    SupplierID: "",
    DeliveryDocument: "",
    Remarks: ""
  });

  const [inbounds, setInbounds] = useState([]);
  const [tradeItems, setTradeItems] = useState([]);
  const [bins, setBins] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchDropdowns = async () => {
    const [tradeItemRes, binRes, supplierRes] = await Promise.all([
      axios.get(`${TRADEITEM_BASE}/trade-items/dropdown`),
      axios.get(`${BIN_BASE}/bins/dropdown/list`),
      axios.get(SUPPLIER_BASE)
    ]);
    setTradeItems(tradeItemRes.data || []);
    setBins(binRes.data || []);
    setSuppliers(supplierRes.data || []);
  };

  const fetchInbounds = async () => {
    try {
      const res = await axios.get(`${INBOUND_BASE}/inbounds`);
      setInbounds(res.data || []);
    } catch (err) {
      console.error("Failed to fetch inbounds", err);
    }
  };

  const autoGenerateBatch = () => {
    const now = new Date();
    return `BATCH-${form.TradeItemID}-${now.getFullYear()}${now.getMonth() + 1}${now.getDate()}-${now.getTime()}`;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        await axios.put(`${INBOUND_BASE}/inbounds/${editId}`, payload);
        setMessage("✅ Inbound record updated successfully");
      } else {
        await axios.post(`${INBOUND_BASE}/inbounds`, payload);
        setMessage("✅ Inbound record created successfully");
      }
      setForm({
        TradeItemID: "",
        StorageBinID: "",
        ReceivedQuantity: "",
        BatchNumber: "",
        SupplierID: "",
        DeliveryDocument: "",
        Remarks: ""
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
      Remarks: record.Remarks
    });
    setEditId(record.InboundID);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this inbound record?")) return;
    try {
      await axios.delete(`${INBOUND_BASE}/inbounds/${id}`);
      setMessage("✅ Inbound deleted");
      fetchInbounds();
    } catch (err) {
      console.error("Delete error", err);
      setMessage("❌ Failed to delete inbound");
    }
  };

  useEffect(() => {
    fetchDropdowns();
    fetchInbounds();
  }, []);

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

        <select name="StorageBinID" value={form.StorageBinID} onChange={handleChange} required>
          <option value="">Select Storage Bin</option>
          {bins.map((bin) => (
            <option key={bin.id} value={bin.id}>
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
              <td>{i.StorageBin?.BinNumber}</td>
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
