import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/CreateOrderService.module.css";
import { useAuth } from "../context/AuthContext";

const CreateOrderService = () => {
  const { authState } = useAuth();
  const token = authState?.token;
  const userRoles = authState?.roles || [];
  const isSuperAdmin = userRoles.includes("Super Admin");

  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [sourceLocationId, setSourceLocationId] = useState("");
  const [destinationLocationId, setDestinationLocationId] = useState("");
  const [deliveryType, setDeliveryType] = useState("W2W"); // New state
  const [locations, setLocations] = useState([]);
  const [items, setItems] = useState([{ TradeItemID: "", Quantity: 1 }]);
  const [tradeItems, setTradeItems] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchTradeItems = async () => {
      try {
        const response = await axios.get("http://localhost:5010/api/trade-items/dropdown", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTradeItems(response.data);
      } catch (error) {
        console.error("Failed to fetch trade items", error);
      }
    };

    const fetchLocations = async () => {
      try {
        const response = await axios.get("http://localhost:5030/api/locations/dropdown", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLocations(response.data);

        // Auto-select source for Warehouse Manager
        if (!isSuperAdmin && response.data.length > 0) {
          setSourceLocationId(response.data[0].LocationID);
        }
      } catch (error) {
        console.error("Failed to fetch locations", error);
      }
    };

    if (token) {
      fetchTradeItems();
      fetchLocations();
    }
  }, [token, isSuperAdmin]);

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { TradeItemID: "", Quantity: 1 }]);
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filteredItems = items.filter(item => item.TradeItemID && item.Quantity > 0);

    if (!destinationLocationId || !filteredItems.length || (!isSuperAdmin && !sourceLocationId)) {
      setMessage("❌ Fill all required fields.");
      return;
    }

    if (deliveryType === "W2C" && (!customerName || !customerAddress)) {
      setMessage("❌ Customer Name and Address are required for Warehouse-to-Customer deliveries.");
      return;
    }

    try {
      const payload = {
        OrderDate: orderDate,
        CustomerName: deliveryType === "W2C" ? customerName : null,
        CustomerAddress: deliveryType === "W2C" ? customerAddress : null,
        SourceWarehouseID: sourceLocationId,
        DestinationWarehouseID: destinationLocationId,
        DeliveryType: deliveryType,
        OrderItems: filteredItems,
      };
      console.log("📦 Payload:", payload);
      await axios.post("http://localhost:5050/api/orders", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setMessage("✅ Order placed successfully!");
      setCustomerName("");
      setCustomerAddress("");
      setDestinationLocationId("");
      setDeliveryType("W2W");
      setItems([{ TradeItemID: "", Quantity: 1 }]);
      if (isSuperAdmin) setSourceLocationId("");
    } catch (err) {
      console.error("Order creation failed", err);
      setMessage("❌ Failed to create order");
    }
  };

  const isValidOrder = destinationLocationId &&
    items.every(item => item.TradeItemID && item.Quantity > 0) &&
    (deliveryType === "W2C" ? (customerName && customerAddress) : true);

  return (
    <div className={styles.container}>
      <h2>Create Order</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <label>Order Date:</label>
          <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
        </div>

        <div className={styles.section}>
          <label>Delivery Type:</label>
          <select value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)}>
            <option value="W2W">Warehouse to Warehouse</option>
            <option value="W2C">Warehouse to Customer</option>
          </select>
        </div>

        {deliveryType === "W2C" && (
          <>
            <div className={styles.section}>
              <label>Customer Name:</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
            </div>

            <div className={styles.section}>
              <label>Customer Address:</label>
              <input type="text" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} required />
            </div>
          </>
        )}

        {isSuperAdmin && (
          <div className={styles.section}>
            <label>Source Warehouse:</label>
            <select
              value={sourceLocationId}
              onChange={(e) => setSourceLocationId(e.target.value)}
              required
            >
              <option value="">Select Source Warehouse</option>
              {locations.map((loc) => (
                <option key={loc.LocationID} value={loc.LocationID}>
                  {loc.LocationName} ({loc.City})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={styles.section}>
          <label>Destination Warehouse:</label>
          <select
            value={destinationLocationId}
            onChange={(e) => setDestinationLocationId(e.target.value)}
            required
          >
            <option value="">Select Destination</option>
            {locations.map((loc) => (
              <option key={loc.LocationID} value={loc.LocationID}>
                {loc.LocationName} ({loc.City})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.section}>
          <h4>Order Items</h4>
          {items.map((item, index) => (
            <div key={index} className={styles.itemRow}>
              <select
                value={item.TradeItemID}
                onChange={(e) => handleItemChange(index, "TradeItemID", e.target.value)}
                required
              >
                <option value="">Select Item</option>
                {tradeItems.map((ti) => (
                  <option key={ti.TradeItemID} value={ti.TradeItemID}>
                    {ti.MaterialNumber} ({ti.GTIN})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={item.Quantity}
                onChange={(e) => handleItemChange(index, "Quantity", e.target.value)}
                required
              />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(index)}>Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addItem}>Add Item</button>
        </div>

        <div className={styles.section}>
          <button type="submit" disabled={!isValidOrder}>Place Order</button>
        </div>
      </form>

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default CreateOrderService;
