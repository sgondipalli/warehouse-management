const { TradeItem, TradeItemSupplier, TradeItemCountry, Supplier, CountryMaster } = require("../../../common/db/models");
const { generateGTIN14, isValidGTIN14 } = require("../utils/gtinService");
const logger = require("../../../common/utils/logger");
const {
  publishTradeItemCreated,
  publishTradeItemUpdated,
  publishTradeItemDeleted,
} = require("../kafka/tradeItemProducer");

// Create Trade Item
exports.createTradeItem = async (req, res) => {
  try {
    const {
      GTIN,
      MaterialNumber,
      UnitOfMeasure,
      TradeItemDescription,
      SerializationType,
      TradeItemCategory,
      supplierIds = [],
      countryCodes = [],
    } = req.body;

    let generatedGTIN = GTIN;
    if (!GTIN) {
      const indicator = 1;
      const companyPrefix = "1234567";
      const productCode = Math.floor(1000 + Math.random() * 9000);
      generatedGTIN = generateGTIN14(indicator, companyPrefix, productCode);
    }

    if (!isValidGTIN14(generatedGTIN)) {
      return res.status(400).json({ message: "Invalid GTIN-14 format." });
    }

    const existing = await TradeItem.findOne({ where: { GTIN: generatedGTIN } });
    if (existing) {
      return res.status(400).json({ message: "GTIN already exists." });
    }

    const newItem = await TradeItem.create({
      GTIN: generatedGTIN,
      MaterialNumber,
      UnitOfMeasure,
      TradeItemDescription,
      SerializationType,
      TradeItemCategory,
      CreatedByUserID: req.user.userId,
      Status: "Active",
    });

    if (Array.isArray(supplierIds) && supplierIds.length) {
      const supplierLinks = supplierIds.map(SupplierID => ({
        TradeItemID: newItem.TradeItemID,
        SupplierID,
      }));
      await TradeItemSupplier.bulkCreate(supplierLinks);
    }

    if (Array.isArray(countryCodes) && countryCodes.length) {
      const countryLinks = countryCodes.map(CountryCode => ({
        TradeItemID: newItem.TradeItemID,
        CountryCode,
      }));
      await TradeItemCountry.bulkCreate(countryLinks);
    }

    const fullItem = await TradeItem.findByPk(newItem.TradeItemID, {
      include: [
        { model: TradeItemSupplier, include: [{ model: Supplier }] },
        { model: TradeItemCountry, include: [{ model: CountryMaster, as: "Country" }] }
      ]
    });

    await publishTradeItemCreated(fullItem);
    res.status(201).json({ message: "Trade Item created", data: fullItem });

  } catch (error) {
    logger.error("createTradeItem error", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get all trade items with optional status and pagination
exports.getAllTradeItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const where = { isDeleted: false };
    if (status) where.Status = status;

    const result = await TradeItem.findAndCountAll({
      where,
      limit: +limit,
      offset: +offset,
      include: [
        { model: TradeItemSupplier, include: [{ model: Supplier }] },
        { model: TradeItemCountry, include: [{ model: CountryMaster, as: "Country" }] }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      totalItems: result.count,
      totalPages: Math.ceil(result.count / limit),
      currentPage: page,
      data: result.rows,
    });

  } catch (error) {
    logger.error("getAllTradeItems error", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get Trade Item by ID with flattened associations
exports.getTradeItemById = async (req, res) => {
  try {
    const item = await TradeItem.findByPk(req.params.id, {
      include: [
        { model: TradeItemSupplier, include: [{ model: Supplier }] },
        { model: TradeItemCountry, include: [{ model: CountryMaster, as: "Country" }] }
      ]
    });

    if (!item) return res.status(404).json({ message: "Trade Item not found" });

    const plainItem = item.toJSON();
    plainItem.Suppliers = plainItem.TradeItemSuppliers?.map(ts => ts.Supplier).filter(Boolean);
    plainItem.Countries = plainItem.TradeItemCountries?.map(tc => tc.Country).filter(Boolean);

    res.status(200).json(plainItem);
  } catch (error) {
    logger.error("getTradeItemById error", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update Trade Item and associated junctions
exports.updateTradeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      MaterialNumber,
      UnitOfMeasure,
      TradeItemDescription,
      SerializationType,
      TradeItemCategory,
      supplierIds = [],
      countryCodes = [],
    } = req.body;

    const item = await TradeItem.findByPk(id);
    if (!item) return res.status(404).json({ message: "Trade Item not found" });

    await item.update({
      MaterialNumber,
      UnitOfMeasure,
      TradeItemDescription,
      SerializationType,
      TradeItemCategory,
      UpdatedByUserID: req.user.userId,
    });

    await TradeItemSupplier.destroy({ where: { TradeItemID: id } });
    if (Array.isArray(supplierIds) && supplierIds.length) {
      const supplierLinks = supplierIds.map(SupplierID => ({
        TradeItemID: id,
        SupplierID,
      }));
      await TradeItemSupplier.bulkCreate(supplierLinks);
    }

    await TradeItemCountry.destroy({ where: { TradeItemID: id } });
    if (Array.isArray(countryCodes) && countryCodes.length) {
      const countryLinks = countryCodes.map(CountryCode => ({
        TradeItemID: id,
        CountryCode,
      }));
      await TradeItemCountry.bulkCreate(countryLinks);
    }

    const updatedItem = await TradeItem.findByPk(id, {
      include: [
        { model: TradeItemSupplier, include: [{ model: Supplier }] },
        { model: TradeItemCountry, include: [{ model: CountryMaster, as: "Country" }] }
      ]
    });

    await publishTradeItemUpdated(updatedItem);
    res.status(200).json({ message: "Trade Item updated", data: updatedItem });

  } catch (error) {
    logger.error("updateTradeItem error", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Soft delete
exports.deleteTradeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await TradeItem.findByPk(id);
    if (!item) return res.status(404).json({ message: "Trade Item not found" });

    await item.update({
      isDeleted: true,
      deletedAt: new Date(),
      Status: "Inactive",
      UpdatedByUserID: req.user?.userId,
    });

    await publishTradeItemDeleted(id);
    res.status(200).json({ message: "Trade Item deleted" });

  } catch (error) {
    logger.error("deleteTradeItem error", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Dropdown
exports.getTradeItemDropdown = async (_req, res) => {
  try {
    const dropdown = await TradeItem.findAll({
      attributes: ["TradeItemID", "MaterialNumber", "GTIN"],
      where: { isDeleted: false },
      order: [["MaterialNumber", "ASC"]],
    });
    res.status(200).json(dropdown);
  } catch (error) {
    logger.error("getTradeItemDropdown error", error);
    res.status(500).json({ message: "Failed to fetch dropdown", error: error.message });
  }
};
