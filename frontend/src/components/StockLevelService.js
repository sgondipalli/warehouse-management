import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import DashboardNavbar from "../components/DashboardNavbar";
import styles from "../styles/StockLevel.module.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import Papa from "papaparse";


const StockLevelService = () => {
  const [stockLevels, setStockLevels] = useState([]);
  const [locations, setLocations] = useState([]);
  const [tradeItems, setTradeItems] = useState([]);
  const [storageBins, setStorageBins] = useState([]);
  const [filteredBins, setFilteredBins] = useState([]);
  const [filterLocation, setFilterLocation] = useState("");
  const [searchGTIN, setSearchGTIN] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [newStock, setNewStock] = useState({ TradeItemID: "", LocationID: "", StorageBinID: "", Quantity: 0 });
  const [editId, setEditId] = useState(null);

  const BASE_URL = "http://localhost:5020/api";
  const BIN_BASE = "http://localhost:5030/api";


  const fetchStockLevels = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/stocklevel`, {
        params: filterLocation ? { locationId: filterLocation } : {},
      });
      setStockLevels(response.data.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching stock levels", err);
      setStockLevels([]);
      setError(err.response?.data?.message || "Failed to fetch stock levels");
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/locations/dropdown`);
      setLocations(res.data || []);
    } catch (err) {
      console.error("Error fetching locations", err);
      setLocations([]);
    }
  };

  const fetchTradeItems = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/stocklevel/tradeitems/dropdown`);
      setTradeItems(res.data || []);
    } catch (err) {
      console.error("Error fetching trade items", err);
      setTradeItems([]);
    }
  };

  // const fetchStorageBins = async () => {
  //   try {
  //     const res = await axios.get(`${BASE_URL}/bins/dropdown`);
  //     setStorageBins(res.data || []);
  //   } catch (err) {
  //     console.error("Error fetching bins", err);
  //     setStorageBins([]);
  //   }
  // };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setNewStock({ ...newStock, [name]: value });

    if (name === "LocationID") {
      try {
        const res = await axios.get(`${BIN_BASE}/bins/location/${value}`);
        setFilteredBins(res.data || []);
        setNewStock((prev) => ({ ...prev, StorageBinID: "" }));
      } catch (err) {
        console.error("Failed to fetch bins by location", err);
        setFilteredBins([]);
      }
    }
  };

  const handleCreateStock = async () => {
    if (!newStock.TradeItemID || !newStock.LocationID || !newStock.StorageBinID) {
      return setMessage("All fields including Storage Bin are required.");
    }
    try {
      await axios.post(`${BASE_URL}/stocklevel`, newStock);
      setMessage("Stock level created successfully.");
      setNewStock({ TradeItemID: "", LocationID: "", StorageBinID: "", Quantity: 0 });
      fetchStockLevels();
    } catch (err) {
      console.error("Error creating stock level", err);
      setMessage("Failed to create stock level");
    }
  };

  const handleEditStock = async (item) => {
    setNewStock({
      TradeItemID: item.TradeItemID,
      LocationID: item.LocationID,
      StorageBinID: item.StorageBinID || "",
      Quantity: item.Quantity,
    });
    setEditId(item.StockLevelID);

    if (item.LocationID) {
      try {
        const res = await axios.get(`${BASE_URL}/bins/location/${item.LocationID}`);
        setFilteredBins(res.data || []);
      } catch (err) {
        console.error("Failed to fetch bins by location during edit", err);
      }
    }
  };

  const handleUpdateStock = async () => {
    try {
      await axios.put(`${BASE_URL}/stocklevel/${editId}`, newStock);
      setMessage("Stock level updated successfully.");
      setEditId(null);
      setNewStock({ TradeItemID: "", LocationID: "", StorageBinID: "", Quantity: 0 });
      fetchStockLevels();
    } catch (err) {
      console.error("Error updating stock level", err);
      setMessage("Failed to update stock level");
    }
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock level?")) return;
    try {
      await axios.delete(`${BASE_URL}/stocklevel/${id}`);
      setMessage("Stock level deleted successfully.");
      fetchStockLevels();
    } catch (err) {
      console.error("Error deleting stock level", err);
      setMessage("Failed to delete stock level");
    }
  };
  const exportToCSV = () => {
    const csv = Papa.unparse(
      filteredStocks.map(item => ({
        GTIN: item.TradeItem?.GTIN || "—",
        MaterialNumber: item.TradeItem?.MaterialNumber || "—",
        TradeItemID: item.TradeItemID,
        Category: item.TradeItem?.TradeItemCategory || "—",
        Location: item.Location?.LocationName || "—",
        Bin: `${item.StorageBin?.Shelf?.Rack?.Zone?.ZoneName || "—"} > ${item.StorageBin?.Shelf?.Rack?.RackNumber || "—"} > ${item.StorageBin?.Shelf?.ShelfNumber || "—"} > ${item.StorageBin?.BinNumber || "—"}`,
        Quantity: item.Quantity,
        LastUpdated: new Date(item.LastUpdated).toLocaleString()
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "stock_levels.csv");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["GTIN", "Material Number", "TradeItem ID", "Category", "Location", "Bin", "Quantity", "Last Updated"]],
      body: filteredStocks.map(item => [
        item.TradeItem?.GTIN || "—",
        item.TradeItem?.MaterialNumber || "—",
        item.TradeItemID,
        item.TradeItem?.TradeItemCategory || "—",
        item.Location?.LocationName || "—",
        `${item.StorageBin?.Shelf?.Rack?.Zone?.ZoneName || "—"} > ${item.StorageBin?.Shelf?.Rack?.RackNumber || "—"} > ${item.StorageBin?.Shelf?.ShelfNumber || "—"} > ${item.StorageBin?.BinNumber || "—"}`,
        item.Quantity,
        new Date(item.LastUpdated).toLocaleString(),
      ]),
    });
    doc.save("stock_levels.pdf");
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setNewStock({ TradeItemID: "", LocationID: "", StorageBinID: "", Quantity: 0 });
    setMessage("");
  };

  useEffect(() => {
    fetchLocations();
    fetchTradeItems();
    // fetchStorageBins();
  }, []);

  useEffect(() => {
    fetchStockLevels();
  }, [filterLocation]);

  const filteredStocks = stockLevels.filter(item => {
    const matchGTIN = item.TradeItem?.GTIN?.toLowerCase().includes(searchGTIN.toLowerCase());
    const matchCategory = item.TradeItem?.TradeItemCategory?.toLowerCase().includes(searchCategory.toLowerCase());
    return matchGTIN && matchCategory;
  });

  return (
    <div className={styles.stockWrapper}>
      <DashboardNavbar />
      <div className={styles.contentWrapper}>
        <Sidebar />

        <div className={styles.container}>
          <h2>Stock Levels</h2>

          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <label htmlFor="locationFilter">Filter by Location:</label>
              <select
                id="locationFilter"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc.LocationID} value={loc.LocationID}>
                    {loc.LocationName}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="gtinSearch">Search by GTIN:</label>
              <input
                type="text"
                id="gtinSearch"
                value={searchGTIN}
                onChange={(e) => setSearchGTIN(e.target.value)}
                placeholder="Enter GTIN"
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="categorySearch">Search by Category:</label>
              <input
                type="text"
                id="categorySearch"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                placeholder="Enter Category"
              />
            </div>
          </div>


          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.success}>{message}</p>}

          <div className={styles.formContainer}>
            <h3 className={styles.formHeader}>{editId ? "Edit Stock Level" : "Add New Stock Level"}</h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Trade Item</label>
                <select
                  name="TradeItemID"
                  value={newStock.TradeItemID}
                  onChange={handleInputChange}
                >
                  <option value="">Select Trade Item</option>
                  {tradeItems.map((item) => (
                    <option key={item.TradeItemID} value={item.TradeItemID}>
                      {item.MaterialNumber} ({item.GTIN})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Location</label>
                <select
                  name="LocationID"
                  value={newStock.LocationID}
                  onChange={handleInputChange}
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.LocationID} value={loc.LocationID}>
                      {loc.LocationName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Storage Bin</label>
                <select name="StorageBinID" value={newStock.StorageBinID} onChange={handleInputChange} disabled={!newStock.LocationID}>
                  <option value="">Select Bin</option>
                  {filteredBins.map(bin => (
                    <option key={bin.id} value={bin.id}>{bin.label || bin.BinNumber}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Quantity</label>
                <input
                  type="number"
                  name="Quantity"
                  value={newStock.Quantity}
                  onChange={handleInputChange}
                  min="0"
                  placeholder="Enter quantity"
                />
              </div>
            </div>
            <div className={styles.formActions}>
              {editId ? (
                <button className={styles.submitBtn} onClick={handleUpdateStock}>Update</button>
              ) : (
                <button className={styles.submitBtn} onClick={handleCreateStock}>Create</button>
              )}
              <button
                className={styles.clearBtn}
                onClick={() => {
                  setNewStock({ TradeItemID: "", LocationID: "", StorageBinID: "", Quantity: 0 });
                  setEditId(null);
                  setMessage("");
                }}
              >
                Clear
              </button>
            </div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <button className={styles.exportBtn} onClick={exportToCSV}>Export to CSV</button>
            <button className={styles.exportBtn} onClick={exportToPDF}>Export to PDF</button>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.stockTable}>
              <thead>
                <tr>
                  <th>GTIN</th>
                  <th>Material Number</th>
                  <th>Trade Item ID</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Bin</th>
                  <th>Quantity</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((item) => (
                    <tr key={item.StockLevelID}>
                      <td>{item.TradeItem?.GTIN || "—"}</td>
                      <td>{item.TradeItem?.MaterialNumber || "—"}</td>
                      <td>{item.TradeItemID}</td>
                      <td>{item.TradeItem?.TradeItemCategory || "—"}</td>
                      <td>{item.Location?.LocationName || "—"}</td>
                      <td>
                        {item.StorageBin?.Shelf?.Rack?.Zone?.ZoneName || "—"} &gt;{" "}
                        {item.StorageBin?.Shelf?.Rack?.RackNumber || "—"} &gt;{" "}
                        {item.StorageBin?.Shelf?.ShelfNumber || "—"} &gt;{" "}
                        {item.StorageBin?.BinNumber || "—"}
                      </td>


                      <td>{item.Quantity}</td>
                      <td>{new Date(item.LastUpdated).toLocaleString()}</td>
                      <td>
                        <button onClick={() => handleEditStock(item)}>Edit</button>
                        <button onClick={() => handleDeleteStock(item.StockLevelID)}>Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9">No stock levels available.</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="6" style={{ fontWeight: "bold" }}>Total Quantity</td>
                  <td colSpan="3" style={{ fontWeight: "bold" }}>
                    {filteredStocks.reduce((acc, cur) => acc + cur.Quantity, 0)}
                  </td>
                </tr>
              </tfoot>

            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockLevelService;
