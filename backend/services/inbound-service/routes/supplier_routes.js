const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");
const authMiddleware = require("../middleware/auth");

router.post("/suppliers", authMiddleware, supplierController.createSupplier);
router.get("/suppliers", authMiddleware, supplierController.getAllSuppliers);
router.get("/suppliers/:id", authMiddleware, supplierController.getSupplierById);
router.put("/suppliers/:id", authMiddleware, supplierController.updateSupplier);
router.delete("/suppliers/:id", authMiddleware, supplierController.deleteSupplier);
router.get("/suppliers/dropdown/list", authMiddleware, supplierController.getSupplierDropdown);


module.exports = router;
