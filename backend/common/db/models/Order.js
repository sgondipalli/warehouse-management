'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order", {
    OrderID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    CustomerName: { type: DataTypes.STRING, allowNull: true },  // ✅ now nullable
    CustomerAddress: { type: DataTypes.STRING, allowNull: true },  // ✅ now nullable

    OrderDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },

    Status: {
      type: DataTypes.ENUM("PENDING", "ALLOCATED", "DISPATCHED", "DELIVERED", "CANCELLED"),
      defaultValue: "PENDING"
    },

    SourceWarehouseID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "LocationMaster", key: "LocationID" }
    },

    DestinationWarehouseID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "LocationMaster", key: "LocationID" }
    },

    DeliveryType: {
      type: DataTypes.ENUM("W2W", "W2C"),  // ✅ added to model
      allowNull: false,
      defaultValue: "W2W"
    },

    CreatedByUserID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Users", key: "id" }
    },

    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: "Orders",
    timestamps: true
  });

  Order.associate = (models) => {
    Order.hasMany(models.OrderItem, { foreignKey: "OrderID", as: "Items" });
    Order.belongsTo(models.LocationMaster, { foreignKey: "SourceWarehouseID", as: "SourceWarehouse" });
    Order.belongsTo(models.LocationMaster, { foreignKey: "DestinationWarehouseID", as: "DestinationWarehouse" });
    Order.belongsTo(models.Users, { foreignKey: "CreatedByUserID", as: "CreatedBy" });
  };

  return Order;
};
