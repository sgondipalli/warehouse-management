'use strict';
const express = require("express");
const router = express.Router();
const stockLevelController = require("../controllers/stocklevelController");

// Create
router.post("/stocklevel", stockLevelController.createStockLevel);

// Read All with pagination/filter
router.get("/stocklevel", stockLevelController.getAllStockLevels);

// Read by ID
router.get("/stocklevel/:id", stockLevelController.getStockLevelById);

// Update
router.put("/stocklevel/:id", stockLevelController.updateStockLevel);

// Delete
router.delete("/stocklevel/:id", stockLevelController.deleteStockLevel);

// Dropdown
router.get("/stocklevel/dropdown/list", stockLevelController.getStockDropdown);

router.get("/stocklevel/tradeitems/dropdown", stockLevelController.getTradeItemDropdown);


module.exports = router;
