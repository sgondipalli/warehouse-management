import React, { useState } from "react";
import axios from "axios";
import styles from "../styles/CreateLocation.module.css";

const CreateLocation = () => {
  const [form, setForm] = useState({
    LocationName: "",
    LocationNumber: "",
    LocationType: "",
    GLN: "",
    GLN_Extension: "",
    AddressTable: {
      Street: "",
      HouseNumber: "",
      City: "",
      PostalCode: "",
      Country: "",
      Region: ""
    },
  });


  const [createOnlyAddress, setCreateOnlyAddress] = useState(false);
  const [message, setMessage] = useState("");

  const BASE_LOCATION_URL = "http://localhost:5030/api/locations";
  const BASE_ADDRESS_URL = "http://localhost:5030/api/addresses";

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name in form.AddressTable) {
      setForm({
        ...form,
        AddressTable: { ...form.AddressTable, [name]: value },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleToggle = (e) => {
    setCreateOnlyAddress(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (createOnlyAddress) {
        // Only address creation
        const res = await axios.post(BASE_ADDRESS_URL, form.AddressTable);
        setMessage("✅ Address created successfully.");
      } else {
        // Full location + address creation
        const res = await axios.post(BASE_LOCATION_URL, form);
        setMessage("✅ Location and address created successfully.");
      }

      // Reset form
      setForm({
        LocationName: "",
        LocationNumber: "",
        LocationType: "",
        GLN: "",
        GLN_Extension: "",
        AddressTable: {
          City: "",
          Region: "",
          Country: "",
          PostalCode: "",
        },
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || "❌ Failed to create record.";
      alert(errMsg);
      setMessage(errMsg);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2>{createOnlyAddress ? "Create Address Only" : "Create New Location"}</h2>

      {message && <p className={styles.message}>{message}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.toggleRow}>
          <label>
            <input type="checkbox" checked={createOnlyAddress} onChange={handleToggle} />
            Create Address Only (skip Location)
          </label>
        </div>

        {!createOnlyAddress && (
          <>
            <h4>Location Details</h4>
            <input name="LocationName" placeholder="Location Name" value={form.LocationName} onChange={handleChange} required />
            <input name="LocationNumber" placeholder="Location Number" value={form.LocationNumber} onChange={handleChange} />
            <input name="LocationType" placeholder="Location Type" value={form.LocationType} onChange={handleChange} />
            <input name="GLN" placeholder="GLN" value={form.GLN} onChange={handleChange} />
            <input name="GLN_Extension" placeholder="GLN Extension" value={form.GLN_Extension} onChange={handleChange} />
          </>
        )}

        <h4>Address Details</h4>
        <input name="Street" placeholder="Street" value={form.AddressTable.Street || ""} onChange={handleChange} required />
        <input name="HouseNumber" placeholder="House Number" value={form.AddressTable.HouseNumber || ""} onChange={handleChange} required />
        <input name="City" placeholder="City" value={form.AddressTable.City || ""} onChange={handleChange} required />
        <input name="PostalCode" placeholder="Postal Code" value={form.AddressTable.PostalCode || ""} onChange={handleChange} required />
        <input name="Country" placeholder="Country" value={form.AddressTable.Country || ""} onChange={handleChange} required />
        <input name="Region" placeholder="Region" value={form.AddressTable.Region || ""} onChange={handleChange} required />

        <button type="submit">{createOnlyAddress ? "Create Address" : "Create Location"}</button>
      </form>
    </div>
  );
};

export default CreateLocation;
