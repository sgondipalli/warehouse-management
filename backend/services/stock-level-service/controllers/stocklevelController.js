'use strict';
const { StockLevels, TradeItem, LocationMaster, StorageBin } = require("../../../common/db/models");
const { Zone, Rack, Shelf } = require("../../../common/db/models");
const {
  publishStockCreated,
  publishStockUpdated,
  publishStockDeleted
} = require("../kafka/stockLevelProducer");

const logger = require("../../../common/utils/logger");
const { Op, Sequelize } = require("sequelize");

// Create Stock Level
// Create Stock Level with bin capacity validation and logging
exports.createStockLevel = async (req, res) => {
  const t = await Sequelize.transaction();
  try {
    const { TradeItemID, LocationID, StorageBinID, Quantity } = req.body;
    logger.info("CreateStockLevel request body:", req.body);

    if (!TradeItemID || !LocationID || !StorageBinID || Quantity === undefined) {
      logger.warn("Missing required fields");
      return res.status(400).json({ message: "Missing required fields." });
    }

    const bin = await StorageBin.findByPk(StorageBinID, { transaction: t });
    if (!bin) {
      logger.warn(`Invalid Storage Bin: ${StorageBinID}`);
      return res.status(400).json({ message: "Invalid Storage Bin" });
    }

    if (bin.CurrentStock + Quantity > bin.MaxCapacity) {
      logger.warn(`Bin capacity exceeded: Max ${bin.MaxCapacity}, Current ${bin.CurrentStock}, Attempted ${Quantity}`);
      return res.status(400).json({ message: `Exceeds bin max capacity (${bin.MaxCapacity}). Current: ${bin.CurrentStock}, Attempted: ${Quantity}` });
    }

    const newStock = await StockLevels.create(req.body, { transaction: t });
    await bin.update({ CurrentStock: bin.CurrentStock + Quantity }, { transaction: t });
    await t.commit();

    await publishStockCreated(newStock);
    logger.info("Stock level created successfully:", newStock.toJSON());
    res.status(201).json({ message: "Stock level created", data: newStock });
  } catch (error) {
    await t.rollback();
    logger.error("Create Stock Level Error", error);
    res.status(500).json({ message: "Failed to create stock level", error: error.message });
  }
};


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
  const t = await Sequelize.transaction();
  try {
    const { id } = req.params;
    const { TradeItemID, LocationID, StorageBinID, Quantity } = req.body;

    logger.info("UpdateStockLevel request", req.body);

    const stock = await StockLevels.findByPk(id, { transaction: t });
    if (!stock) return res.status(404).json({ message: "Stock level not found" });

    const bin = await StorageBin.findByPk(StorageBinID, { transaction: t });
    if (!bin) {
      logger.warn(`Invalid Storage Bin: ${StorageBinID}`);
      return res.status(400).json({ message: "Invalid Storage Bin" });
    }

    const previousQuantity = stock.Quantity;
    const delta = Quantity - previousQuantity;

    if (bin.CurrentStock + delta > bin.MaxCapacity) {
      logger.warn(`Update exceeds bin max capacity. Max: ${bin.MaxCapacity}, Current: ${bin.CurrentStock}, Delta: ${delta}`);
      return res.status(400).json({ message: `Update exceeds bin max capacity (${bin.MaxCapacity})` });
    }

    await stock.update(req.body, { transaction: t });
    await bin.update({ CurrentStock: bin.CurrentStock + delta }, { transaction: t });
    await t.commit();

    await publishStockUpdated(stock, previousQuantity);
    logger.info("Stock level updated", stock.toJSON());
    res.status(200).json({ message: "Stock level updated", data: stock });
  } catch (error) {
    await t.rollback();
    logger.error("Update Stock Level Error", error);
    res.status(500).json({ message: "Failed to update stock level", error: error.message });
  }
};

// Delete Stock Level
exports.deleteStockLevel = async (req, res) => {
  const t = await Sequelize.transaction();
  try {
    const { id } = req.params;
    const stock = await StockLevels.findByPk(id, { transaction: t });

    if (!stock) return res.status(404).json({ message: "Stock level not found" });

    const bin = await StorageBin.findByPk(stock.StorageBinID, { transaction: t });
    if (bin) {
      await bin.update({ CurrentStock: bin.CurrentStock - stock.Quantity }, { transaction: t });
    }

    await stock.destroy({ transaction: t });
    await t.commit();

    await publishStockDeleted(id);
    logger.info(`Stock level ID ${id} deleted`);
    res.status(200).json({ message: "Stock level deleted" });
  } catch (error) {
    await t.rollback();
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
