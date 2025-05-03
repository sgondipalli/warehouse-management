const express = require("express");
const router = express.Router();
const inboundController = require("../controllers/inboundController");
const authMiddleware = require("../middleware/auth"); // Import auth

router.post("/inbounds", authMiddleware, inboundController.createInbound);
router.get("/inbounds", authMiddleware, inboundController.getAllInbounds);
router.get("/inbounds/:id", authMiddleware, inboundController.getInboundById);
router.put("/inbounds/:id", authMiddleware, inboundController.updateInbound);
router.delete("/inbounds/:id", authMiddleware, inboundController.deleteInbound);
router.get("/inbounds/accessible-locations/:userId", authMiddleware, inboundController.getAccessibleLocations); // ✅ Fixed duplicate

module.exports = router;
