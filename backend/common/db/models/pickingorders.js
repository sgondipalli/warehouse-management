'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const PickingOrders = sequelize.define("PickingOrders", {
    OrderID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TradeItemID: { type: DataTypes.INTEGER, allowNull: false },
    Quantity: { type: DataTypes.INTEGER, allowNull: false },
    Status: { type: DataTypes.STRING, allowNull: false }
  });

  PickingOrders.associate = (models) => {
    PickingOrders.belongsTo(models.TradeItem, { foreignKey: "TradeItemID" });
  };

  return PickingOrders;
};
