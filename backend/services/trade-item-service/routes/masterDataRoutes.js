const express = require("express");
const router = express.Router();
const masterDataController = require("../controllers/masterDataController");

router.get("/countries", masterDataController.getCountries);
router.get("/units", masterDataController.getUnits);
router.get("/serialization-types", masterDataController.getSerializationTypes);
router.get("/categories", masterDataController.getCategories);

module.exports = router;
