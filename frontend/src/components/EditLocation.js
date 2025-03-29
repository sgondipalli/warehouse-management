import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/EditLocation.module.css";

const EditLocation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    LocationNumber: "",
    LocationName: "",
    LocationType: "",
    GLN: "",
    GLN_Extension: "",
    Street: "",
    HouseNumber: "",
    City: "",
    PostalCode: "",
    Country: "",
    Region: "",
  });
  const [message, setMessage] = useState("");

  const BASE_URL = `http://localhost:5030/api/locations/${id}`;

  const fetchLocation = async () => {
    try {
      const res = await axios.get(BASE_URL);
      const data = res.data;
      setForm({
        LocationNumber: data.LocationNumber || "",
        LocationName: data.LocationName || "",
        LocationType: data.LocationType || "",
        GLN: data.GLN || "",
        GLN_Extension: data.GLN_Extension || "",
        Street: data.AddressTable?.Street || "",
        HouseNumber: data.AddressTable?.HouseNumber || "",
        City: data.AddressTable?.City || "",
        PostalCode: data.AddressTable?.PostalCode || "",
        Country: data.AddressTable?.Country || "",
        Region: data.AddressTable?.Region || "",
      });
    } catch (err) {
      console.error("Error fetching location", err);
      setMessage("Failed to load location");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      LocationNumber: form.LocationNumber,
      LocationName: form.LocationName,
      LocationType: form.LocationType,
      GLN: form.GLN,
      GLN_Extension: form.GLN_Extension,
      AddressTable: {
        Street: form.Street,
        HouseNumber: form.HouseNumber,
        City: form.City,
        PostalCode: form.PostalCode,
        Country: form.Country,
        Region: form.Region,
      }
    };

    try {
      await axios.put(BASE_URL, payload);
      setMessage("Location updated successfully.");
      navigate("/locations");
    } catch (err) {
      console.error("Update failed", err);
      setMessage("Failed to update location");
    }
  };

  useEffect(() => {
    fetchLocation();
  }, [id]);

  return (
    <div className={styles.wrapper}>
      <h2>Edit Location</h2>
      {message && <p className={styles.message}>{message}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h4>Location Info</h4>
          <input name="LocationNumber" placeholder="Location Number" value={form.LocationNumber} onChange={handleChange} required />
          <input name="LocationName" placeholder="Location Name" value={form.LocationName} onChange={handleChange} required />
          <input name="LocationType" placeholder="Location Type" value={form.LocationType} onChange={handleChange} required />
          <input name="GLN" placeholder="GLN" value={form.GLN} onChange={handleChange} />
          <input name="GLN_Extension" placeholder="GLN Extension" value={form.GLN_Extension} onChange={handleChange} />
        </div>

        <div className={styles.section}>
          <h4>Address Info</h4>
          <input name="Street" placeholder="Street" value={form.Street} onChange={handleChange} required />
          <input name="HouseNumber" placeholder="House Number" value={form.HouseNumber} onChange={handleChange} required />
          <input name="City" placeholder="City" value={form.City} onChange={handleChange} required />
          <input name="PostalCode" placeholder="Postal Code" value={form.PostalCode} onChange={handleChange} required />
          <input name="Country" placeholder="Country" value={form.Country} onChange={handleChange} required />
          <input name="Region" placeholder="Region" value={form.Region} onChange={handleChange} required />
        </div>

        <div className={styles.actions}>
          <button type="submit">Update</button>
          <button type="button" onClick={() => navigate("/locations")}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditLocation;
