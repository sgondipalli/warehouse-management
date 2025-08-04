const express = require("express");
const router = express.Router();
const vehicleController = require("../controllers/vehicleController");
const { authenticateJWT, authorizeRoles } = require("../middleware/authorize");

// Create a vehicle - Only Super Admin or Manager
router.post(
  "/",
  authenticateJWT,
  authorizeRoles(["Super Admin", "Warehouse Manager"]),
  vehicleController.createVehicle
);

// Get all vehicles - All roles except Warehouse Worker
router.get(
  "/",
  authenticateJWT,
  authorizeRoles(["Super Admin", "Warehouse Manager", "Delivery Agent", "Auditor/Compliance Officer"]),
  vehicleController.getVehicles
);

// Update a vehicle - Only Super Admin or Manager
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(["Super Admin", "Warehouse Manager"]),
  vehicleController.updateVehicle
);

// Delete a vehicle - Only Super Admin
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(["Super Admin"]),
  vehicleController.deleteVehicle
);

module.exports = router;

// Get available vehicles
router.get(
  "/available",
  authenticateJWT,
  authorizeRoles(["Super Admin", "Warehouse Manager"]),
  vehicleController.getAvailableVehicles
);

// routes/outboundDispatchRoutes.js or routes/vehicleRoutes.js
router.post("/assign-final-leg/:id", authenticateJWT, authorizeRoles("Super Admin", "Warehouse Manager"), vehicleController.assignFinalLeg);

