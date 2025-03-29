import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/ManageLocations.module.css";

const ManageLocations = () => {
  const [locations, setLocations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({ locationType: "", region: "", city: "" });
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5030/api/locations";

  const fetchLocations = async () => {
    try {
      const response = await axios.get(BASE_URL, {
        params: { page, limit: 10, ...filters }
      });
      setLocations(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error fetching locations", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this location?")) return;
    try {
      await axios.delete(`${BASE_URL}/${id}`);
      setMessage("Location deleted successfully.");
      fetchLocations();
    } catch (err) {
      console.error("Failed to delete location", err);
      setMessage("Error deleting location.");
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    fetchLocations();
  }, [page, filters]);

  return (
    <div className={styles.wrapper}>
      <h2>Manage Locations</h2>

      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.filterRow}>
        <input name="locationType" placeholder="Filter by Type" value={filters.locationType} onChange={handleFilterChange} />
        <input name="region" placeholder="Filter by Region" value={filters.region} onChange={handleFilterChange} />
        <input name="city" placeholder="Filter by City" value={filters.city} onChange={handleFilterChange} />
        <button onClick={() => navigate("/locations/create")}>+ Add Location</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>GLN</th>
            <th>City</th>
            <th>Region</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc.LocationID}>
              <td>{loc.LocationID}</td>
              <td>{loc.LocationName}</td>
              <td>{loc.LocationType}</td>
              <td>{loc.GLN || "—"}</td>
              <td>{loc.AddressTable?.City || "—"}</td>
              <td>{loc.AddressTable?.Region || "—"}</td>
              <td>
                <button onClick={() => navigate(`/locations/edit/${loc.LocationID}`)}>Edit</button>
                <button onClick={() => handleDelete(loc.LocationID)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );
};

export default ManageLocations;
