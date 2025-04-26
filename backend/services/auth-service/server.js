const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("../auth-service/routes/authroutes");
const userRoutes = require("../auth-service/routes/userRoutes");
const sessionMiddleware = require("../../config/redisConfig");
const cookieParser = require("cookie-parser");

const app = express();

// Enable CORS
app.use(
    cors({
      origin: "http://localhost:3000", // Allow frontend to access
      credentials: true, // Allow cookies to be sent
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  );
app.use(cookieParser());
  

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(sessionMiddleware); // Apply Redis-based session handling

app.use("/auth", authRoutes);
app.use("/auth", userRoutes);

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
