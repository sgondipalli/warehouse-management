const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("../auth-service/routes/authroutes");
const sessionMiddleware = require("../../config/redisConfig");

const app = express();

app.use(bodyParser.json());
app.use(sessionMiddleware); // Apply Redis-based session handling

app.use("/auth", authRoutes);

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
