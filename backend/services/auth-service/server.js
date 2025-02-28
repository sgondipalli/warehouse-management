const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./services/auth-service/auth.routes");

const app = express();

app.use(bodyParser.json());

app.use("/auth", authRoutes);

const PORT = 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
