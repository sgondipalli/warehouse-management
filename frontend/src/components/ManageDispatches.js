import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/ManageDispatches.module.css";
import DispatchSummary from "./DispatchSummary";

const ManageDispatches = () => {
  const { authState } = useAuth();
  const token = authState?.token;

  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [assignModal, setAssignModal] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ VehicleID: "", DeliveryAgentID: "" });

  useEffect(() => {
    if (token) fetchDispatches();
  }, [token]);

  const fetchDispatches = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5050/api/outbounds/dispatches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDispatches(res.data || []);
    } catch (err) {
      console.error("Failed to load dispatches", err);
      setMessage("❌ Failed to load dispatches.");
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async (dispatch) => {
    setAssignModal(dispatch);
    setForm({ VehicleID: "", DeliveryAgentID: "" });

    try {
      const date = dispatch.DispatchDate.split("T")[0];
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [vehicleRes, agentRes] = await Promise.all([
        axios.get(`http://localhost:5050/api/vehicles/available?date=${date}`, config),
        axios.get(`http://localhost:5001/auth/available-delivery-agents?date=${date}&sourceLocationId=${dispatch.SourceWarehouseID}`, config)
      ]);

      setVehicles(vehicleRes.data || []);
      setAgents(agentRes.data || []);
    } catch (err) {
      console.error("Error loading assign modal options", err);
    }
  };

  const handleAssignSubmit = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(
        `http://localhost:5050/api/outbounds/assign/${assignModal.DispatchID}`,
        form,
        config
      );
      setAssignModal(null);
      fetchDispatches();
    } catch (err) {
      console.error("Failed to assign final leg", err);
      alert("❌ Failed to assign final leg dispatch.");
    }
  };

  return (
    <div className={styles.container}>
      <h2>📦 Manage Dispatches</h2>
      <DispatchSummary />

      {loading ? (
        <p>Loading dispatches...</p>
      ) : (
        <table className={styles.dispatchTable}>
          <thead>
            <tr>
              <th>Dispatch ID</th>
              <th>Order Item</th>
              <th>Vehicle</th>
              <th>Agent</th>
              <th>Dispatch Date</th>
              <th>Status</th>
              <th>Final Leg</th>
              <th>Parent Dispatch</th>
              <th>Customer</th>
              <th>Remarks</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.map((d) => (
              <tr key={d.DispatchID}>
                <td>{d.DispatchID}</td>
                <td>Order #{d.OrderItem?.OrderID} - TI #{d.OrderItem?.TradeItemID}</td>
                <td>{d.Vehicle?.VehicleNumber || "—"}</td>
                <td>
                  {d.DeliveryAgent
                    ? `${d.DeliveryAgent.firstName} ${d.DeliveryAgent.lastName}`
                    : "Unassigned"}
                </td>
                <td>{new Date(d.DispatchDate).toLocaleDateString()}</td>
                <td>{d.Status}</td>
                <td>{d.IsFinalLeg ? "✅" : "❌"}</td>
                <td>{d.ParentDispatchID ? `#${d.ParentDispatchID}` : "—"}</td>
                <td>
                  {d.CustomerName ? (
                    <>
                      <strong>{d.CustomerName}</strong>
                      <br />
                      {d.CustomerAddress}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{d.Remarks || "—"}</td>
                <td>
                  {d.IsFinalLeg && !d.Vehicle && !d.DeliveryAgent && (
                    <button
                      className={styles.assignBtn}
                      onClick={() => openAssignModal(d)}
                    >
                      Assign
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {assignModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>🚛 Assign Final-Leg Dispatch #{assignModal.DispatchID}</h3>
            <label>Vehicle:</label>
            <select
              value={form.VehicleID}
              onChange={(e) => setForm({ ...form, VehicleID: e.target.value })}
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.VehicleID} value={v.VehicleID}>
                  {v.VehicleNumber} ({v.VehicleType})
                </option>
              ))}
            </select>

            <label>Delivery Agent:</label>
            <select
              value={form.DeliveryAgentID}
              onChange={(e) => setForm({ ...form, DeliveryAgentID: e.target.value })}
            >
              <option value="">Select Agent</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.firstName} {a.lastName}
                </option>
              ))}
            </select>

            <div className={styles.modalActions}>
              <button onClick={handleAssignSubmit}> Assign</button>
              <button onClick={() => setAssignModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default ManageDispatches;