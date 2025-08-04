const {
  sequelize,
  OutboundDispatch,
  OrderItem,
  Vehicle,
  Users,
  LocationMaster,
  Order,
  DeliveryAssignment,
  DeliverySchedule
} = require("../../../common/db/models");
const { publishOutboundDispatched } = require("../kafka/outboundProducer");
const { Op } = require("sequelize");
const { monitorSecondLegs} = require("../jobs/secondLegMonitor");

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

    const orderItem = await OrderItem.findByPk(OrderItemID);
    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    if (AssignedLocationID) {
      const locationExists = await LocationMaster.findByPk(AssignedLocationID);
      if (!locationExists) {
        return res.status(400).json({ message: "Invalid Assigned Location ID" });
      }
    }

    const firstLeg = await OutboundDispatch.create({
      OrderItemID,
      VehicleID,
      DeliveryAgentID,
      SourceWarehouseID,
      DestinationWarehouseID,
      AssignedLocationID,
      Remarks,
      IsFinalLeg,
      ParentDispatchID: null,
      CustomerName,
      CustomerAddress,
      DispatchDate: new Date()
    }, { transaction: t });

    if (!IsFinalLeg) {
      await DeliveryAssignment.create({
        OutboundDispatchID: firstLeg.DispatchID,
        VehicleID,
        DeliveryAgentID,
        AssignedAt: new Date(),
        Status: "ASSIGNED"
      }, { transaction: t });

      await DeliverySchedule.create({
        VehicleID,
        DeliveryAgentID,
        DispatchDate: new Date().toISOString().split("T")[0],
        Status: "ASSIGNED"
      }, { transaction: t });

      await Vehicle.update(
        { Status: "IN_USE" },
        { where: { VehicleID }, transaction: t }
      );
    }

    await publishOutboundDispatched({
      ...firstLeg.toJSON(),
      TradeItemID: orderItem.TradeItemID,
      DispatchedQuantity: orderItem.Quantity
    });

    let secondLeg = null;
    const isW2C = CustomerName && CustomerAddress;
    if (!IsFinalLeg && isW2C) {
      secondLeg = await OutboundDispatch.create({
        OrderItemID,
        SourceWarehouseID: DestinationWarehouseID,
        DestinationWarehouseID: null,
        DeliveryAgentID: null,
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

    const orderId = orderItem.OrderID;
    const allOrderItems = await OrderItem.findAll({ where: { OrderID: orderId }, transaction: t });

    const dispatchedItemRecords = await OutboundDispatch.findAll({
      attributes: ["OrderItemID"],
      where: { OrderItemID: allOrderItems.map(item => item.OrderItemID) },
      transaction: t
    });

    const dispatchedItemIDs = dispatchedItemRecords.map(record => record.OrderItemID);
    const allItemsDispatched = allOrderItems.every(item => dispatchedItemIDs.includes(item.OrderItemID));

    if (allItemsDispatched) {
      await Order.update(
        { Status: "DISPATCHED" },
        { where: { OrderID: orderId }, transaction: t }
      );
    }

    await t.commit();
    return res.status(201).json({ message: "Dispatch created successfully", firstLeg, secondLeg });
  } catch (err) {
    await t.rollback();
    console.error("Create Dispatch Error", err);
    res.status(500).json({ message: "Failed to create dispatch", error: err.message });
  }
};

exports.getDispatches = async (req, res) => {
  try {
    const user = req.user;
    const roles = Array.isArray(user.roles) ? user.roles : [];
    const isManager = roles.includes("Warehouse Manager");
    const isAgent = roles.includes("Delivery Agent");
    const isSuperAdmin = roles.includes("Super Admin");

    let whereCondition = {};
    if (isAgent) {
      whereCondition = { DeliveryAgentID: user.id };
    } else if (isManager && Array.isArray(user.assignedLocationIds) && user.assignedLocationIds.length > 0) {
      whereCondition = { AssignedLocationID: user.assignedLocationIds };
    }

    const dispatches = await OutboundDispatch.findAll({
      where: whereCondition,
      include: [
        { model: OrderItem, as: "OrderItem" },
        { model: Users, as: "DeliveryAgent" },
        { model: Vehicle, as: "Vehicle" },
        { model: LocationMaster, as: "AssignedLocation" },
        { model: OutboundDispatch, as: "ParentDispatch", attributes: ["DispatchID"] }
      ],
      order: [["DispatchDate", "DESC"]]
    });

    const result = dispatches.map(d => ({
      ...d.toJSON(),
      isLinkedToAnother: !!d.ParentDispatchID,
      isFinalLeg: d.IsFinalLeg,
      parentLink: d.ParentDispatch ? d.ParentDispatch.DispatchID : null
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("Fetch Manage Dispatch Error", err);
    res.status(500).json({ message: "Failed to fetch manage dispatches", error: err.message });
  }
};

exports.updateDispatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const dispatch = await OutboundDispatch.findByPk(id);
    if (!dispatch) return res.status(404).json({ message: "Dispatch not found" });

    if (updateData.AssignedLocationID) {
      const locationExists = await LocationMaster.findByPk(updateData.AssignedLocationID);
      if (!locationExists) {
        return res.status(400).json({ message: "Invalid Assigned Location ID" });
      }
    }

    await dispatch.update(updateData);
    res.status(200).json({ message: "Dispatch updated", data: dispatch });
  } catch (err) {
    console.error("Update Dispatch Error", err);
    res.status(500).json({ message: "Failed to update dispatch", error: err.message });
  }
};

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
        ParentDispatchID: { [Op.ne]: null }
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
        ParentDispatchID: { [Op.ne]: null }
      }
    });
    res.status(200).json({ total, finalLegs, pendingSecondLegs });
  } catch (err) {
    console.error("Summary Fetch Error", err);
    res.status(500).json({ message: "Failed to load dispatch summary" });
  }
};

