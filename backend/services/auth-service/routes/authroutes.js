const express = require("express");
const authController = require("../controllers/authcontroller");
const authMiddleware = require("../middleware/auth");
const authorize = require("../middleware/authorize");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/assign-role", authMiddleware, authController.assignRole);
router.post("/logout", authMiddleware, authController.logout);


// 🔒 Protected Routes
router.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

router.get("/admin", authMiddleware, authorize(["Super Admin"]), (req, res) => {
  res.json({ message: "Admin access granted" });
});

router.get("/manager", authMiddleware, authorize(["Warehouse Manager"]), (req, res) => {
  res.json({ message: "Manager access granted" });
});

module.exports = router;
