const express = require("express");
const router = express.Router();
const controller = require("../controllers/deliveryAssignmentController");
const { authenticateJWT, authorizeRoles } = require("../middleware/authorize");

// Only Super Admin and Warehouse Manager can view or assign
router.get("/", authenticateJWT, authorizeRoles(["Super Admin", "Warehouse Manager"]), controller.getAllAssignments);
router.get("/dispatches-to-assign", authenticateJWT, authorizeRoles(["Super Admin", "Warehouse Manager"]), controller.getFinalLegDispatchesToAssign);
router.post("/", authenticateJWT, authorizeRoles(["Super Admin", "Warehouse Manager"]), controller.assignAgent);

module.exports = router;
