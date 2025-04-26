'use strict';

module.exports = (sequelize, DataTypes) => {
  const Inbound = sequelize.define("Inbound", {
    InboundID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    TradeItemID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    StorageBinID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ReceivedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    BatchNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    SupplierID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Suppliers",
        key: "SupplierID",
      },
    },
    DeliveryDocument: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ReceivedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    Remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ExpectedDeliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ReceivedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ConditionOnArrival: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    PurchaseOrderNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    LocationID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: "Inbounds",
    timestamps: true,
  });

  Inbound.associate = (models) => {
    Inbound.belongsTo(models.TradeItem, { foreignKey: "TradeItemID" });
    Inbound.belongsTo(models.StorageBin, { foreignKey: "StorageBinID" });
    Inbound.belongsTo(models.Users, { foreignKey: "ReceivedBy" });
    Inbound.belongsTo(models.Supplier, { foreignKey: "SupplierID" });
    Inbound.belongsTo(models.LocationMaster, { foreignKey: "LocationID", as: "Location" });
  };

  return Inbound;
};
