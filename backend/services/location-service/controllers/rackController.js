const { Rack } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");

exports.createRack = async (req, res) => {
  try {
    const { ZoneID, RackNumber } = req.body;

    if (!ZoneID || !RackNumber) {
      return res.status(400).json({ message: "ZoneID and RackNumber are required" });
    }

    const existingRack = await Rack.findOne({ where: { RackNumber, ZoneID } });

    if (existingRack) {
      return res.status(200).json({ message: "Rack already exists", data: existingRack });
    }

    const newRack = await Rack.create({ ZoneID, RackNumber });
    res.status(201).json({ message: "Rack created", data: newRack });
  } catch (error) {
    console.error("Create Rack Error", error);
    res.status(500).json({ message: "Failed to create rack", error: error.message });
  }
};




exports.getAllRacks = async (req, res) => {
  try {
    const racks = await Rack.findAll();
    res.status(200).json(racks);
  } catch (error) {
    logger.error("Get Racks Error", error);
    res.status(500).json({ message: "Failed to fetch racks", error: error.message });
  }
};

exports.getRackById = async (req, res) => {
  try {
    const rack = await Rack.findByPk(req.params.id);
    if (!rack) return res.status(404).json({ message: "Rack not found" });
    res.status(200).json(rack);
  } catch (error) {
    logger.error("Get Rack by ID Error", error);
    res.status(500).json({ message: "Failed to fetch rack", error: error.message });
  }
};

exports.updateRack = async (req, res) => {
  try {
    const rack = await Rack.findByPk(req.params.id);
    if (!rack) return res.status(404).json({ message: "Rack not found" });
    await rack.update(req.body);
    res.status(200).json({ message: "Rack updated", data: rack });
  } catch (error) {
    logger.error("Update Rack Error", error);
    res.status(500).json({ message: "Failed to update rack", error: error.message });
  }
};

exports.deleteRack = async (req, res) => {
  try {
    const rack = await Rack.findByPk(req.params.id);
    if (!rack) return res.status(404).json({ message: "Rack not found" });
    await rack.update({ isDeleted: true });
    res.status(200).json({ message: "Rack deleted" });
  } catch (error) {
    logger.error("Delete Rack Error", error);
    res.status(500).json({ message: "Failed to delete rack", error: error.message });
  }
};

exports.getRackDropdown = async (req, res) => {
  try {
    const dropdown = await Rack.findAll({ attributes: ["RackID", "RackNumber"] });
    res.status(200).json(dropdown);
  } catch (error) {
    logger.error("Dropdown Rack Error", error);
    res.status(500).json({ message: "Failed to fetch rack dropdown", error: error.message });
  }
};