exports.manualSecondLegScan = async (req, res) => {
  try {
    await monitorSecondLegs();
    res.status(200).json({ message: "Manual scan executed." });
  } catch (err) {
    res.status(500).json({ message: "Manual scan failed.", error: err.message });
  }
};

exports.markDispatchAsDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const dispatch = await OutboundDispatch.findByPk(id);
    if (!dispatch) return res.status(404).json({ message: "Dispatch not found" });

    await dispatch.update({ Status: "Delivered" });
    await DeliveryAssignment.update(
      { Status: "Delivered" },
      { where: { OutboundDispatchID: id } }
    );

    const dispatchDate = dispatch.DispatchDate?.toISOString().split("T")[0];
    await DeliverySchedule.update(
      { Status: "Delivered" },
      {
        where: {
          DispatchDate: dispatchDate,
          [Op.or]: [
            { DeliveryAgentID: dispatch.DeliveryAgentID },
            { VehicleID: dispatch.VehicleID }
          ]
        }
      }
    );

    if (dispatch.VehicleID) {
      const vehicle = await Vehicle.findByPk(dispatch.VehicleID);
      if (vehicle && vehicle.Status !== "MAINTENANCE") {
        await vehicle.update({ Status: "AVAILABLE" });
      }
    }

    res.status(200).json({ message: "✅ Dispatch marked as delivered." });
  } catch (err) {
    console.error("Delivery completion error:", err);
    res.status(500).json({ message: "Failed to mark dispatch delivered", error: err.message });
  }
};


exports.assignFinalLegDispatch = async (req, res) => {
  const { dispatchId } = req.params;
  const { VehicleID, DeliveryAgentID } = req.body;

  try {
    const dispatch = await OutboundDispatch.findByPk(dispatchId);
    if (!dispatch || !dispatch.IsFinalLeg) {
      return res.status(404).json({ message: "Final leg dispatch not found" });
    }

    dispatch.VehicleID = VehicleID;
    dispatch.DeliveryAgentID = DeliveryAgentID;
    dispatch.Status = "Dispatched";
    await dispatch.save();

    return res.json({ message: "Final leg dispatch assigned successfully", dispatch });
  } catch (err) {
    console.error("❌ Error assigning final-leg dispatch:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
