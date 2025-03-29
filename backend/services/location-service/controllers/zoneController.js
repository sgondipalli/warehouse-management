const { Zone } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");

// zoneController.js
exports.createZone = async (req, res) => {
  try {
    const { ZoneName, LocationID } = req.body;

    // Check if Zone already exists
    const existingZone = await Zone.findOne({ where: { ZoneName, LocationID } });

    if (existingZone) {
      return res.status(200).json({ message: "Zone already exists", data: existingZone });
    }

    const newZone = await Zone.create({ ZoneName, LocationID });
    res.status(201).json({ message: "Zone created", data: newZone });
  } catch (error) {
    console.error("Create Zone Error", error);
    res.status(500).json({ message: "Failed to create zone", error: error.message });
  }
};



exports.getAllZones = async (req, res) => {
  try {
    const zones = await Zone.findAll();
    res.status(200).json(zones);
  } catch (error) {
    logger.error("Get Zones Error", error);
    res.status(500).json({ message: "Failed to fetch zones", error: error.message });
  }
};

exports.getZoneById = async (req, res) => {
  try {
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ message: "Zone not found" });
    res.status(200).json(zone);
  } catch (error) {
    logger.error("Get Zone by ID Error", error);
    res.status(500).json({ message: "Failed to fetch zone", error: error.message });
  }
};

exports.updateZone = async (req, res) => {
  try {
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ message: "Zone not found" });
    await zone.update(req.body);
    res.status(200).json({ message: "Zone updated", data: zone });
  } catch (error) {
    logger.error("Update Zone Error", error);
    res.status(500).json({ message: "Failed to update zone", error: error.message });
  }
};

exports.deleteZone = async (req, res) => {
  try {
    const zone = await Zone.findByPk(req.params.id);
    if (!zone) return res.status(404).json({ message: "Zone not found" });
    await zone.destroy();
    res.status(200).json({ message: "Zone deleted" });
  } catch (error) {
    logger.error("Delete Zone Error", error);
    res.status(500).json({ message: "Failed to delete zone", error: error.message });
  }
};

exports.getZoneDropdown = async (req, res) => {
  try {
    const dropdown = await Zone.findAll({ attributes: ["ZoneID", "ZoneName"] });
    res.status(200).json(dropdown);
  } catch (error) {
    logger.error("Dropdown Zone Error", error);
    res.status(500).json({ message: "Failed to fetch zone dropdown", error: error.message });
  }
};
