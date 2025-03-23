import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../styles/CreateForm.module.css"; // Reuse the same styling

const EditTradeItemService = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    MaterialNumber: "",
    UnitOfMeasure: "",
    TradeItemDescription: "",
    SerializationType: "",
    ProfileRelevantCountry: "",
    TradeItemCategory: "",
  });

  const [dropdowns, setDropdowns] = useState({
    countries: [],
    units: [],
    serializations: [],
    categories: [],
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchDropdowns = async () => {
      const [countryRes, uomRes, serRes, catRes] = await Promise.all([
        axios.get("http://localhost:5010/api/master/countries"),
        axios.get("http://localhost:5010/api/master/units"),
        axios.get("http://localhost:5010/api/master/serialization-types"),
        axios.get("http://localhost:5010/api/master/categories"),
      ]);
      setDropdowns({
        countries: countryRes.data,
        units: uomRes.data,
        serializations: serRes.data,
        categories: catRes.data,
      });
    };

    const fetchTradeItem = async () => {
      const res = await axios.get(`http://localhost:5010/api/trade-items/${id}`);
      setFormData(res.data);
    };

    fetchDropdowns();
    fetchTradeItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5010/api/trade-items/${id}`, formData);
      setSuccess("Trade Item updated successfully!");
      setError("");
      setTimeout(() => navigate("/manage-trade-items"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setSuccess("");
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Edit Trade Item</h2>
      <form onSubmit={handleUpdate} className={styles.createForm}>
        <label className={styles.label}>Material Number*</label>
        <input
          type="text"
          name="MaterialNumber"
          value={formData.MaterialNumber}
          onChange={handleChange}
          className={styles.input}
          required
        />

        <label className={styles.label}>Unit Of Measure*</label>
        <select
          name="UnitOfMeasure"
          value={formData.UnitOfMeasure}
          onChange={handleChange}
          className={styles.select}
          required
        >
          <option value="">--Select--</option>
          {dropdowns.units.map((unit) => (
            <option key={unit.UOMCode} value={unit.UOMCode}>
              {unit.UOMDescription} ({unit.UOMCode})
            </option>
          ))}
        </select>

        <label className={styles.label}>Trade Item Description*</label>
        <textarea
          name="TradeItemDescription"
          value={formData.TradeItemDescription}
          onChange={handleChange}
          className={styles.textarea}
          required
        />

        <label className={styles.label}>Serialization Type</label>
        <select
          name="SerializationType"
          value={formData.SerializationType}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="">--Select--</option>
          {dropdowns.serializations.map((ser) => (
            <option key={ser.TypeCode} value={ser.TypeCode}>
              {ser.TypeDescription} ({ser.TypeCode})
            </option>
          ))}
        </select>

        <label className={styles.label}>Profile Relevant Country</label>
        <select
          name="ProfileRelevantCountry"
          value={formData.ProfileRelevantCountry}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="">--Select--</option>
          {dropdowns.countries.map((country) => (
            <option key={country.ISOCode} value={country.ISOCode}>
              {country.CountryName} ({country.ISOCode})
            </option>
          ))}
        </select>

        <label className={styles.label}>Trade Item Category</label>
        <select
          name="TradeItemCategory"
          value={formData.TradeItemCategory}
          onChange={handleChange}
          className={styles.select}
        >
          <option value="">--Select--</option>
          {dropdowns.categories.map((cat) => (
            <option key={cat.CategoryCode} value={cat.CategoryCode}>
              {cat.CategoryDescription} ({cat.CategoryCode})
            </option>
          ))}
        </select>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}

        <button type="submit" className={styles.submitButton}>Update Trade Item</button>
      </form>
    </div>
  );
};

export default EditTradeItemService;