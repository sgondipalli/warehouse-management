const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticateJWT, authorizeRoles } = require("../middleware/authorize");

// Add authentication before authorization
router.post(
    "/",
    authenticateJWT,
    authorizeRoles(["Super Admin", "Warehouse Manager"]),
    orderController.createOrder
);

router.get(
    "/",
    authenticateJWT,
    authorizeRoles(["Super Admin", "Warehouse Manager", "Warehouse Worker", "Auditor/Compliance Officer"]),
    orderController.getOrders
);

// routes/orderRoutes.js
router.get(
    "/:id",
    authenticateJWT,
    authorizeRoles(["Super Admin", "Warehouse Manager", "Warehouse Worker", "Auditor/Compliance Officer"]),
    orderController.getOrderById
);


module.exports = router;
