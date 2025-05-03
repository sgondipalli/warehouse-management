const { StorageBin, Zone, Rack, Shelf, LocationMaster } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");

exports.createStorageBin = async (req, res) => {
  try {
    const {
      BinNumber, LocationID, ZoneID, RackID, ShelfID, MaxCapacity, CurrentStock
    } = req.body;

    // Check for duplicate BinNumber
    const existingBin = await StorageBin.findOne({ where: { BinNumber } });
    if (existingBin) {
      return res.status(409).json({ message: `BinNumber '${BinNumber}' already exists.` });
    }

    // Validate stock logic
    if (CurrentStock > MaxCapacity) {
      return res.status(400).json({
        message: `Current stock (${CurrentStock}) cannot exceed max capacity (${MaxCapacity}).`
      });
    }

    // Optionally: Validate relationships (advanced, if needed)
    // You can verify if Rack/Shelf belong to the provided ZoneID and LocationID

    const newBin = await StorageBin.create({
      BinNumber,
      LocationID,
      ZoneID,
      RackID,
      ShelfID,
      MaxCapacity,
      CurrentStock
    });

    logger.info("Storage Bin created:", newBin.toJSON());
    res.status(201).json({ message: "Storage Bin created", data: newBin });

  } catch (error) {
    logger.error("Create Bin Error", error);
    res.status(500).json({ message: "Failed to create bin", error: error.message });
  }
};



exports.getAllStorageBins = async (req, res) => {
  try {
    const bins = await StorageBin.findAll({
      where: { isDeleted: false },
      include: [
        { model: Zone, as: "Zone", attributes: ["ZoneName"] },
        { model: Rack, as: "Rack", attributes: ["RackNumber"] },
        { model: Shelf, as: "Shelf", attributes: ["ShelfNumber"] }
      ],
      attributes: ["BinID", "BinNumber"],
      order: [["BinNumber", "ASC"]],
    });

    res.status(200).json(bins);
  } catch (error) {
    logger.error("Get Bins Error", error);
    res.status(500).json({ message: "Failed to fetch bins", error: error.message });
  }
};

exports.getStorageBinById = async (req, res) => {
  try {
    const bin = await StorageBin.findByPk(req.params.id);
    if (!bin) return res.status(404).json({ message: "Storage Bin not found" });
    res.status(200).json(bin);
  } catch (error) {
    logger.error("Get Bin by ID Error", error);
    res.status(500).json({ message: "Failed to fetch bin", error: error.message });
  }
};

exports.updateStorageBin = async (req, res) => {
  try {
    const bin = await StorageBin.findByPk(req.params.id);
    if (!bin) return res.status(404).json({ message: "Storage Bin not found" });
    await bin.update(req.body);
    res.status(200).json({ message: "Storage Bin updated", data: bin });
  } catch (error) {
    logger.error("Update Bin Error", error);
    res.status(500).json({ message: "Failed to update bin", error: error.message });
  }
};

exports.deleteStorageBin = async (req, res) => {
  try {
    const bin = await StorageBin.findByPk(req.params.id);
    if (!bin) return res.status(404).json({ message: "Storage Bin not found" });
    await bin.update({ isDeleted: true });
    res.status(200).json({ message: "Storage Bin deleted" });
  } catch (error) {
    logger.error("Delete Bin Error", error);
    res.status(500).json({ message: "Failed to delete bin", error: error.message });
  }
};

exports.getStorageBinDropdown = async (req, res) => {
  try {
    const bins = await StorageBin.findAll({
      where: { isDeleted: false },
      include: [
        { model: Zone, attributes: ["ZoneName"] },
        { model: Rack, attributes: ["RackNumber"] },
        { model: Shelf, attributes: ["ShelfNumber"] },
      ],
      attributes: ["BinID", "BinNumber"],
      order: [["BinNumber", "ASC"]],
    });

    // Format label like: Zone A > Rack 1 > Shelf A > BIN-001
    const dropdown = bins.map((bin) => ({
      BinID: bin.BinID,
      label: `${bin.Zone?.ZoneName || "N/A"} > ${bin.Rack?.RackNumber || "N/A"} > ${bin.Shelf?.ShelfNumber || "N/A"} > ${bin.BinNumber}`,
    }));

    res.status(200).json(dropdown);
  } catch (error) {
    logger.error("Dropdown Bin Error", error);
    res.status(500).json({ message: "Failed to fetch bin dropdown", error: error.message });
  }
};

// GET /api/bins/location/:locationId
exports.getBinsByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;

    const bins = await StorageBin.findAll({
      where: {
        isDeleted: false,
        LocationID: locationId
      },
      include: [
        { model: Zone, as: "Zone", attributes: ["ZoneName"] },
        { model: Rack, as: "Rack", attributes: ["RackNumber"] },
        { model: Shelf, as: "Shelf", attributes: ["ShelfNumber"] }
      ],
      attributes: ["BinID", "BinNumber"],
      order: [["BinNumber", "ASC"]]
    });

    const formatted = bins.map(bin => ({
      BinID: bin.BinID,
      label: `${bin.Zone?.ZoneName || "N/A"} > ${bin.Rack?.RackNumber || "N/A"} > ${bin.Shelf?.ShelfNumber || "N/A"} > ${bin.BinNumber}`
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching bins by location with hierarchy", error);
    res.status(500).json({ message: "Failed to fetch bins by location", error: error.message });
  }
};


