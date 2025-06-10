// models/OrderItem.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define("OrderItem", {
    OrderItemID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    OrderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Orders", key: "OrderID" }
    },
    TradeItemID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "TradeItems", key: "TradeItemID" }
    },
    Quantity: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: "OrderItems",
    timestamps: true
  });

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, { foreignKey: "OrderID" });
    OrderItem.belongsTo(models.TradeItem, { foreignKey: "TradeItemID" });
  };

  return OrderItem;
};
