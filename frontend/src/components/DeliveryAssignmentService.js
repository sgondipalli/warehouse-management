import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/DeliveryAssignmentService.module.css";
import { useAuth } from "../context/AuthContext";

const DeliveryAssignmentService = () => {
  const { authState } = useAuth();
  const token = authState?.token;

  const [dispatches, setDispatches] = useState([]);
  const [agents, setAgents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({
    DispatchID: "",
    DeliveryAgentID: "",
    Status: "Assigned",
    Remarks: "",
  });

  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = async () => {
    try {
      const [dispatchRes, assignmentRes] = await Promise.all([
        axios.get("http://localhost:5050/api/delivery-assignments/dispatches-to-assign", config),
        axios.get("http://localhost:5050/api/delivery-assignments", config),
      ]);
      setDispatches(dispatchRes.data);
      setAssignments(assignmentRes.data);
    } catch (err) {
      console.error("Error loading data", err);
    }
  };

  const fetchAgents = async (dispatchId) => {
    const selected = dispatches.find((d) => d.DispatchID === parseInt(dispatchId));
    if (!selected) return;

    const date = selected.DispatchDate?.split("T")[0];
    const sourceLocation = selected.SourceWarehouseID;
    try {
      const agentRes = await axios.get(
        `http://localhost:5001/auth/available-delivery-agents?date=${date}&sourceLocationId=${sourceLocation}`,
        config
      );
      setAgents(agentRes.data);
    } catch (err) {
      console.error("Error fetching agents", err);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "DispatchID") await fetchAgents(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5050/api/delivery-assignments", form, config);
      setForm({ DispatchID: "", DeliveryAgentID: "", Status: "Assigned", Remarks: "" });
      setAgents([]);
      fetchData();
    } catch (err) {
      console.error("Error assigning delivery", err);
      alert("❌ Failed to assign delivery.");
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  return (
    <div className={styles.wrapper}>
      <h2>Assign Delivery Agent to Final-Leg Dispatch</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <select name="DispatchID" value={form.DispatchID} onChange={handleChange} required>
          <option value="">Select Dispatch</option>
          {dispatches.map((d) => (
            <option key={d.DispatchID} value={d.DispatchID}>
              Dispatch #{d.DispatchID} - Order #{d.OrderItem?.OrderID}
            </option>
          ))}
        </select>

        <select
          name="DeliveryAgentID"
          value={form.DeliveryAgentID}
          onChange={handleChange}
          required
          disabled={!form.DispatchID}
        >
          <option value="">Select Delivery Agent</option>
          {agents.map((a) => (
            <option key={a.userId || a.id} value={a.userId || a.id}>
              {a.firstName} {a.lastName}
            </option>
          ))}
        </select>

        <select name="Status" value={form.Status} onChange={handleChange}>
          <option value="Assigned">Assigned</option>
          <option value="In Transit">In Transit</option>
          <option value="Delivered">Delivered</option>
        </select>

        <input
          name="Remarks"
          placeholder="Remarks (optional)"
          value={form.Remarks}
          onChange={handleChange}
        />

        <button type="submit">Assign Delivery</button>
      </form>

      <h3>Delivery Assignments</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Dispatch</th>
            <th>Agent</th>
            <th>Status</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((a) => (
            <tr key={a.AssignmentID}>
              <td>{a.AssignmentID}</td>
              <td>#{a.DispatchID}</td>
              <td>
                {a.DeliveryAgent?.firstName} {a.DeliveryAgent?.lastName}
              </td>
              <td>{a.Status}</td>
              <td>{a.Remarks || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveryAssignmentService;
