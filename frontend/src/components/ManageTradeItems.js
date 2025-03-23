import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/ManageItems.module.css"; // Create this CSS file
import { useNavigate } from "react-router-dom";

const ManageTradeItems = () => {
    const [tradeItems, setTradeItems] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const fetchTradeItems = async (page = 1) => {
        try {
            const res = await axios.get(`http://localhost:5010/api/trade-items?page=${page}&limit=10`);
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
            await axios.delete(`http://localhost:5010/api/trade-items/${id}`);
            setMessage("Trade Item deleted successfully!");
            fetchTradeItems(page);
        } catch (err) {
            console.error("Delete failed", err);
            setMessage("Failed to delete trade item.");
        }
    };

    useEffect(() => {
        fetchTradeItems();
    }, []);

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Manage Trade Items</h2>
            {message && <p className={styles.message}>{message}</p>}
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>GTIN</th>
                        <th>Material Number</th>
                        <th>Unit</th>
                        <th>Description</th>
                        <th>Serialization</th>
                        <th>Country</th>
                        <th>Category</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tradeItems.length > 0 ? tradeItems.map(item => (
                        <tr key={item.TradeItemID}>
                            <td>{item.GTIN}</td>
                            <td>{item.MaterialNumber}</td>
                            <td>{item.UnitOfMeasure}</td>
                            <td>{item.TradeItemDescription}</td>
                            <td>{item.SerializationType}</td>
                            <td>{item.ProfileRelevantCountry}</td>
                            <td>{item.TradeItemCategory}</td>
                            <td className={styles.actionCell}>
                                <button onClick={() => navigate(`/edit-trade-item/${item.TradeItemID}`)} className={styles.editBtn}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(item.TradeItemID)} className={styles.deleteBtn}>
                                    Delete
                                </button>
                            </td>

                        </tr>
                    )) : (
                        <tr><td colSpan="8">No trade items found.</td></tr>
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
