'use strict';
const { LocationMaster, AddressTable } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");
const { Op } = require("sequelize");

// Create Location
exports.createLocation = async (req, res) => {
  try {
    const newLoc = await LocationMaster.create(req.body);
    logger.info("Location created:", newLoc.toJSON());
    res.status(201).json({ message: "Location created", data: newLoc });
  } catch (error) {
    logger.error("Create Location Error", error);
    res.status(500).json({ message: "Failed to create location", error: error.message });
  }
};

// Get all locations with pagination + filtering
exports.getAllLocations = async (req, res) => {
  try {
    const { page = 1, limit = 10, locationType, region, city } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (locationType) whereClause.LocationType = locationType;
    if (region || city) {
      whereClause['$AddressTable.Region$'] = region || undefined;
      whereClause['$AddressTable.City$'] = city || undefined;
    }

    const result = await LocationMaster.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      where: whereClause,
      include: [{ model: AddressTable }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      totalItems: result.count,
      totalPages: Math.ceil(result.count / limit),
      currentPage: parseInt(page),
      data: result.rows
    });
  } catch (error) {
    logger.error("Fetch Locations Error", error);
    res.status(500).json({ message: "Failed to fetch locations", error: error.message });
  }
};

// Get by ID
exports.getLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await LocationMaster.findByPk(id, {
      include: [{ model: AddressTable }]
    });

    if (!location) return res.status(404).json({ message: "Location not found" });

    res.status(200).json(location);
  } catch (error) {
    logger.error("Fetch Location by ID Error", error);
    res.status(500).json({ message: "Failed to fetch location", error: error.message });
  }
};

// Update
exports.updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await LocationMaster.findByPk(id);

    if (!location) return res.status(404).json({ message: "Location not found" });

    await location.update(req.body);
    logger.info("Location updated", location.toJSON());
    res.status(200).json({ message: "Location updated", data: location });
  } catch (error) {
    logger.error("Update Location Error", error);
    res.status(500).json({ message: "Failed to update location", error: error.message });
  }
};

// Delete
exports.deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await LocationMaster.findByPk(id);

    if (!location) return res.status(404).json({ message: "Location not found" });

    await location.destroy();
    logger.info(`Location ID ${id} deleted`);
    res.status(200).json({ message: "Location deleted" });
  } catch (error) {
    logger.error("Delete Location Error", error);
    res.status(500).json({ message: "Failed to delete location", error: error.message });
  }
};

// Dropdown list (ID + Name)
exports.getLocationDropdown = async (req, res) => {
  try {
    const dropdown = await LocationMaster.findAll({
      attributes: ["LocationID", "LocationName"],
      order: [["LocationName", "ASC"]]
    });
    res.status(200).json(dropdown);
  } catch (error) {
    logger.error("Dropdown Fetch Error", error);
    res.status(500).json({ message: "Failed to fetch dropdown", error: error.message });
  }
};
