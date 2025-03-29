const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares
app.use(express.json());

// Enable CORS
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Routes
const locationRoutes = require("./routes/locationRoutes");
app.use("/api", locationRoutes); 

const stockLevelRoutes = require("./routes/stockLevelRoutes");
app.use("/api", stockLevelRoutes);  

// Health check
app.get("/", (req, res) => {
  res.send("Stock Level Service is running!");
});

// Start server
const PORT = process.env.StockServicePORT || 5020;
app.listen(PORT, () => {
  console.log(`Stock Level Service running on port ${PORT}`);
});
