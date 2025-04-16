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
  const [editBinId, setEditBinId] = useState(null);
  const [editMaxCapacity, setEditMaxCapacity] = useState("");

  const BASE_URL = "http://localhost:5030/api";

  const fetchLocations = async () => {
    const res = await axios.get(`${BASE_URL}/locations/dropdown`);
    setLocations(res.data || []);
  };

  const fetchZones = async (locationId) => {
    if (!locationId) return;
    try {
      const res = await axios.get(`${BASE_URL}/zones/hierarchy?locationId=${locationId}`);
      setZones(res.data || []);
    } catch (error) {
      console.error("Failed to fetch full hierarchy", error);
    }
  };

  const handleLocationChange = async (e) => {
    const locationId = parseInt(e.target.value);
    setSelectedLocation(locationId);
    setZones([]);
    if (locationId) await fetchZones(locationId);
    console.log("Selected:", selectedLocation, typeof selectedLocation);
    console.log("Zone LocationID:", zones.map(z => [z.ZoneName, z.LocationID, typeof z.LocationID]));

  };

  const handleEdit = (bin, type) => {
    if (type === 'bin') {
      setEditBinId(bin.id);
      setEditMaxCapacity(bin.MaxCapacity.toString());
    }
  };

  const handleSaveMaxCapacity = async () => {
    try {
      await axios.put(`${BASE_URL}/bins/${editBinId}`, {
        MaxCapacity: parseInt(editMaxCapacity),
      });
      setEditBinId(null);
      setEditMaxCapacity("");
      setMessage("✅ Bin updated successfully");
      fetchZones(selectedLocation);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update max capacity");
    }
  };



  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    const endpointMap = {
      zone: 'zones',
      rack: 'racks',
      shelf: 'shelves',
      bin: 'bins'
    };

    try {
      await axios.delete(`${BASE_URL}/${endpointMap[type]}/${id}`);
      setMessage(`${type} deleted successfully`);
      fetchZones(selectedLocation); // Refresh hierarchy
    } catch (err) {
      console.error("Delete error:", err);
      alert(`Failed to delete ${type}`);
    }
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

      {zones.map((zone) => (
        <div key={zone.ZoneID} className={styles.zoneBox}>
          <strong>Zone: {zone.ZoneName}</strong>
          <button onClick={() => handleDelete(zone.ZoneID, 'zone')}>Delete</button>

          {zone.Racks?.map((rack) => (
            <div key={rack.RackID} className={styles.rackBox}>
              └ Rack: {rack.RackNumber}
              <button onClick={() => handleDelete(rack.RackID, 'rack')}>Delete</button>

              {rack.Shelves?.map((shelf) => (
                <div key={shelf.ShelfID} className={styles.shelfBox}>
                  &nbsp;&nbsp; └ Shelf: {shelf.ShelfNumber}
                  <button onClick={() => handleDelete(shelf.ShelfID, 'shelf')}>Delete</button>

                  {shelf.StorageBins?.map((bin) => (
                    <div key={bin.id} className={styles.binBox}>
                      &nbsp;&nbsp;&nbsp;&nbsp; └ <strong>Bin:</strong> {bin.BinNumber} &nbsp;

                      {editBinId === bin.id ? (
                        <>
                          <input
                            type="number"
                            value={editMaxCapacity}
                            onChange={(e) => setEditMaxCapacity(e.target.value)}
                            style={{ width: "80px", marginRight: "8px" }}
                          />
                          <button onClick={handleSaveMaxCapacity}>Save</button>
                          <button onClick={() => setEditBinId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          (Stock: {bin.CurrentStock}/{bin.MaxCapacity}){" "}
                          <button onClick={() => handleEdit(bin, "bin")}>Edit</button>
                          <button onClick={() => handleDelete(bin.id, "bin")}>Delete</button>
                        </>
                      )}
                    </div>
                  ))}

                </div>
              ))}
            </div>
          ))}
        </div>
      ))}



    </div>
  );
};

export default ZoneRackShelfBin;
