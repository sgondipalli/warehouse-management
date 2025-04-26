const express = require("express");
const router = express.Router();
const inboundController = require("../controllers/inboundController");

router.post("/inbounds", inboundController.createInbound);
router.get("/inbounds", inboundController.getAllInbounds);
router.get("/inbounds/:id", inboundController.getInboundById);
router.put("/inbounds/:id", inboundController.updateInbound);
router.delete("/inbounds/:id", inboundController.deleteInbound);
router.get("/inbounds/accessible-locations/:userId", inboundController.getAccessibleLocations);
router.get("/inbounds/accessible-locations/:userId", inboundController.getAccessibleLocations);


module.exports = router;
