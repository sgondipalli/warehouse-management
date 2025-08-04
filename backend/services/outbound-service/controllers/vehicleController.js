'use strict';
const { Vehicle, DeliverySchedule, OutboundDispatch, deliveryAssignment } = require("../../../common/db/models");
const { Op } = require("sequelize");

// Create vehicle
exports.createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ message: "Vehicle created", data: vehicle });
  } catch (err) {
    console.error("Create Vehicle Error", err);
    res.status(500).json({ message: "Failed to create vehicle", error: err.message });
  }
};

// Get all vehicles
exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll();
    res.status(200).json(vehicles);
  } catch (err) {
    console.error("Get Vehicles Error", err);
    res.status(500).json({ message: "Failed to fetch vehicles", error: err.message });
  }
};

// Update vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    await vehicle.update(req.body);
    res.status(200).json({ message: "Vehicle updated", data: vehicle });
  } catch (err) {
    console.error("Update Vehicle Error", err);
    res.status(500).json({ message: "Failed to update vehicle", error: err.message });
  }
};

// Delete vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    await vehicle.destroy();
    res.status(200).json({ message: "Vehicle deleted" });
  } catch (err) {
    console.error("Delete Vehicle Error", err);
    res.status(500).json({ message: "Failed to delete vehicle", error: err.message });
  }
};


// Get available vehicles for a given date
exports.getAvailableVehicles = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const busySchedules = await DeliverySchedule.findAll({ where: { DispatchDate: date } });
    const busyVehicleIds = busySchedules.map(schedule => schedule.VehicleID);

    const availableVehicles = await Vehicle.findAll({
      where: {
        VehicleID: {
          [Op.notIn]: busyVehicleIds
        }
      }
    });

    res.status(200).json(availableVehicles);
  } catch (err) {
    console.error("Get Available Vehicles Error", err);
    res.status(500).json({ message: "Failed to fetch available vehicles", error: err.message });
  }
};

exports.assignFinalLeg = async (req, res) => {
  try {
    const { id } = req.params;
    const { VehicleID, DeliveryAgentID } = req.body;

    const dispatch = await OutboundDispatch.findByPk(id);
    if (!dispatch || !dispatch.IsFinalLeg) {
      return res.status(404).json({ message: "Final-leg dispatch not found" });
    }

    // Update the dispatch record
    await dispatch.update({
      VehicleID,
      DeliveryAgentID,
      Status: "Dispatched"
    });

    // Log delivery assignment
    await DeliveryAssignment.create({
      OutboundDispatchID: dispatch.DispatchID,
      VehicleID,
      DeliveryAgentID,
      Status: "ASSIGNED",
      AssignedAt: new Date()
    });

    // Ensure DeliverySchedule entry for both agent and vehicle
    const dispatchDate = dispatch.DispatchDate?.toISOString().split("T")[0];
    if (dispatchDate) {
      await Promise.all([
        DeliverySchedule.findOrCreate({
          where: { DispatchDate: dispatchDate, DeliveryAgentID },
          defaults: { VehicleID, Status: "ASSIGNED" }
        }),
        DeliverySchedule.findOrCreate({
          where: { DispatchDate: dispatchDate, VehicleID },
          defaults: { DeliveryAgentID, Status: "ASSIGNED" }
        }),
      ]);
    }

    res.status(200).json({ message: "Final-leg dispatch assigned successfully", dispatch });
  } catch (error) {
    console.error("Assign Final Leg Error:", error);
    res.status(500).json({ message: "Failed to assign final leg", error: error.message });
  }
};
