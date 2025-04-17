const { TradeItem } = require("../../../common/db/models");
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
      ProfileRelevantCountry,
      TradeItemCategory,
    } = req.body;

    let generatedGTIN = GTIN;
    if (!GTIN) {
      const indicator = 1;
      const companyPrefix = "1234567";
      const productCode = Math.floor(1000 + Math.random() * 9000);
      generatedGTIN = generateGTIN14(indicator, companyPrefix, productCode);
    }

    if (!isValidGTIN14(generatedGTIN)) {
      logger.warn("Invalid GTIN-14 format.", { generatedGTIN });
      return res.status(400).json({ message: "Invalid GTIN-14 format." });
    }

    const existingTradeItem = await TradeItem.findOne({ where: { GTIN: generatedGTIN } });
    if (existingTradeItem) {
      logger.info("GTIN already exists", { generatedGTIN });
      return res.status(400).json({ message: "GTIN already exists" });
    }

    const newTradeItem = await TradeItem.create({
      GTIN: generatedGTIN,
      MaterialNumber,
      UnitOfMeasure,
      TradeItemDescription,
      SerializationType,
      ProfileRelevantCountry,
      TradeItemCategory,
    });

    logger.info("Trade Item created", { TradeItemID: newTradeItem.TradeItemID });
    await publishTradeItemCreated(newTradeItem);

    res.status(201).json({ message: "Trade Item created successfully", data: newTradeItem });
  } catch (error) {
    logger.error("Error in createTradeItem", { error });
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get All Trade Items (with Pagination)
exports.getAllTradeItems = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const tradeItems = await TradeItem.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    logger.info("Fetched trade items", { count: tradeItems.count, page });

    res.status(200).json({
      totalItems: tradeItems.count,
      totalPages: Math.ceil(tradeItems.count / limit),
      currentPage: page,
      data: tradeItems.rows,
    });
  } catch (error) {
    logger.error("Error in getAllTradeItems", { error });
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get Single Trade Item by ID
exports.getTradeItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const tradeItem = await TradeItem.findByPk(id);
    if (!tradeItem) {
      logger.warn("Trade Item not found", { id });
      return res.status(404).json({ message: "Trade Item not found" });
    }

    res.status(200).json(tradeItem);
  } catch (error) {
    logger.error("Error in getTradeItemById", { error });
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update Trade Item
exports.updateTradeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const tradeItem = await TradeItem.findByPk(id);
    if (!tradeItem) {
      logger.warn("Trade Item not found for update", { id });
      return res.status(404).json({ message: "Trade Item not found" });
    }

    await tradeItem.update(updatedData);
    await publishTradeItemUpdated(tradeItem);

    logger.info("Trade Item updated", { TradeItemID: id });
    res.status(200).json({ message: "Trade Item updated successfully", data: tradeItem });
  } catch (error) {
    logger.error("Error in updateTradeItem", { error });
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Delete Trade Item
exports.deleteTradeItem = async (req, res) => {
  try {
    const { id } = req.params;
    const tradeItem = await TradeItem.findByPk(id);

    if (!tradeItem) {
      logger.warn("Trade Item not found for deletion", { id });
      return res.status(404).json({ message: "Trade Item not found" });
    }

    await tradeItem.destroy();
    await publishTradeItemDeleted(id);

    logger.info("Trade Item deleted", { TradeItemID: id });
    res.status(200).json({ message: "Trade Item deleted successfully" });
  } catch (error) {
    logger.error("Error in deleteTradeItem", { error });
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


exports.getTradeItemDropdown = async (req, res) => {
  try {
    const dropdown = await TradeItem.findAll({
      attributes: ["TradeItemID", "MaterialNumber", "GTIN"],
      order: [["MaterialNumber", "ASC"]],
    });
    res.status(200).json(dropdown);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trade item dropdown", error: error.message });
  }
};

