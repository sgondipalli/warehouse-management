// model/deliveryAssignment.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const DeliveryAssignment = sequelize.define("DeliveryAssignment", {
    AssignmentID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    OutboundDispatchID: { type: DataTypes.INTEGER, allowNull: false },
    VehicleID: { type: DataTypes.INTEGER, allowNull: false },
    DeliveryAgentID: { type: DataTypes.INTEGER, allowNull: false },
    AssignedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    Status: { type: DataTypes.STRING, defaultValue: "ASSIGNED" }
  }, { tableName: "DeliveryAssignments", timestamps: true });

  DeliveryAssignment.associate = (models) => {
    DeliveryAssignment.belongsTo(models.OutboundDispatch, { foreignKey: 'OutboundDispatchID' });
    DeliveryAssignment.belongsTo(models.Vehicle, { foreignKey: 'VehicleID' });
    DeliveryAssignment.belongsTo(models.Users, { foreignKey: 'DeliveryAgentID' });
  };

  return DeliveryAssignment;
};
