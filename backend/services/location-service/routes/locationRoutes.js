
const express = require("express");
const router = express.Router();
const locationController = require("../controllers/locationcontroller");

// Specific route must come before any dynamic ones
router.get("/locations/dropdown", locationController.getDropdownList);

// Only ONE instance of the dynamic route
router.get("/locations/:id", locationController.getLocationById);

router.get("/locations", locationController.getAllLocations);
router.post("/locations", locationController.createLocation);
router.put("/locations/:id", locationController.updateLocation);
router.delete("/locations/:id", locationController.deleteLocation);

module.exports = router;
