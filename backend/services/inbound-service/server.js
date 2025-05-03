require('dotenv').config();

const express = require("express");
const cors = require("cors");
const app = express();


app.use(express.json());
// In server.js
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
  

const inboundRoutes = require("./routes/inboundRoutes");
const supplierRoutes = require("./routes/supplier_routes");

app.use("/api", supplierRoutes)
app.use("/api", inboundRoutes);

app.get("/", (req, res) => {
  res.send("Inbound Service is running!");
});

const PORT = process.env.InboundServicePORT || 5040;
app.listen(PORT, () => {
  console.log(`Inbound Service running on port ${PORT}`);
});
