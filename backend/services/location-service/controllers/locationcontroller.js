const { LocationMaster, AddressTable } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");

const { Op } = require("sequelize");

exports.getAllLocations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const locationFilters = {};
        const addressFilters = {};

        if (req.query.locationType) {
            locationFilters.LocationType = { [Op.iLike]: `%${req.query.locationType}%` };
        }

        if (req.query.region) {
            addressFilters.Region = { [Op.iLike]: `%${req.query.region}%` };
        }

        if (req.query.city) {
            addressFilters.City = { [Op.iLike]: `%${req.query.city}%` };
        }

        const { count, rows } = await LocationMaster.findAndCountAll({
            where: locationFilters,
            include: [
                {
                    model: AddressTable,
                    where: Object.keys(addressFilters).length > 0 ? addressFilters : undefined
                }
            ],
            limit,
            offset
        });

        res.status(200).json({
            data: rows,
            totalPages: Math.ceil(count / limit),
            totalCount: count
        });
    } catch (error) {
        logger.error("Get Locations Error", error);
        res.status(500).json({ message: "Failed to fetch locations", error: error.message });
    }
};


exports.getLocationById = async (req, res) => {
    try {
        const location = await LocationMaster.findByPk(req.params.id, {
            include: [{ model: AddressTable }]
        });
        if (!location) return res.status(404).json({ message: "Location not found" });
        res.status(200).json(location);
    } catch (error) {
        logger.error("Get Location by ID Error", error);
        res.status(500).json({ message: "Failed to fetch location", error: error.message });
    }
};

exports.createLocation = async (req, res) => {
    const t = await LocationMaster.sequelize.transaction();
    try {
        const { LocationName, LocationType, LocationNumber, GLN, GLN_Extension, AddressTable: addressPayload } = req.body;

        // Validate LocationName uniqueness
        const existingLocation = await LocationMaster.findOne({
            where: { LocationName },
        });

        if (existingLocation) {
            await t.rollback();
            return res.status(400).json({ message: `Location with name '${LocationName}' already exists.` });
        }

        let address = null;

        // If address is provided, check for existing address
        if (addressPayload) {
            address = await AddressTable.findOne({
                where: {
                    City: addressPayload.City,
                    Region: addressPayload.Region,
                    Country: addressPayload.Country,
                }
            });

            // If not found, create a new address
            if (!address) {
                address = await AddressTable.create(addressPayload, { transaction: t });
            }
        }

        // Create location with or without address
        const newLocation = await LocationMaster.create({
            LocationName,
            LocationNumber,
            LocationType,
            GLN,
            GLN_Extension,
            AddressID: address ? address.id : null
        }, { transaction: t });

        await t.commit();
        res.status(201).json({ message: "Location created", data: newLocation });

    } catch (error) {
        await t.rollback();
        console.error("Create Location Error:", error);
        res.status(500).json({ message: "Failed to create location", error: error.message });
    }
};


exports.updateLocation = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            LocationNumber,
            LocationName,
            LocationType,
            GLN,
            GLN_Extension,
            AddressTable: addressPayload
        } = req.body;

        // 1. Find location and include address
        const location = await LocationMaster.findByPk(id, { include: [AddressTable] });

        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }

        // 2. Update location fields
        await location.update({ LocationNumber, LocationName, LocationType, GLN, GLN_Extension });

        // 3. Update address table
        if (location.AddressTable) {
            await location.AddressTable.update(addressPayload);
        }

        res.status(200).json({ message: "Location updated successfully", data: location });
    } catch (error) {
        console.error("Update Location Error:", error);
        res.status(500).json({ message: "Failed to update location", error: error.message });
    }
};

exports.deleteLocation = async (req, res) => {
    try {
        const location = await LocationMaster.findByPk(req.params.id);
        if (!location) return res.status(404).json({ message: "Location not found" });
        await location.destroy();
        res.status(200).json({ message: "Location deleted" });
    } catch (error) {
        logger.error("Delete Location Error", error);
        res.status(500).json({ message: "Failed to delete location", error: error.message });
    }
};

exports.getDropdownList = async (req, res) => {
    try {
        const results = await LocationMaster.findAll({
            attributes: ["LocationID", "LocationName"],
            include: [
                {
                    model: AddressTable,
                    attributes: ["City"]
                }
            ]
        });

        // Format response with city name
        const formattedResults = results.map(loc => ({
            LocationID: loc.LocationID,
            LocationName: loc.LocationName,
            City: loc.AddressTable?.City || "N/A"
        }));

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error("Dropdown Location Error Stack:", error);
        res.status(500).json({ message: "Failed to fetch location dropdown", error: error.message });
    }
};


exports.getLocationById = async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid location ID" });
    }

    try {
        const location = await LocationMaster.findByPk(id, { include: [AddressTable] });
        if (!location) return res.status(404).json({ message: "Location not found" });
        res.status(200).json(location);
    } catch (error) {
        logger.error("Get Location by ID Error", error);
        res.status(500).json({ message: "Failed to fetch location", error: error.message });
    }
};
