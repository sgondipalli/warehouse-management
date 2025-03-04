const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("../auth-service/routes/authroutes");
const sessionMiddleware = require("../../config/redisConfig");

const app = express();

// Enable CORS
app.use(
    cors({
      origin: "http://localhost:3000", // Allow frontend to access
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );
  

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(sessionMiddleware); // Apply Redis-based session handling

app.use("/auth", authRoutes);

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
