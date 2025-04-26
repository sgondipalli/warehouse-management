const express = require("express");
const router = express.Router();
const storageBinController = require("../controllers/storageBinController");

router.post("/bins", storageBinController.createStorageBin);
router.get("/bins", storageBinController.getAllStorageBins);
router.get("/bins/:id", storageBinController.getStorageBinById);
router.put("/bins/:id", storageBinController.updateStorageBin);
router.delete("/bins/:id", storageBinController.deleteStorageBin);
router.get("/bins/dropdown/list", storageBinController.getStorageBinDropdown);
router.get("/bins/location/:locationId",storageBinController.getBinsByLocation);


module.exports = router;
