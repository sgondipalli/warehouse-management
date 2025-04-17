// controllers/supplierController.js
const { Supplier } = require("../../../common/db/models");

exports.createSupplier = async (req, res) => {
  try {
    const { SupplierName, ContactEmail, PhoneNumber } = req.body;

    const existing = await Supplier.findOne({
      where: { SupplierName, ContactEmail, PhoneNumber }
    });

    if (existing && existing.isDeleted) {
      await existing.update({ isDeleted: false, deletedAt: null });
      return res.status(200).json({ message: "Supplier reactivated", data: existing });
    }

    const newSupplier = await Supplier.create(req.body);
    res.status(201).json({ message: "Supplier created", data: newSupplier });
  } catch (err) {
    res.status(500).json({ message: "Error creating supplier", error: err.message });
  }
};


exports.getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll({
      where: { isDeleted: false },
      order: [["SupplierName", "ASC"]],
    });
    res.status(200).json(suppliers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching suppliers", error: err.message });
  }
};


exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    res.status(200).json(supplier);
  } catch (err) {
    res.status(500).json({ message: "Error fetching supplier", error: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });
    await supplier.update(req.body);
    res.status(200).json({ message: "Supplier updated", data: supplier });
  } catch (err) {
    res.status(500).json({ message: "Error updating supplier", error: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ message: "Supplier not found" });

    await supplier.update({ isDeleted: true });
    res.status(200).json({ message: "Supplier deleted (soft)" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting supplier", error: err.message });
  }
};


exports.getSupplierDropdown = async (req, res) => {
  try {
    const dropdown = await Supplier.findAll({
      attributes: ["SupplierID", "SupplierName"],
      where: { isDeleted: false },
      order: [["SupplierName", "ASC"]]
    });
    res.status(200).json(dropdown);
  } catch (error) {
    res.status(500).json({ message: "Error fetching dropdown", error: error.message });
  }
};
