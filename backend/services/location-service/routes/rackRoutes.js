const express = require("express");
const router = express.Router();
const rackController = require("../controllers/rackController");

router.post("/racks", rackController.createRack);
router.get("/racks", rackController.getAllRacks);
router.get("/racks/:id", rackController.getRackById);
router.put("/racks/:id", rackController.updateRack);
router.delete("/racks/:id", rackController.deleteRack);
router.get("/racks/dropdown/list", rackController.getRackDropdown);

module.exports = router;
