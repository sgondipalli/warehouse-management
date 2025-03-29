import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../styles/ZoneRackShelfBin.module.css";

const ZoneRackShelfBin = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({
    ZoneName: "",
    RackNumber: "",
    ShelfNumber: "",
    BinNumber: "",
    MaxCapacity: "",
    CurrentStock: ""
  });
  const [message, setMessage] = useState("");
  const BASE_URL = "http://localhost:5030/api";

  const fetchLocations = async () => {
    const res = await axios.get(`${BASE_URL}/locations/dropdown`);
    setLocations(res.data || []);
  };

  const fetchZones = async (locationId) => {
    if (!locationId) return;
    const res = await axios.get(`${BASE_URL}/zones?locationId=${locationId}`);
    setZones(res.data || []);
  };

  const handleLocationChange = async (e) => {
    const locationId = parseInt(e.target.value);
    setSelectedLocation(locationId);
    setZones([]);
    if (locationId) await fetchZones(locationId);
    console.log("Selected:", selectedLocation, typeof selectedLocation);
    console.log("Zone LocationID:", zones.map(z => [z.ZoneName, z.LocationID, typeof z.LocationID]));

  };


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Reset message on submit

    try {
      const zoneRes = await axios.post(`${BASE_URL}/zones`, {
        ZoneName: form.ZoneName,
        LocationID: selectedLocation,
      });
      const zoneId = zoneRes.data.data.ZoneID;

      const rackRes = await axios.post(`${BASE_URL}/racks`, {
        RackNumber: form.RackNumber,
        ZoneID: zoneId,
      });
      const rackId = rackRes.data.data.RackID;

      const shelfRes = await axios.post(`${BASE_URL}/shelves`, {
        ShelfNumber: form.ShelfNumber,
        RackID: rackId,
      });
      const shelfId = shelfRes.data.data.ShelfID;

      await axios.post(`${BASE_URL}/bins`, {
        BinNumber: form.BinNumber,
        MaxCapacity: parseInt(form.MaxCapacity),
        CurrentStock: parseInt(form.CurrentStock),
        LocationID: selectedLocation,
        ZoneID: zoneId,
        RackID: rackId,
        ShelfID: shelfId,
      });

      setMessage("✅ Bin structure created successfully.");
      setForm({
        ZoneName: "",
        RackNumber: "",
        ShelfNumber: "",
        BinNumber: "",
        MaxCapacity: "",
        CurrentStock: ""
      });
      fetchZones(selectedLocation);
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Error creating bin structure";
      alert("❌ " + errMsg); // Show popup
      setMessage(errMsg); // Optionally display in the UI as well
      console.error("Error:", err);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className={styles.wrapper}>
      <h2>Manage Storage Bins</h2>

      {message && (
        <div className={styles.messageBox}>
          <strong>{message}</strong>
        </div>
      )}

      <div className={styles.formGroup}>
        <label>Select Location:</label>
        <select value={selectedLocation} onChange={handleLocationChange}>
          <option value="">Select</option>
          {locations.map((loc) => (
            <option key={loc.LocationID} value={loc.LocationID}>{loc.LocationName} - {loc.City}</option>
          ))}
        </select>

      </div>


      {selectedLocation && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h4>Create Bin Structure</h4>
          <input name="ZoneName" placeholder="Zone Name" value={form.ZoneName} onChange={handleChange} required />
          <input name="RackNumber" placeholder="Rack Number" value={form.RackNumber} onChange={handleChange} required />
          <input name="ShelfNumber" placeholder="Shelf Number" value={form.ShelfNumber} onChange={handleChange} required />
          <input name="BinNumber" placeholder="Bin Number" value={form.BinNumber} onChange={handleChange} required />
          <input name="MaxCapacity" type="number" placeholder="Max Capacity" value={form.MaxCapacity} onChange={handleChange} required />
          <input name="CurrentStock" type="number" placeholder="Current Stock" value={form.CurrentStock} onChange={handleChange} required />
          <button type="submit">Create Bin</button>
        </form>
      )}

      {zones.length > 0 && (
        <div className={styles.zoneList}>
          <h4>Existing Zones & Bins</h4>
          {zones
            .filter((zone) => zone.LocationID === selectedLocation)
            .map((zone) => (
              <div key={zone.ZoneID} className={styles.zoneBox}>
                <strong>Zone: {zone.ZoneName}</strong>
              </div>
            ))}
        </div>
      )}

    </div>
  );
};

export default ZoneRackShelfBin;
