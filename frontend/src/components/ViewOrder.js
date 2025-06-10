import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const ViewOrder = ({ orderId, onClose }) => {
  const { authState } = useAuth();
  const token = authState?.token;

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`http://localhost:5050/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrder(response.data);
      } catch (err) {
        console.error("Failed to fetch order", err);
        setError("❌ Failed to load order details");
      }
    };

    if (orderId && token) {
      fetchOrder();
    }
  }, [orderId, token]);

  if (error) return <p>{error}</p>;
  if (!order) return <p>Loading order details...</p>;

  return (
    <div>
      <h3>Order #{order.OrderID}</h3>
      <p><strong>Customer:</strong> {order.CustomerName}</p>
      <p><strong>Address:</strong> {order.CustomerAddress}</p>
      <p><strong>Status:</strong> {order.Status}</p>
      <p><strong>Created By:</strong> {order.CreatedBy?.email || "N/A"}</p>
      <p><strong>Source Warehouse:</strong> {order.SourceWarehouseID || "N/A"}</p>
      <p><strong>Destination Warehouse:</strong> {order.DestinationWarehouseID || "N/A"}</p>

      <h4>Items:</h4>
      <ul>
        {order.Items?.map((item) => (
          <li key={item.OrderItemID}>
            Trade Item #{item.TradeItemID} - Quantity: {item.Quantity}
          </li>
        ))}
      </ul>

      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default ViewOrder;
