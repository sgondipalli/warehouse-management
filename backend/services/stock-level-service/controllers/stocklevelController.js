'use strict';
const { StockLevels, TradeItem, LocationMaster, StorageBin } = require("../../../common/db/models");
const {
  publishStockCreated,
  publishStockUpdated,
  publishStockDeleted
} = require("../kafka/stockLevelProducer");

const logger = require("../../../common/utils/logger");
const { Op } = require("sequelize");

// Create Stock Level
exports.createStockLevel = async (req, res) => {
  try {
    const newStock = await StockLevels.create(req.body);
    await publishStockCreated(newStock);
    logger.info("Stock level created:", newStock.toJSON());
    res.status(201).json({ message: "Stock level created", data: newStock });
  } catch (error) {
    logger.error("Create Stock Level Error", error);
    res.status(500).json({ message: "Failed to create stock level", error: error.message });
  }
};

// Get all stock levels with pagination + filtering
exports.getAllStockLevels = async (req, res) => {
  try {
    const { page = 1, limit = 10, locationId, tradeItemId, storageBinId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (locationId) whereClause.LocationID = locationId;
    if (tradeItemId) whereClause.TradeItemID = tradeItemId;
    if (storageBinId) whereClause.StorageBinID = storageBinId;

    const result = await StockLevels.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      where: whereClause,
      include: [
        {
          model: TradeItem,
          as: "TradeItem",
          attributes: ["GTIN", "MaterialNumber", "TradeItemDescription", "TradeItemCategory"],
        },
        {
          model: LocationMaster,
          as: "Location",
          attributes: ["LocationName"],
        },
        {
          model: StorageBin,
          as: "StorageBin",
          attributes: ["BinNumber"],
        },
      ],
      order: [["LastUpdated", "DESC"]],
    });

    res.status(200).json({
      totalItems: result.count,
      totalPages: Math.ceil(result.count / limit),
      currentPage: parseInt(page),
      data: result.rows,
    });
  } catch (error) {
    logger.error("Fetch Stock Levels Error", error);
    res.status(500).json({ message: "Failed to fetch stock levels", error: error.message });
  }
};

// Get Stock Level by ID
exports.getStockLevelById = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await StockLevels.findByPk(id, {
      include: [
        {
          model: TradeItem,
          as: "TradeItem",
          attributes: ["GTIN", "MaterialNumber"],
        },
        {
          model: LocationMaster,
          as: "Location",
          attributes: ["LocationName"],
        },
        {
          model: StorageBin,
          as: "StorageBin",
          attributes: ["BinNumber"],
        },
      ],
    });

    if (!stock) return res.status(404).json({ message: "Stock level not found" });
    res.status(200).json(stock);
  } catch (error) {
    logger.error("Fetch Stock Level by ID Error", error);
    res.status(500).json({ message: "Failed to fetch stock level", error: error.message });
  }
};

// Update Stock Level
exports.updateStockLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await StockLevels.findByPk(id);

    if (!stock) return res.status(404).json({ message: "Stock level not found" });

    await stock.update(req.body);
    await publishStockUpdated(stock);
    logger.info("Stock level updated", stock.toJSON());
    res.status(200).json({ message: "Stock level updated", data: stock });
  } catch (error) {
    logger.error("Update Stock Level Error", error);
    res.status(500).json({ message: "Failed to update stock level", error: error.message });
  }
};

// Delete Stock Level
exports.deleteStockLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const stock = await StockLevels.findByPk(id);

    if (!stock) return res.status(404).json({ message: "Stock level not found" });

    await stock.destroy();
    await publishStockDeleted(id);
    logger.info(`Stock level ID ${id} deleted`);
    res.status(200).json({ message: "Stock level deleted" });
  } catch (error) {
    logger.error("Delete Stock Level Error", error);
    res.status(500).json({ message: "Failed to delete stock level", error: error.message });
  }
};

// Dropdown list (ID + Name + Bin Number)
exports.getStockDropdown = async (req, res) => {
  try {
    const dropdown = await StockLevels.findAll({
      attributes: ["StockLevelID", "Quantity"],
      include: [
        {
          model: TradeItem,
          as: "TradeItem",
          attributes: ["MaterialNumber"],
        },
        {
          model: StorageBin,
          as: "StorageBin",
          attributes: ["BinNumber"],
        }
      ],
      order: [["LastUpdated", "DESC"]]
    });
    res.status(200).json(dropdown);
  } catch (error) {
    logger.error("Stock Dropdown Fetch Error", error);
    res.status(500).json({ message: "Failed to fetch stock dropdown", error: error.message });
  }
};

// Get Trade Item Dropdown (ID + Name)
exports.getTradeItemDropdown = async (req, res) => {
  try {
    const tradeItems = await TradeItem.findAll({
      attributes: ["TradeItemID", "MaterialNumber", "GTIN", "TradeItemDescription", "TradeItemCategory"],
      order: [["MaterialNumber", "ASC"]],
    });
    res.status(200).json(tradeItems);
  } catch (error) {
    logger.error("Trade Item Dropdown Fetch Error", error);
    res.status(500).json({ message: "Failed to fetch trade items", error: error.message });
  }
};
