import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../styles/CreateForm.module.css";
import { useAuth } from "../context/AuthContext";

const EditTradeItemService = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const token = authState?.token;

  const [formData, setFormData] = useState({
    MaterialNumber: "",
    UnitOfMeasure: "",
    TradeItemDescription: "",
    SerializationType: "",
    ProfileRelevantCountry: "",
    TradeItemCategory: "",
    Status: "Active",
    SelectedCountryCodes: [],
    SelectedSupplierIDs: [],
  });

  const [dropdowns, setDropdowns] = useState({
    countries: [],
    units: [],
    serializations: [],
    categories: [],
    suppliers: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [
          countryRes,
          uomRes,
          serRes,
          catRes,
          supplierRes,
          tradeItemRes,
        ] = await Promise.all([
          axios.get("http://localhost:5010/api/master/countries", config),
          axios.get("http://localhost:5010/api/master/units", config),
          axios.get("http://localhost:5010/api/master/serialization-types", config),
          axios.get("http://localhost:5010/api/master/categories", config),
          axios.get("http://localhost:5040/api/suppliers/dropdown/list", config),
          axios.get(`http://localhost:5010/api/trade-items/${id}`, config),
        ]);

        setDropdowns({
          countries: countryRes.data,
          units: uomRes.data,
          serializations: serRes.data,
          categories: catRes.data,
          suppliers: supplierRes.data,
        });

        const item = tradeItemRes.data;
        setFormData({
          MaterialNumber: item.MaterialNumber,
          UnitOfMeasure: item.UnitOfMeasure,
          TradeItemDescription: item.TradeItemDescription,
          SerializationType: item.SerializationType,
          ProfileRelevantCountry: item.ProfileRelevantCountry,
          TradeItemCategory: item.TradeItemCategory,
          Status: item.Status || "Active",
          SelectedSupplierIDs: item.Suppliers?.map(s => s.SupplierID) || [],
          SelectedCountryCodes: item.Countries?.map(c => c.CountryCode) || [],
        });
      } catch (err) {
        console.error("Error loading trade item or dropdowns:", err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value, multiple } = e.target;
    if (multiple) {
      const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
      setFormData(prev => ({ ...prev, [name]: selected }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5010/api/trade-items/${id}`, formData, config);
      setSuccess("Trade Item updated successfully!");
      setError("");
      setTimeout(() => navigate("/manage-trade-items"), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
      setSuccess("");
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.formTitle}>Edit Trade Item</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
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
            {dropdowns.units.map(unit => (
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
            {dropdowns.serializations.map(ser => (
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
            {dropdowns.countries.map(country => (
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
            {dropdowns.categories.map(cat => (
              <option key={cat.CategoryCode} value={cat.CategoryCode}>
                {cat.CategoryDescription} ({cat.CategoryCode})
              </option>
            ))}
          </select>

          <label className={styles.label}>Suppliers (Multi-Select)</label>
          <select
            name="SelectedSupplierIDs"
            multiple
            value={formData.SelectedSupplierIDs}
            onChange={handleChange}
            className={styles.select}
          >
            {dropdowns.suppliers.map(supplier => (
              <option key={supplier.SupplierID} value={supplier.SupplierID}>
                {supplier.SupplierName}
              </option>
            ))}
          </select>

          <label className={styles.label}>Applicable Countries (Multi-Select)</label>
          <select
            name="SelectedCountryCodes"
            multiple
            value={formData.SelectedCountryCodes}
            onChange={handleChange}
            className={styles.select}
          >
            {dropdowns.countries.map(country => (
              <option key={country.ISOCode} value={country.ISOCode}>
                {country.CountryName} ({country.ISOCode})
              </option>
            ))}
          </select>

          <label className={styles.label}>Status</label>
          <select
            name="Status"
            value={formData.Status}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}

          <button type="submit" className={styles.submitButton} disabled={loading}>
            Update Trade Item
          </button>
        </form>
      )}
    </div>
  );
};

export default EditTradeItemService;
