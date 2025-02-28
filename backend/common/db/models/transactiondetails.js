'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const TransactionDetails = sequelize.define("TransactionDetails", {
    TransactionDetailID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TransactionID: { type: DataTypes.INTEGER, allowNull: false },
    TradeItemID: { type: DataTypes.INTEGER, allowNull: false },
    Quantity: { type: DataTypes.INTEGER, allowNull: false }
  });

  TransactionDetails.associate = (models) => {
    TransactionDetails.belongsTo(models.Transactions, { foreignKey: "TransactionID" });
    TransactionDetails.belongsTo(models.TradeItem, { foreignKey: "TradeItemID" });
  };

  return TransactionDetails;
};
