'use strict';
const {
  DeliveryAssignment,
  DeliverySchedule,
  OutboundDispatch,
  OrderItem,
  Vehicle,
  Users
} = require('../../../common/db/models');
const { Op } = require('sequelize');

// ✅ 1. GET: All delivery assignments with agent, vehicle, and dispatch info
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await DeliveryAssignment.findAll({
      include: [
        {
          model: Users,  // Matches your model association
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Vehicle,
          attributes: ['VehicleID', 'VehicleNumber']
        },
        {
          model: OutboundDispatch,
          attributes: ['DispatchID', 'DispatchDate', 'IsFinalLeg', 'Status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(assignments);
  } catch (err) {
    console.error("Get assignments failed:", err);
    res.status(500).json({ message: "Failed to fetch assignments" });
  }
};

// ✅ 2. GET: Dispatches eligible for final-leg assignment
exports.getFinalLegDispatchesToAssign = async (req, res) => {
  try {
    const unassignedFinalLegs = await OutboundDispatch.findAll({
      where: {
        IsFinalLeg: true,
        DeliveryAgentID: null,
        VehicleID: { [Op.ne]: null }
      },
      include: [
        {
          model: OrderItem,
          attributes: ['OrderItemID', 'TradeItemID', 'Quantity']
        }
      ]
    });

    res.status(200).json(unassignedFinalLegs);
  } catch (err) {
    console.error("Failed to fetch dispatches to assign", err);
    res.status(500).json({ message: "Error fetching dispatches" });
  }
};

// ✅ 3. POST: Assign delivery agent to a final-leg dispatch
exports.assignAgent = async (req, res) => {
  const { DispatchID, DeliveryAgentID, Status = "ASSIGNED", Remarks = "" } = req.body;

  try {
    // Validate dispatch
    const dispatch = await OutboundDispatch.findByPk(DispatchID);
    if (!dispatch || !dispatch.IsFinalLeg) {
      return res.status(404).json({ message: "Invalid or non-final-leg dispatch" });
    }

    // Check delivery agent availability
    const conflict = await DeliverySchedule.findOne({
      where: {
        DispatchDate: dispatch.DispatchDate,
        DeliveryAgentID
      }
    });

    if (conflict) {
      return res.status(400).json({ message: "Agent is already scheduled on this date" });
    }

    // ✅ Create assignment
    const assignment = await DeliveryAssignment.create({
      OutboundDispatchID: DispatchID,
      DeliveryAgentID,
      VehicleID: dispatch.VehicleID,
      Status,
      AssignedAt: new Date()
    });

    // ✅ Update OutboundDispatch
    dispatch.DeliveryAgentID = DeliveryAgentID;
    dispatch.Status = Status;
    await dispatch.save();

    // ✅ Update delivery schedule
    await DeliverySchedule.create({
      DispatchDate: dispatch.DispatchDate,
      DeliveryAgentID,
      VehicleID: dispatch.VehicleID,
      Status
    });

    res.status(201).json(assignment);
  } catch (err) {
    console.error("Assign agent failed:", err);
    res.status(500).json({ message: "Failed to assign delivery agent", error: err.message });
  }
};
