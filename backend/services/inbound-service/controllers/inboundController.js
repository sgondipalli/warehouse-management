'use strict';
const { Inbound, TradeItem, StorageBin, Users, Supplier } = require("../../../common/db/models");
const { LocationMaster, UserLocationAccess } = require("../../../common/db/models");
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
      PurchaseOrderNumber,
      LocationID
    } = req.body;

    if (!TradeItemID || !StorageBinID || !ReceivedQuantity || ReceivedQuantity <= 0 || !LocationID) {
      return res.status(400).json({
        message: "Invalid input. TradeItemID, StorageBinID, LocationID and positive ReceivedQuantity are required."
      });
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
      PurchaseOrderNumber,
      LocationID
    });

    await publishInboundCreated(inbound);

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
        { model: Supplier, attributes: ["SupplierName", "ContactEmail", "PhoneNumber"] },
        {
          model: LocationMaster,
          as: "Location",
          attributes: ["LocationName"]
        }

      ],
      order: [["ReceivedAt", "DESC"]]
    });

    res.status(200).json(inbounds);
  } catch (error) {
    logger.error("Fetch Inbounds Error", error);
    res.status(500).json({ message: "Failed to fetch inbounds", error: error.message });
  }
};

// Get Single Inbound by ID
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

    const oldInbound = { ...inbound.get() };

    await inbound.update(req.body);
    const updatedInbound = inbound.get();

    // Ensure LocationID is not missing (especially for legacy records)
    if (!updatedInbound.LocationID && req.body.LocationID) {
      updatedInbound.LocationID = req.body.LocationID;
    }

    // Log for debugging
    logger.debug("📦 Publishing updatedInbound with LocationID:", updatedInbound.LocationID);

    await publishInboundUpdated({
      old: oldInbound,
      new: updatedInbound
    });

    logger.info("Inbound updated:", updatedInbound);
    res.status(200).json({ message: "Inbound updated", data: updatedInbound });
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

    // Capture deletion payload before marking it as deleted
    const deletedPayload = {
      InboundID: inbound.InboundID,
      TradeItemID: inbound.TradeItemID,
      StorageBinID: inbound.StorageBinID,
      ReceivedQuantity: inbound.ReceivedQuantity,
      LocationID: inbound.LocationID, // Optional: for trace/debug
    };

    // Soft delete
    await inbound.update({
      isDeleted: true,
      deletedAt: new Date(),
    });

    // Send deletion event to Kafka
    await publishInboundDeleted(deletedPayload);

    logger.info("Inbound deleted (soft):", deletedPayload);
    res.status(200).json({ message: "Inbound deleted (soft)" });
  } catch (error) {
    logger.error("Delete Inbound Error", error);
    res.status(500).json({ message: "Failed to delete inbound", error: error.message });
  }
};



// // GET /api/inbounds/accessible-locations/:userId
// exports.getAccessibleLocations = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { LocationMaster, UserLocationAccess } = require("../../../common/db/models");

//     const locations = await LocationMaster.findAll({
//       include: [
//         {
//           model: UserLocationAccess,
//           where: { userId },
//           attributes: [],
//         },
//       ],
//       attributes: ["LocationID", "LocationName", "LocationNumber"],
//       order: [["LocationName", "ASC"]],
//     });

//     res.status(200).json(locations);
//   } catch (error) {
//     logger.error("Error fetching accessible locations", error);
//     res.status(500).json({ message: "Failed to get accessible locations", error: error.message });
//   }
// };




// GET /api/inbounds/accessible-locations/:userId
exports.getAccessibleLocations = async (req, res) => {
  try {
    const { userId } = req.params;
    const { Users, Roles, UserRoles } = require("../../../common/db/models");

    // Step 1: Get user's role
    const user = await Users.findByPk(userId, {
      include: [{ model: Roles, through: UserRoles }]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isSuperAdmin = user.Roles.some(role => role.roleName === "Super Admin");

    let locations;

    if (isSuperAdmin) {
      // Step 2: Fetch all locations for Super Admin
      locations = await LocationMaster.findAll({
        attributes: ["LocationID", "LocationName", "LocationNumber"],
        order: [["LocationName", "ASC"]],
      });
    } else {
      // Step 3: Fetch based on UserLocationAccess
      locations = await LocationMaster.findAll({
        include: [
          {
            model: UserLocationAccess,
            where: { userId },
            attributes: [],
          },
        ],
        attributes: ["LocationID", "LocationName", "LocationNumber"],
        order: [["LocationName", "ASC"]],
      });
    }

    res.status(200).json(locations);
  } catch (error) {
    logger.error("Error fetching accessible locations", error);
    res.status(500).json({ message: "Failed to get accessible locations", error: error.message });
  }
};


