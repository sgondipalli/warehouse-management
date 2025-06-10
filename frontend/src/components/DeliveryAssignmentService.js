import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/DeliveryAssignmentService.module.css";
import { useAuth } from "../context/AuthContext";

const DeliveryAssignmentService = () => {
  const { authState } = useAuth();
  const token = authState?.token;

  const [assignments, setAssignments] = useState([]);
  const [outbounds, setOutbounds] = useState([]);
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({
    DispatchID: "",
    DeliveryAgentID: "",
    Status: "Assigned",
    Remarks: "",
  });

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [dispatchRes, agentRes, assignmentRes] = await Promise.all([
        axios.get("http://localhost:5060/api/outbounds/dropdown", config),
        axios.get("http://localhost:5010/api/users/delivery-agents", config),
        axios.get("http://localhost:5050/api/delivery-assignments", config),
      ]);

      setOutbounds(dispatchRes.data);
      setAgents(agentRes.data);
      setAssignments(assignmentRes.data);
    } catch (err) {
      console.error("Error fetching data for delivery assignment", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5050/api/delivery-assignments", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ DispatchID: "", DeliveryAgentID: "", Status: "Assigned", Remarks: "" });
      fetchData();
    } catch (err) {
      console.error("Error assigning delivery", err);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  return (
    <div className={styles.wrapper}>
      <h2>Assign Delivery Agent</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <select name="DispatchID" value={form.DispatchID} onChange={handleChange} required>
          <option value="">Select Outbound Dispatch</option>
          {outbounds.map((o) => (
            <option key={o.DispatchID} value={o.DispatchID}>
              Dispatch #{o.DispatchID}
            </option>
          ))}
        </select>

        <select name="DeliveryAgentID" value={form.DeliveryAgentID} onChange={handleChange} required>
          <option value="">Select Delivery Agent</option>
          {agents.map((a) => (
            <option key={a.id} value={a.id}>
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
          type="text"
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
            <th>Assignment ID</th>
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
              <td>{a.DispatchID}</td>
              <td>{a.DeliveryAgent?.firstName} {a.DeliveryAgent?.lastName}</td>
              <td>{a.Status}</td>
              <td>{a.Remarks || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeliveryAssignmentService;
