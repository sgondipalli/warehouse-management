'use strict';

const {
  StockLevels,
  TradeItem,
  LocationMaster,
  StorageBin,
  Zone,
  Rack,
  Shelf,
  sequelize, //Importing the sequelize instance
} = require("../../../common/db/models");

const {
  publishStockCreated,
  publishStockUpdated,
  publishStockDeleted
} = require("../kafka/stockLevelProducer");

const logger = require("../../../common/utils/logger");

// Create Stock Level
exports.createStockLevel = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      TradeItemID,
      LocationID,
      StorageBinID,
      Quantity: rawQuantity
    } = req.body;

    const Quantity = parseInt(rawQuantity);
    logger.info("CreateStockLevel request body:", req.body);

    if (!TradeItemID || !LocationID || !StorageBinID || isNaN(Quantity)) {
      return res.status(400).json({ message: "Missing or invalid required fields." });
    }

    const bin = await StorageBin.findByPk(StorageBinID, { transaction: t });
    if (!bin) return res.status(400).json({ message: "Invalid Storage Bin" });

    // Do NOT modify CurrentStock in controller — handled by Kafka Consumer

    const newStock = await StockLevels.create({
      TradeItemID, LocationID, StorageBinID, Quantity
    }, { transaction: t });

    await t.commit();
    await publishStockCreated(newStock); // Kafka handles the actual bin stock change
    res.status(201).json({ message: "Stock level created", data: newStock });
  } catch (error) {
    await t.rollback();
    logger.error("Create Stock Level Error", error);
    res.status(500).json({ message: "Failed to create stock level", error: error.message });
  }
};


// Update Stock Level
exports.updateStockLevel = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      TradeItemID,
      LocationID,
      StorageBinID,
      Quantity: rawQuantity
    } = req.body;

    const Quantity = parseInt(rawQuantity);
    logger.info("UpdateStockLevel request", req.body);

    const stock = await StockLevels.findByPk(id, { transaction: t });
    if (!stock) return res.status(404).json({ message: "Stock level not found" });

    const previousQuantity = stock.Quantity;

    // Do NOT check CurrentStock capacity here — consumer validates it
    await stock.update({ TradeItemID, LocationID, StorageBinID, Quantity }, { transaction: t });

    await t.commit();
    await publishStockUpdated(stock, previousQuantity);
    res.status(200).json({ message: "Stock level updated", data: stock });
  } catch (error) {
    await t.rollback();
    logger.error("Update Stock Level Error", error);
    res.status(500).json({ message: "Failed to update stock level", error: error.message });
  }
};



// Delete Stock Level
exports.deleteStockLevel = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const stock = await StockLevels.findByPk(id, { transaction: t });

    if (!stock) return res.status(404).json({ message: "Stock level not found" });

    // Only delete; Kafka consumer handles bin rollback
    await stock.destroy({ transaction: t });

    await t.commit();
    await publishStockDeleted(stock);
    res.status(200).json({ message: "Stock level deleted" });
  } catch (error) {
    await t.rollback();
    logger.error("Delete Stock Level Error", error);
    res.status(500).json({ message: "Failed to delete stock level", error: error.message });
  }
};


// Get all stock levels with associations and pagination
exports.getAllStockLevels = async (req, res) => {
  try {
    const { page = 1, limit = 10, locationId, tradeItemId, storageBinId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (locationId) whereClause.LocationID = locationId;
    if (tradeItemId) whereClause.TradeItemID = tradeItemId;
    if (storageBinId) whereClause.StorageBinID = storageBinId;

    logger.info("Fetching Stock Levels with filters:", whereClause);

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
          include: [
            {
              model: Shelf,
              as: "Shelf",
              attributes: ["ShelfNumber"],
              include: [
                {
                  model: Rack,
                  as: "Rack",
                  attributes: ["RackNumber"],
                  include: [
                    {
                      model: Zone,
                      as: "Zone",
                      attributes: ["ZoneName"]
                    }
                  ]
                }
              ]
            }
          ]
        }
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

// Dropdown list
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

// Trade Item Dropdown
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