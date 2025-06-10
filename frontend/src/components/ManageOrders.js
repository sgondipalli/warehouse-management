import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/ManageOrders.module.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ManageOrders = () => {
  const { authState } = useAuth();
  const token = authState?.token;
  const navigate = useNavigate();
  const userRoles = authState?.roles || [];

  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const isSuperAdmin = userRoles.includes("Super Admin");
  const isManager = userRoles.includes("Warehouse Manager");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5050/api/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
        setError("❌ Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchOrders();
  }, [token]);

  const handleDispatch = (orderId, sourceWarehouseId) => {
    navigate(`/outbounds?orderId=${orderId}&warehouseId=${sourceWarehouseId}`);
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await axios.delete(`http://localhost:5050/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter((o) => o.OrderID !== orderId));
    } catch (err) {
      console.error("Cancel failed", err);
      alert("❌ Failed to cancel order.");
    }
  };

  const handleView = async (orderId) => {
    try {
      const res = await axios.get(`http://localhost:5050/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedOrder(res.data);
      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch order details", err);
      alert("❌ Failed to load order details.");
    }
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <h2>📦 Manage Orders</h2>
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Customer</th>
              <th>Address</th>
              <th>Source</th>
              <th>Destination</th>
              <th>Date</th>
              <th>Status</th>
              <th>Items</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order) => (
              <tr key={order.OrderID}>
                <td>{order.OrderID}</td>
                <td>{order.DeliveryType || "N/A"}</td>
                <td>{order.CustomerName || "—"}</td>
                <td>{order.CustomerAddress || "—"}</td>
                <td>
                  {order.SourceWarehouse?.LocationName
                    ? `${order.SourceWarehouse.LocationName} (${order.SourceWarehouse?.AddressTable?.City})`
                    : "N/A"}
                </td>
                <td>
                  {order.DestinationWarehouse?.LocationName
                    ? `${order.DestinationWarehouse.LocationName} (${order.DestinationWarehouse?.AddressTable?.City})`
                    : "N/A"}
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.Status}</td>
                <td>
                  {order.Items?.map((item) => (
                    <div key={item.OrderItemID}>
                      #{item.TradeItemID} — Qty: {item.Quantity}
                    </div>
                  ))}
                </td>
                <td>
                  <button onClick={() => handleView(order.OrderID)}>View</button>
                  {(isSuperAdmin || isManager) && order.Status === "PENDING" && (
                    <button onClick={() => handleDispatch(order.OrderID, order.SourceWarehouseID)}>
                      Dispatch
                    </button>
                  )}
                  {isSuperAdmin && order.Status === "PENDING" && (
                    <button onClick={() => handleCancel(order.OrderID)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.pagination}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>⬅ Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next ➡</button>
        </div>
      </div>

      {showModal && selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3>Order Details</h3>
            <p><strong>Type:</strong> {selectedOrder.DeliveryType}</p>
            <p><strong>Customer:</strong> {selectedOrder.CustomerName || "—"}</p>
            <p><strong>Address:</strong> {selectedOrder.CustomerAddress || "—"}</p>
            <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {selectedOrder.Status}</p>
            <p><strong>Source:</strong> {selectedOrder.SourceWarehouse?.LocationName || "N/A"} ({selectedOrder.SourceWarehouse?.AddressTable?.City || "N/A"})</p>
            <p><strong>Destination:</strong> {selectedOrder.DestinationWarehouse?.LocationName || "N/A"} ({selectedOrder.DestinationWarehouse?.AddressTable?.City || "N/A"})</p>

            <div>
              <strong>Items:</strong>
              <ul>
                {selectedOrder.Items?.map(item => (
                  <li key={item.OrderItemID}>
                    TradeItem #{item.TradeItemID} — Qty: {item.Quantity}
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
