'use strict';
const {
  sequelize,
  OutboundDispatch,
  OrderItem,
  Vehicle,
  Users,
  LocationMaster
} = require("../../../common/db/models");

// Create a dispatch (supports two-leg delivery)
exports.createDispatch = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      OrderItemID,
      VehicleID,
      DeliveryAgentID,
      SourceWarehouseID,
      DestinationWarehouseID,
      AssignedLocationID,
      Remarks,
      IsFinalLeg = false,
      ParentDispatchID = null,
      CustomerName,
      CustomerAddress
    } = req.body;

    // Validation
    if (AssignedLocationID) {
      const locationExists = await LocationMaster.findByPk(AssignedLocationID);
      if (!locationExists) {
        return res.status(400).json({ message: "Invalid Assigned Location ID" });
      }
    }

    // First leg creation
    const firstLeg = await OutboundDispatch.create({
      OrderItemID,
      VehicleID,
      DeliveryAgentID,
      SourceWarehouseID,
      DestinationWarehouseID,
      AssignedLocationID,
      Remarks,
      IsFinalLeg,
      ParentDispatchID: null, // explicitly null for first leg
      CustomerName,
      CustomerAddress
    }, { transaction: t });

    // Auto-create second leg if required (W2C flow)
    let secondLeg = null;

    const isW2C = CustomerName && CustomerAddress;
    if (!IsFinalLeg && isW2C) {
      secondLeg = await OutboundDispatch.create({
        OrderItemID,
        SourceWarehouseID: DestinationWarehouseID, // Second leg starts where first ends
        DestinationWarehouseID: null,               // Customer is not a warehouse
        DeliveryAgentID: null,                      // Let someone assign later
        VehicleID: null,
        DispatchDate: firstLeg.DispatchDate,
        AssignedLocationID: null,
        Remarks: "Auto-generated second leg to customer",
        IsFinalLeg: true,
        ParentDispatchID: firstLeg.DispatchID,
        CustomerName,
        CustomerAddress
      }, { transaction: t });
    }

    await t.commit();

    return res.status(201).json({
      message: "Dispatch created successfully",
      firstLeg,
      secondLeg
    });
  } catch (err) {
    await t.rollback();
    console.error("Create Dispatch Error", err);
    res.status(500).json({ message: "Failed to create dispatch", error: err.message });
  }
};


// Fetch all dispatches (view only), with optional role filtering
exports.getDispatches = async (req, res) => {
  try {
    const user = req.user; // Injected from JWT middleware

    const roles = Array.isArray(user.roles) ? user.roles : [];

    const isManager = roles.includes("Warehouse Manager");
    const isAgent = roles.includes("Delivery Agent");
    const isSuperAdmin = roles.includes("Super Admin");

    let whereCondition = {};

    if (isAgent) {
      whereCondition = { DeliveryAgentID: user.id };
    } else if (isManager && Array.isArray(user.assignedLocationIds) && user.assignedLocationIds.length > 0) {
      whereCondition = {
        AssignedLocationID: user.assignedLocationIds,
      };
    }

    const dispatches = await OutboundDispatch.findAll({
      where: whereCondition,
      include: [
        { model: OrderItem, as: "OrderItem" },
        { model: Users, as: "DeliveryAgent" },
        { model: Vehicle, as: "Vehicle" },
        { model: LocationMaster, as: "AssignedLocation" },
        {
          model: OutboundDispatch,
          as: "ParentDispatch",
          attributes: ["DispatchID"]
        }
      ],
      order: [["DispatchDate", "DESC"]]
    });

    const result = dispatches.map(d => ({
      ...d.toJSON(),
      isLinkedToAnother: !!d.ParentDispatchID,
      isFinalLeg: d.IsFinalLeg,
      parentLink: d.ParentDispatch ? d.ParentDispatch.DispatchID : null,
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error("Fetch Manage Dispatch Error", err);
    res.status(500).json({ message: "Failed to fetch manage dispatches", error: err.message });
  }
};



// Update dispatch
exports.updateDispatch = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      OrderItemID,
      VehicleID,
      DeliveryAgentID,
      SourceWarehouseID,
      DestinationWarehouseID,
      AssignedLocationID,
      Remarks,
      IsFinalLeg,
      ParentDispatchID
    } = req.body;

    const dispatch = await OutboundDispatch.findByPk(id);
    if (!dispatch) return res.status(404).json({ message: "Dispatch not found" });

    if (AssignedLocationID) {
      const locationExists = await LocationMaster.findByPk(AssignedLocationID);
      if (!locationExists) {
        return res.status(400).json({ message: "Invalid Assigned Location ID" });
      }
    }

    await dispatch.update({
      OrderItemID,
      VehicleID,
      DeliveryAgentID,
      SourceWarehouseID,
      DestinationWarehouseID,
      AssignedLocationID,
      Remarks,
      IsFinalLeg,
      ParentDispatchID
    });

    res.status(200).json({ message: "Dispatch updated", data: dispatch });
  } catch (err) {
    console.error("Update Dispatch Error", err);
    res.status(500).json({ message: "Failed to update dispatch", error: err.message });
  }
};

// Delete dispatch
exports.deleteDispatch = async (req, res) => {
  try {
    const { id } = req.params;
    const dispatch = await OutboundDispatch.findByPk(id);
    if (!dispatch) return res.status(404).json({ message: "Dispatch not found" });

    await dispatch.destroy();
    res.status(200).json({ message: "Dispatch deleted" });
  } catch (err) {
    console.error("Delete Dispatch Error", err);
    res.status(500).json({ message: "Failed to delete dispatch", error: err.message });
  }
};

exports.getPendingSecondLegs = async (req, res) => {
  try {
    const pending = await OutboundDispatch.findAll({
      where: {
        IsFinalLeg: true,
        DeliveryAgentID: null,
        VehicleID: null,
        ParentDispatchID: { [sequelize.Op.ne]: null }
      },
      include: [
        { model: OrderItem, as: "OrderItem" },
        { model: OutboundDispatch, as: "ParentDispatch", attributes: ["DispatchID"] }
      ],
      order: [["DispatchDate", "ASC"]]
    });
    res.status(200).json(pending);
  } catch (err) {
    console.error("Fetch Pending Second Legs Error", err);
    res.status(500).json({ message: "Failed to load pending second-leg dispatches" });
  }
};


exports.getDispatchSummary = async (req, res) => {
  try {
    const total = await OutboundDispatch.count();
    const finalLegs = await OutboundDispatch.count({ where: { IsFinalLeg: true } });
    const pendingSecondLegs = await OutboundDispatch.count({
      where: {
        IsFinalLeg: true,
        DeliveryAgentID: null,
        VehicleID: null,
        ParentDispatchID: { [sequelize.Op.ne]: null }
      }
    });

    res.status(200).json({
      total,
      finalLegs,
      pendingSecondLegs
    });
  } catch (err) {
    console.error("Summary Fetch Error", err);
    res.status(500).json({ message: "Failed to load dispatch summary" });
  }
};

exports.manualSecondLegScan = async (req, res) => {
  try {
    await monitorSecondLegs(); // make sure it's exported from the job file
    res.status(200).json({ message: "Manual scan executed." });
  } catch (err) {
    res.status(500).json({ message: "Manual scan failed.", error: err.message });
  }
};

