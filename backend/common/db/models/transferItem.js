// model/transferItem.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const TransferItem = sequelize.define("TransferItem", {
    TransferItemID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TransferID: { type: DataTypes.INTEGER, allowNull: false },
    TradeItemID: { type: DataTypes.INTEGER, allowNull: false },
    Quantity: { type: DataTypes.INTEGER, allowNull: false },
  }, { tableName: "TransferItems", timestamps: true });

  TransferItem.associate = (models) => {
    TransferItem.belongsTo(models.Transfer, { foreignKey: 'TransferID' });
    TransferItem.belongsTo(models.TradeItem, { foreignKey: 'TradeItemID' });
  };

  return TransferItem;
};
