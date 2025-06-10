require('dotenv').config();
'use strict';

const express = require("express");
const cors = require("cors");
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Health Check
app.get("/", (req, res) => {
  res.send("🚚 Outbound Service is running!");
});

// Routes
const vehicleRoutes = require("./routes/vehicleRoutes");
const orderRoutes = require("./routes/orderRoutes");
const outboundDispatchRoutes = require("./routes/outboundDispatchRoutes");

// Mount Routes
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/outbounds", outboundDispatchRoutes);

// ✅ Kafka Producer (connect on server start)
const { publishOutboundDispatched } = require("./kafka/outboundProducer");

// Optional: establish connection by publishing a test event or connecting once
(async () => {
  try {
    await publishOutboundDispatched({ init: true }); // You can replace with connectProducer if exposed
    console.log("✅ Kafka producer is ready in Outbound Service");
  } catch (err) {
    console.error("❌ Kafka producer failed to connect:", err);
  }
})();
// Cron Job for Delayed Second-Legs
require("./jobs/secondLegMonitor");

// Start server
const PORT = process.env.OUTBOUND_SERVICE_PORT || 5050;
app.listen(PORT, () => {
  console.log(`🚀 Outbound Service is running on port ${PORT}`);
});
