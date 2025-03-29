const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");

router.post("/addresses", addressController.createAddress);

module.exports = router;
