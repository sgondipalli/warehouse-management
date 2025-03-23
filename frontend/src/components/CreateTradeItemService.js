import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/CreateForm.module.css";
import { useNavigate } from "react-router-dom";

const CreateTradeItem = () => {
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
    serializationTypes: [],
    categories: []
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch dropdown options on component mount
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [countryRes, unitRes, typeRes, categoryRes] = await Promise.all([
          axios.get("http://localhost:5010/api/master/countries"),
          axios.get("http://localhost:5010/api/master/units"),
          axios.get("http://localhost:5010/api/master/serialization-types"),
          axios.get("http://localhost:5010/api/master/categories"),
        ]);
        setDropdowns({
          countries: countryRes.data,
          units: unitRes.data,
          serializationTypes: typeRes.data,
          categories: categoryRes.data,
        });
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
      }
    };

    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5010/api/trade-items", formData);
      setSuccess("Trade Item created successfully!");
      setError("");
      setFormData({
        MaterialNumber: "",
        UnitOfMeasure: "",
        TradeItemDescription: "",
        SerializationType: "",
        ProfileRelevantCountry: "",
        TradeItemCategory: "",
      });
      setTimeout(() => navigate("/manage-trade-items"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setSuccess("");
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Create Trade Item</h2>

      <form onSubmit={handleSubmit} className={styles.createForm}>
        <label className={styles.label}>Material Number*</label>
        <input type="text" name="MaterialNumber" value={formData.MaterialNumber} onChange={handleChange} required className={styles.input} />

        <label className={styles.label}>Unit Of Measure*</label>
        <select name="UnitOfMeasure" value={formData.UnitOfMeasure} onChange={handleChange} required className={styles.select}>
          <option value="">--Select--</option>
          {dropdowns.units.map((unit) => (
            <option key={unit.UOMID} value={unit.UOMCode}>
              {unit.UOMCode} - {unit.UOMDescription}
            </option>
          ))}
        </select>

        <label className={styles.label}>Trade Item Description*</label>
        <textarea name="TradeItemDescription" value={formData.TradeItemDescription} onChange={handleChange} required className={styles.textarea} />

        <label className={styles.label}>Serialization Type</label>
        <select name="SerializationType" value={formData.SerializationType} onChange={handleChange} className={styles.select}>
          <option value="">--Select--</option>
          {dropdowns.serializationTypes.map((type) => (
            <option key={type.SerializationTypeID} value={type.TypeCode}>
              {type.TypeCode} - {type.TypeDescription}
            </option>
          ))}
        </select>

        <label className={styles.label}>Profile Relevant Country</label>
        <select name="ProfileRelevantCountry" value={formData.ProfileRelevantCountry} onChange={handleChange} className={styles.select}>
          <option value="">--Select--</option>
          {dropdowns.countries.map((country) => (
            <option key={country.CountryID} value={country.ISOCode}>
              {country.CountryName} ({country.ISOCode})
            </option>
          ))}
        </select>

        <label className={styles.label}>Trade Item Category</label>
        <select name="TradeItemCategory" value={formData.TradeItemCategory} onChange={handleChange} className={styles.select}>
          <option value="">--Select--</option>
          {dropdowns.categories.map((cat) => (
            <option key={cat.CategoryID} value={cat.CategoryCode}>
              {cat.CategoryCode} - {cat.CategoryDescription}
            </option>
          ))}
        </select>

        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}

        <button type="submit" className={styles.submitButton}>Create Trade Item</button>
      </form>
    </div>
  );
};

export default CreateTradeItem;
