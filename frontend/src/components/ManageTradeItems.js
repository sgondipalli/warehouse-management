import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/ManageItems.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ManageTradeItems = () => {
  const [tradeItems, setTradeItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { authState } = useAuth();
  const navigate = useNavigate();

  const fetchTradeItems = async (page = 1, status = "") => {
    try {
      const queryParams = status ? `?page=${page}&limit=10&status=${status}` : `?page=${page}&limit=10`;
      const res = await axios.get(`http://localhost:5010/api/trade-items${queryParams}`, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });
      setTradeItems(res.data.data);
      setTotalPages(res.data.totalPages);
      setPage(parseInt(res.data.currentPage));
    } catch (err) {
      console.error("Error fetching trade items", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Trade Item?")) return;
    try {
      await axios.delete(`http://localhost:5010/api/trade-items/${id}`, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });
      setMessage("Trade Item deleted successfully!");
      fetchTradeItems(page);
    } catch (err) {
      console.error("Delete failed", err);
      setMessage("Failed to delete trade item.");
    }
  };

  const handleToggleStatus = async (item) => {
    const newStatus = item.Status === "Active" ? "Inactive" : "Active";
    try {
      await axios.put(
        `http://localhost:5010/api/trade-items/${item.TradeItemID}`,
        { Status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );
      setMessage(`Trade Item status changed to ${newStatus}!`);
      fetchTradeItems(page, statusFilter);
    } catch (err) {
      console.error("Status toggle failed", err);
      setMessage("Failed to change status.");
    }
  };

  useEffect(() => {
    fetchTradeItems(page, statusFilter);
  }, [statusFilter]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Manage Trade Items</h2>
      {message && <p className={styles.message}>{message}</p>}

      <div style={{ marginBottom: "10px" }}>
        <label>Status: </label>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>GTIN</th>
            <th>Material Number</th>
            <th>Unit</th>
            <th>Description</th>
            <th>Serialization</th>
            <th>Countries</th>
            <th>Suppliers</th>
            <th>Category</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tradeItems.length > 0 ? tradeItems.map((item) => (
            <tr key={item.TradeItemID}>
              <td>{item.GTIN}</td>
              <td>{item.MaterialNumber}</td>
              <td>{item.UnitOfMeasure}</td>
              <td>{item.TradeItemDescription}</td>
              <td>{item.SerializationType}</td>
              <td>{item.Countries?.map(c => c.CountryName).join(", ") || "-"}</td>
              <td>
                {item.TradeItemSuppliers?.map(ts => ts.Supplier?.SupplierName).join(", ") || "-"}
              </td>

              <td>{item.TradeItemCategory}</td>
              <td>{item.Status}</td>
              <td className={styles.actionCell}>
                <button onClick={() => navigate(`/edit-trade-item/${item.TradeItemID}`)} className={styles.editBtn}>Edit</button>
                <button onClick={() => handleDelete(item.TradeItemID)} className={styles.deleteBtn}>Delete</button>
                <button onClick={() => handleToggleStatus(item)} className={styles.statusBtn}>
                  {item.Status === "Active" ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="10">No trade items found.</td></tr>
          )}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button onClick={() => fetchTradeItems(page - 1)} disabled={page <= 1}>Prev</button>
        <span> Page {page} of {totalPages} </span>
        <button onClick={() => fetchTradeItems(page + 1)} disabled={page >= totalPages}>Next</button>
      </div>
    </div>
  );
};

export default ManageTradeItems;
