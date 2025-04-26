const { Zone, Rack, Shelf, StorageBin } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");

// zoneController.js
exports.createZone = async (req, res) => {
  try {
    const { ZoneName, LocationID } = req.body;

    // Validate LocationID exists
    const locationExists = await LocationMaster.findByPk(LocationID);
    if (!locationExists) {
      return res.status(400).json({ message: "Invalid LocationID. Warehouse not found." });
    }

    // Prevent duplicate zone names within same warehouse
    const existingZone = await Zone.findOne({ where: { ZoneName, LocationID } });
    if (existingZone) {
      return res.status(200).json({ message: "Zone already exists", data: existingZone });
    }

    // Create new zone
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
    await zone.update({ isDeleted: true });
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

exports.getZoneHierarchy = async (req, res) => {
  const { locationId } = req.query;

  if (!locationId) {
    return res.status(400).json({ message: "Location ID is required" });
  }

  try {
    const zones = await Zone.findAll({
      where: { LocationID: locationId, isDeleted: false },
      include: [
        {
          model: Rack,
          where: { isDeleted: false },
          required: false,
          include: [
            {
              model: Shelf,
              where: { isDeleted: false },
              required: false,
              include: [
                {
                  model: StorageBin,
                  where: { isDeleted: false },
                  required: false,
                  attributes: ["id", "BinNumber", "MaxCapacity", "CurrentStock"],
                }
              ]
            }
          ]
        }
      ]
    });

    res.status(200).json(zones);
  } catch (error) {
    logger.error("Fetch Zone Hierarchy Error", error);
    res.status(500).json({ message: "Failed to fetch zone hierarchy", error: error.message });
  }
};

