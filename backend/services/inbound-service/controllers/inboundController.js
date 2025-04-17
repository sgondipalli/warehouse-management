'use strict';
const { Inbound, TradeItem, StorageBin, Users, Supplier } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");
// const { publishInboundCreated } = require("../kafka/inboundProducer"); // Uncomment if Kafka used
const { Op } = require("sequelize");
const {
  publishInboundCreated,
  publishInboundUpdated,
  publishInboundDeleted,
} = require("../kafka/inboundProducer");

// Create Inbound
exports.createInbound = async (req, res) => {
  try {
    const {
      TradeItemID,
      StorageBinID,
      ReceivedQuantity,
      BatchNumber,
      SupplierID,
      DeliveryDocument,
      ReceivedBy,
      Remarks,
      ExpectedDeliveryDate,
      ConditionOnArrival,
      PurchaseOrderNumber
    } = req.body;

    // Validate required fields
    if (!TradeItemID || !StorageBinID || !ReceivedQuantity || ReceivedQuantity <= 0) {
      return res.status(400).json({ message: "Invalid input. TradeItemID, StorageBinID and positive ReceivedQuantity are required." });
    }

    const inbound = await Inbound.create({
      TradeItemID,
      StorageBinID,
      ReceivedQuantity,
      BatchNumber,
      SupplierID,
      DeliveryDocument,
      ReceivedBy,
      Remarks,
      ExpectedDeliveryDate,
      ConditionOnArrival,
      PurchaseOrderNumber
    });

    await publishInboundCreated(inbound); // Optional Kafka publishing

    logger.info("Inbound created:", inbound.toJSON());
    res.status(201).json({ message: "Inbound created", data: inbound });
  } catch (error) {
    logger.error("Create Inbound Error", error);
    res.status(500).json({ message: "Failed to create inbound", error: error.message });
  }
};

// Get All Inbounds with optional filtering
exports.getAllInbounds = async (req, res) => {
  try {
    const { TradeItemID, StorageBinID, ReceivedBy } = req.query;
    const where = { isDeleted: false };

    if (TradeItemID) where.TradeItemID = TradeItemID;
    if (StorageBinID) where.StorageBinID = StorageBinID;
    if (ReceivedBy) where.ReceivedBy = ReceivedBy;

    const inbounds = await Inbound.findAll({
      where,
      include: [
        { model: TradeItem, attributes: ["MaterialNumber", "GTIN", "TradeItemDescription"] },
        { model: StorageBin, attributes: ["BinNumber"] },
        { model: Users, attributes: ["firstName", "lastName", "email"] },
        { model: Supplier, attributes: ["SupplierName", "ContactEmail", "PhoneNumber"] }
      ],
      order: [["ReceivedAt", "DESC"]]
    });

    res.status(200).json(inbounds);
  } catch (error) {
    logger.error("Fetch Inbounds Error", error);
    res.status(500).json({ message: "Failed to fetch inbounds", error: error.message });
  }
};

// ✅ Get Single Inbound by ID
exports.getInboundById = async (req, res) => {
  try {
    const inbound = await Inbound.findByPk(req.params.id, {
      include: [
        { model: TradeItem },
        { model: StorageBin },
        { model: Users }
      ]
    });

    if (!inbound || inbound.isDeleted) {
      return res.status(404).json({ message: "Inbound not found" });
    }

    res.status(200).json(inbound);
  } catch (error) {
    logger.error("Get Inbound by ID Error", error);
    res.status(500).json({ message: "Failed to fetch inbound", error: error.message });
  }
};

// Update Inbound
exports.updateInbound = async (req, res) => {
  try {
    const inbound = await Inbound.findByPk(req.params.id);
    if (!inbound || inbound.isDeleted) {
      return res.status(404).json({ message: "Inbound not found" });
    }

    await inbound.update(req.body);
    res.status(200).json({ message: "Inbound updated", data: inbound });
    await publishInboundUpdated(inbound);
  } catch (error) {
    logger.error("Update Inbound Error", error);
    res.status(500).json({ message: "Failed to update inbound", error: error.message });
  }
};

// Soft Delete Inbound
exports.deleteInbound = async (req, res) => {
  try {
    const inbound = await Inbound.findByPk(req.params.id);
    if (!inbound || inbound.isDeleted) {
      return res.status(404).json({ message: "Inbound not found" });
    }

    await inbound.update({ isDeleted: true, deletedAt: new Date() });
    res.status(200).json({ message: "Inbound deleted (soft)" });
    await publishInboundUpdated(inbound);
  } catch (error) {
    logger.error("Delete Inbound Error", error);
    res.status(500).json({ message: "Failed to delete inbound", error: error.message });
  }
};
