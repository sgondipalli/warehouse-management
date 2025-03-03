const session = require("express-session");
const { RedisStore } = require("connect-redis"); // Fix: Import RedisStore as named export
const { createClient } = require("redis");
require("dotenv").config();

// Create Redis client
const redisClient = createClient({ url: process.env.REDIS_URL });

redisClient.connect().catch(console.error);

// Configure session middleware with Redis store
const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }), // Corrected usage
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 3600000 }, // 1-hour session
});

module.exports = sessionMiddleware;
