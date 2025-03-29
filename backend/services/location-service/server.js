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

// Import routes
const zoneRoutes = require("./routes/zoneRoutes");
const rackRoutes = require("./routes/rackRoutes");
const shelfRoutes = require("./routes/shelfRoutes");
const storageBinRoutes = require("./routes/storageBinRoutes");
const locationRoutes = require("./routes/locationRoutes");
const addressRoutes = require("./routes/addressRoutes");


// Mount routes
app.use("/api", zoneRoutes);
app.use("/api", rackRoutes);
app.use("/api", shelfRoutes);
app.use("/api", storageBinRoutes);
app.use("/api", locationRoutes);
app.use("/api", addressRoutes);



// Health Check
app.get("/", (req, res) => {
  res.send("Location Service is running!");
});

// Start server
const PORT = process.env.LOCATION_SERVICE_PORT || 5030;
app.listen(PORT, () => {
  console.log(`Location Service is running on port ${PORT}`);
});
