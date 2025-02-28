const express = require("express");
const authController = require("./auth.controller");
const authMiddleware = require("../../middleware/auth");
const authorize = require("../../middleware/authorize");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

router.get("/admin", authMiddleware, authorize(["Admin"]), (req, res) => {
  res.json({ message: "Admin access granted" });
});

module.exports = router;
