const express = require("express");
const router = express.Router();
const controller = require("../controllers/outboundDispatchController");
const { authenticateJWT, authorizeRoles } = require("../middleware/authorize");

// Only Super Admin and Warehouse Manager can create/update/delete
router.post(
  "/",
  authenticateJWT,
  authorizeRoles(["Super Admin", "Warehouse Manager"]),
  controller.createDispatch
);

router.get(
  "/dispatches",
  authenticateJWT,
  authorizeRoles(["Super Admin", "Warehouse Manager", "Delivery Agent", "Auditor/Compliance Officer"]),
  controller.getDispatches
);

router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(["Super Admin", "Warehouse Manager"]),
  controller.updateDispatch
);

router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(["Super Admin"]),
  controller.deleteDispatch
);

router.get(
  "/second-leg/pending",
  authenticateJWT,
  authorizeRoles(["Super Admin", "Warehouse Manager"]),
  controller.getPendingSecondLegs
);

router.get(
  "/second-leg/manual-scan",
  authenticateJWT,
  authorizeRoles(["Super Admin"]),
  controller.manualSecondLegScan
);

router.get(
  "/dispatches/summary",
  authenticateJWT,
  authorizeRoles(["Super Admin", "Warehouse Manager", "Auditor/Compliance Officer"]),
  controller.getDispatchSummary
);

router.put("/assign/:dispatchId", authenticateJWT, controller.assignFinalLegDispatch);

router.post("/dispatch/:id/mark-delivered", authenticateJWT, controller.markDispatchAsDelivered);


module.exports = router;
