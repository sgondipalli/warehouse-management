const express = require("express");
const router = express.Router();
const zoneController = require("../controllers/zoneController");

router.post("/zones", zoneController.createZone);
router.get("/zones", zoneController.getAllZones);
router.get("/zones/:id", zoneController.getZoneById);
router.put("/zones/:id", zoneController.updateZone);
router.delete("/zones/:id", zoneController.deleteZone);
router.get("/zones/dropdown/list", zoneController.getZoneDropdown);

module.exports = router;
