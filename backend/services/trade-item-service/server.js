const express = require("express");
const cors = require("cors");
const tradeItemRoutes = require("./routes/tradeItemRoutes");
const masterRoutes = require("./routes/masterDataRoutes");

const app = express();
const PORT = process.env.Trade_item_service_port || 5010;

// Enable CORS
app.use(cors({
    origin: "http://localhost:3000", // Allow frontend to access
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(express.json());

// Use Routes
app.use("/api", tradeItemRoutes);
app.use("/api/master", masterRoutes);

// Start Server
app.listen(PORT, () => console.log(`Trade Item Service running on port ${PORT}`));
