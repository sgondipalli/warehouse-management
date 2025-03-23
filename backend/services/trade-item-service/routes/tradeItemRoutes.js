const express = require("express");
const router = express.Router();
const tradeItemController = require("../controllers/tradeItemController");

// Define Routes
router.post("/trade-items", tradeItemController.createTradeItem);
router.get("/trade-items", tradeItemController.getAllTradeItems);
router.get("/trade-items/:id", tradeItemController.getTradeItemById);
router.put("/trade-items/:id", tradeItemController.updateTradeItem);
router.delete("/trade-items/:id", tradeItemController.deleteTradeItem);

module.exports = router;
