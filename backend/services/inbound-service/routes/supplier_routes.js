const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplierController");

router.post("/suppliers", supplierController.createSupplier);
router.get("/suppliers", supplierController.getAllSuppliers);
router.get("/suppliers/:id", supplierController.getSupplierById);
router.put("/suppliers/:id", supplierController.updateSupplier);
router.delete("/suppliers/:id", supplierController.deleteSupplier);
router.get("/suppliers/dropdown/list", supplierController.getSupplierDropdown);

module.exports = router;
