const express = require("express");
const router = express.Router();
const tradeItemController = require("../controllers/tradeItemController");
const { authenticateJWT, authorizeRoles } = require("../middleware/authMiddleware");

// 🔒 All routes protected by authentication

// 🛒 Create Trade Item (Only Super Admin and Warehouse Manager)
router.post(
  "/trade-items",
  authenticateJWT,
  authorizeRoles(["Super Admin", "Warehouse Manager"]),
  tradeItemController.createTradeItem
);

// 📜 Get Trade Items for Dropdown (🔔 Important: place before /:id)
router.get(
  "/trade-items/dropdown",
  authenticateJWT,
  tradeItemController.getTradeItemDropdown
);

// 📋 Get All Trade Items (Any authenticated user)
router.get(
  "/trade-items",
  authenticateJWT,
  tradeItemController.getAllTradeItems
);

// 🔍 Get Single Trade Item by ID (Any authenticated user)
router.get(
  "/trade-items/:id",
  authenticateJWT,
  tradeItemController.getTradeItemById
);

// ✏️ Update Trade Item (Only Super Admin and Warehouse Manager)
router.put(
  "/trade-items/:id",
  authenticateJWT,
  authorizeRoles(["Super Admin", "Warehouse Manager"]),
  tradeItemController.updateTradeItem
);

// Delete Trade Item (Only Super Admin)
router.delete(
  "/trade-items/:id",
  authenticateJWT,
  authorizeRoles(["Super Admin"]),
  tradeItemController.deleteTradeItem
);

module.exports = router;
