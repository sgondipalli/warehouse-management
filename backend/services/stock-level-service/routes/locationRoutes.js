// backend/services/stock-level-service/routes/locationRoutes.js

const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationController");

// Create new location
router.post("/locations", locationController.createLocation);

// Get all locations with pagination + filters
router.get("/locations", locationController.getAllLocations);

// Get location dropdown (ID + Name)
router.get("/locations/dropdown", locationController.getLocationDropdown);

// Get location by ID
router.get("/locations/:id", locationController.getLocationById);

// Update location
router.put("/locations/:id", locationController.updateLocation);

// Delete location
router.delete("/locations/:id", locationController.deleteLocation);

module.exports = router;
