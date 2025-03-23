'use strict';
const { Model } = require('sequelize');
const { generateGTIN14, isValidGTIN14 } = require('../../utils/gtinService');

module.exports = (sequelize, DataTypes) => {
  const TradeItem = sequelize.define("TradeItem", {
    TradeItemID: {  // Correcting Primary Key Name
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
    ProfileRelevantCountry: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    TradeItemCategory: {  
      type: DataTypes.STRING, 
      allowNull: true 
    }
  }, { 
    timestamps: true,  
    tableName: "TradeItems"
  });

  // Auto-generate GTIN-14 before Trade Item is created
  TradeItem.beforeCreate(async (tradeItem, options) => {
      if (!tradeItem.GTIN) {
          const indicator = 1; // Example: 1 for unit-level packaging
          const companyPrefix = "1234567"; // Example GS1 company prefix
          const productCode = tradeItem.TradeItemID || Math.floor(1000 + Math.random() * 9000);
          
          tradeItem.GTIN = generateGTIN14(indicator, companyPrefix, productCode);
      }

      // Validate GTIN-14 after generation
      if (!isValidGTIN14(tradeItem.GTIN)) {
          throw new Error("Invalid GTIN-14 format.");
      }
  });

  // Ensure Correct Foreign Key References
  TradeItem.associate = (models) => {
    TradeItem.hasMany(models.SerialNumbers, { foreignKey: "TradeItemID", onDelete: "CASCADE" });
    TradeItem.hasMany(models.Validations, { foreignKey: "TradeItemID", onDelete: "CASCADE" });
    TradeItem.hasMany(models.StockLevels, { foreignKey: "TradeItemID", onDelete: "CASCADE" });
    TradeItem.hasMany(models.PickingOrders, { foreignKey: "TradeItemID", onDelete: "CASCADE" });
    TradeItem.hasMany(models.WarehouseMovements, { foreignKey: "TradeItemID", onDelete: "CASCADE" });
    TradeItem.hasMany(models.ObjectEncoding, { foreignKey: "TradeItemID", onDelete: "CASCADE" });
  };

  return TradeItem;
};
