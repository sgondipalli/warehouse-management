'use strict';
const { generateGTIN14, isValidGTIN14 } = require('../../utils/gtinService');

module.exports = (sequelize, DataTypes) => {
  const TradeItem = sequelize.define("TradeItem", {
    TradeItemID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    GTIN: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    MaterialNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    UnitOfMeasure: {
      type: DataTypes.STRING,
      allowNull: false
    },
    TradeItemDescription: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    SerializationType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    TradeItemCategory: {
      type: DataTypes.STRING,
      allowNull: true
    },
    CreatedByUserID: { type: DataTypes.INTEGER },
    UpdatedByUserID: { type: DataTypes.INTEGER },
    Status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    deletedAt: { type: DataTypes.DATE }
  }, {
    timestamps: true,
    tableName: "TradeItems"
  });

  TradeItem.beforeCreate(async (tradeItem) => {
    if (!tradeItem.GTIN) {
      const indicator = 1;
      const companyPrefix = "1234567";
      const productCode = tradeItem.TradeItemID || Math.floor(1000 + Math.random() * 9000);
      tradeItem.GTIN = generateGTIN14(indicator, companyPrefix, productCode);
    }
    if (!isValidGTIN14(tradeItem.GTIN)) {
      throw new Error("Invalid GTIN-14 format.");
    }
  });

  TradeItem.associate = (models) => {
    // ✅ No more belongsTo Supplier
    TradeItem.hasMany(models.SerialNumbers, { foreignKey: "TradeItemID", onDelete: "CASCADE" });
    TradeItem.hasMany(models.Validations, { foreignKey: "TradeItemID", onDelete: "CASCADE" });
    TradeItem.hasMany(models.StockLevels, { foreignKey: "TradeItemID", onDelete: "CASCADE" });
    TradeItem.hasMany(models.PickingOrders, { foreignKey: "TradeItemID", onDelete: "CASCADE" });
    TradeItem.hasMany(models.WarehouseMovements, { foreignKey: "TradeItemID", onDelete: "CASCADE" });
    TradeItem.hasMany(models.ObjectEncoding, { foreignKey: "TradeItemID", onDelete: "CASCADE" });

    TradeItem.hasMany(models.TradeItemSupplier, { foreignKey: "TradeItemID" });
    TradeItem.hasMany(models.TradeItemCountry, { foreignKey: "TradeItemID" });
  };

  return TradeItem;
};
