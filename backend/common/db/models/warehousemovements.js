'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const WarehouseMovements = sequelize.define("WarehouseMovements", {
    MovementID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TradeItemID: { type: DataTypes.INTEGER, allowNull: false },
    SourceLocationID: { type: DataTypes.INTEGER, allowNull: false },
    DestinationLocationID: { type: DataTypes.INTEGER, allowNull: false },
    Quantity: { type: DataTypes.INTEGER, allowNull: false },
    Timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });

  WarehouseMovements.associate = (models) => {
    WarehouseMovements.belongsTo(models.TradeItem, { foreignKey: "TradeItemID" });
    WarehouseMovements.belongsTo(models.LocationMaster, { as: "SourceLocation", foreignKey: "SourceLocationID" });
    WarehouseMovements.belongsTo(models.LocationMaster, { as: "DestinationLocation", foreignKey: "DestinationLocationID" });
  };

  return WarehouseMovements;
};
