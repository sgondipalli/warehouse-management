const { Shelf } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");

exports.createShelf = async (req, res) => {
  try {
    const { ShelfNumber, RackID } = req.body;

    if (!ShelfNumber || !RackID) {
      return res.status(400).json({ message: "ShelfNumber and RackID are required" });
    }

    const existingShelf = await Shelf.findOne({ where: { ShelfNumber, RackID } });

    if (existingShelf) {
      return res.status(200).json({ message: "Shelf already exists", data: existingShelf });
    }

    const newShelf = await Shelf.create({ ShelfNumber, RackID });
    res.status(201).json({ message: "Shelf created", data: newShelf });
  } catch (error) {
    console.error("Create Shelf Error", error);
    res.status(500).json({ message: "Failed to create shelf", error: error.message });
  }
};



exports.getAllShelves = async (req, res) => {
  try {
    const shelves = await Shelf.findAll();
    res.status(200).json(shelves);
  } catch (error) {
    logger.error("Get Shelves Error", error);
    res.status(500).json({ message: "Failed to fetch shelves", error: error.message });
  }
};

exports.getShelfById = async (req, res) => {
  try {
    const shelf = await Shelf.findByPk(req.params.id);
    if (!shelf) return res.status(404).json({ message: "Shelf not found" });
    res.status(200).json(shelf);
  } catch (error) {
    logger.error("Get Shelf by ID Error", error);
    res.status(500).json({ message: "Failed to fetch shelf", error: error.message });
  }
};

exports.updateShelf = async (req, res) => {
  try {
    const shelf = await Shelf.findByPk(req.params.id);
    if (!shelf) return res.status(404).json({ message: "Shelf not found" });
    await shelf.update(req.body);
    res.status(200).json({ message: "Shelf updated", data: shelf });
  } catch (error) {
    logger.error("Update Shelf Error", error);
    res.status(500).json({ message: "Failed to update shelf", error: error.message });
  }
};

exports.deleteShelf = async (req, res) => {
  try {
    const shelf = await Shelf.findByPk(req.params.id);
    if (!shelf) return res.status(404).json({ message: "Shelf not found" });
    await shelf.update({ isDeleted: true });
    res.status(200).json({ message: "Shelf deleted" });
  } catch (error) {
    logger.error("Delete Shelf Error", error);
    res.status(500).json({ message: "Failed to delete shelf", error: error.message });
  }
};

exports.getShelfDropdown = async (req, res) => {
  try {
    const dropdown = await Shelf.findAll({ attributes: ["ShelfID", "ShelfNumber"] });
    res.status(200).json(dropdown);
  } catch (error) {
    logger.error("Dropdown Shelf Error", error);
    res.status(500).json({ message: "Failed to fetch shelf dropdown", error: error.message });
  }
};
