import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import styles from "../styles/OutboundDispatchService.module.css";
import { useLocation } from "react-router-dom";

const OutboundDispatchService = () => {
  const { authState } = useAuth();
  const token = authState?.token;
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get("orderId");
  const sourceWarehouseIdFromQuery = queryParams.get("warehouseId");

  const today = new Date().toISOString().split("T")[0];

  const [vehicles, setVehicles] = useState([]);
  const [agents, setAgents] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [message, setMessage] = useState("");

  const [dispatchData, setDispatchData] = useState({
    OrderItemID: "",
    VehicleID: "",
    DeliveryAgentID: "",
    SourceWarehouseID: sourceWarehouseIdFromQuery || "",
    DestinationWarehouseID: "",
    DispatchDate: today,
    Remarks: "",
    CustomerName: "",
    CustomerAddress: "",
  });

  const [deliveryType, setDeliveryType] = useState("W2W"); // W2W or W2C

  useEffect(() => {
    if (token) {
      fetchOrderData();
    }
  }, [token]);

  const fetchOrderData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:5050/api/orders/${orderId}`, config);
      const order = res.data;

      const sourceId = order.SourceWarehouseID || sourceWarehouseIdFromQuery || "";
      const destinationId = order.DestinationWarehouseID || "";

      setOrderDetails(order);
      setOrderItems(order.Items || []);
      setDispatchData(prev => ({
        ...prev,
        SourceWarehouseID: sourceId,
        DestinationWarehouseID: destinationId
      }));
      await fetchVehicles(dispatchData.DispatchDate);
      await fetchAgents(dispatchData.DispatchDate, sourceId, destinationId);
    } catch (err) {
      console.error("Failed to fetch order", err);
      setMessage("❌ Failed to load order details.");
    }
  };

  const fetchVehicles = async (date) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`http://localhost:5050/api/vehicles/available?date=${date}`, config);
      setVehicles(res.data || []);
    } catch (err) {
      console.error("Error fetching vehicles", err);
      setVehicles([]);
    }
  };

  const fetchAgents = async (date, sourceId, destinationId) => {
    try {
      const res = await axios.get(
        `http://localhost:5001/auth/available-delivery-agents?date=${date}&sourceLocationId=${sourceId}&destinationLocationId=${destinationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setAgents(res.data || []);
    } catch (err) {
      console.error("Error fetching agents", err);
      setAgents([]);
    }
  };

  const handleChange = async (field, value) => {
    const updatedData = { ...dispatchData, [field]: value };
    setDispatchData(updatedData);

    if (["DispatchDate", "SourceWarehouseID", "DestinationWarehouseID"].includes(field)) {
      const { DispatchDate, SourceWarehouseID, DestinationWarehouseID } = updatedData;
      if (DispatchDate && SourceWarehouseID && DestinationWarehouseID) {
        await fetchVehicles(DispatchDate);
        await fetchAgents(DispatchDate, SourceWarehouseID, DestinationWarehouseID);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...dispatchData,
        IsFinalLeg: deliveryType === "W2W",
        CustomerName: deliveryType === "W2C" ? dispatchData.CustomerName : null,
        CustomerAddress: deliveryType === "W2C" ? dispatchData.CustomerAddress : null,
      };

      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post("http://localhost:5050/api/outbounds", payload, config);
      setMessage("✅ Dispatch successful!");
      setDispatchData(prev => ({
        ...prev,
        OrderItemID: "",
        VehicleID: "",
        DeliveryAgentID: "",
        Remarks: "",
        CustomerName: "",
        CustomerAddress: ""
      }));
    } catch (err) {
      console.error("Dispatch failed", err);
      setMessage("❌ Dispatch failed. Check all fields.");
    }
  };

  return (
    <div className={styles.container}>
      <h2>🚚 Outbound Dispatch</h2>

      {orderDetails && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label>Delivery Type:</label>
            <select
              value={deliveryType}
              onChange={(e) => setDeliveryType(e.target.value)}
            >
              <option value="W2W">Warehouse to Warehouse</option>
              <option value="W2C">Warehouse to Customer</option>
            </select>
          </div>

          <div>
            <label>Order Item:</label>
            <select
              value={dispatchData.OrderItemID}
              onChange={(e) => handleChange("OrderItemID", e.target.value)}
              required
            >
              <option value="">Select Order Item</option>
              {orderItems.map(item => (
                <option key={item.OrderItemID} value={item.OrderItemID}>
                  TradeItem #{item.TradeItemID} (Qty: {item.Quantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Vehicle:</label>
            <select
              value={dispatchData.VehicleID}
              onChange={(e) => handleChange("VehicleID", e.target.value)}
              required
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(v => (
                <option key={v.VehicleID} value={v.VehicleID}>
                  {v.VehicleNumber} ({v.VehicleType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Delivery Agent:</label>
            <select
              value={dispatchData.DeliveryAgentID}
              onChange={(e) => handleChange("DeliveryAgentID", e.target.value)}
              required
            >
              <option value="">Select Agent</option>
              {agents.map(agent => (
                <option key={agent.userId || agent.id} value={agent.userId || agent.id}>
                  {agent.firstName} {agent.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Dispatch Date:</label>
            <input
              type="date"
              value={dispatchData.DispatchDate}
              onChange={(e) => handleChange("DispatchDate", e.target.value)}
              required
            />
          </div>

          <div>
            <label>Source Warehouse ID:</label>
            <input
              type="number"
              value={dispatchData.SourceWarehouseID}
              readOnly
            />
          </div>

          <div>
            <label>Destination Warehouse ID:</label>
            <input
              type="number"
              value={dispatchData.DestinationWarehouseID}
              onChange={(e) => handleChange("DestinationWarehouseID", e.target.value)}
              required={deliveryType === "W2W"}
            />
          </div>

          {deliveryType === "W2C" && (
            <>
              <div>
                <label>Customer Name:</label>
                <input
                  type="text"
                  value={dispatchData.CustomerName}
                  onChange={(e) => handleChange("CustomerName", e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Customer Address:</label>
                <textarea
                  value={dispatchData.CustomerAddress}
                  onChange={(e) => handleChange("CustomerAddress", e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div>
            <label>Remarks:</label>
            <textarea
              value={dispatchData.Remarks}
              onChange={(e) => handleChange("Remarks", e.target.value)}
            />
          </div>

          <button type="submit">Dispatch</button>
        </form>
      )}

      {message && <p>{message}</p>}
    </div>
  );
};

export default OutboundDispatchService;
