'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StorageBin extends Model {
    static associate(models) {
      StorageBin.belongsTo(models.LocationMaster, { foreignKey: "LocationID" });
      StorageBin.belongsTo(models.Zone, { foreignKey: "ZoneID" });
      StorageBin.belongsTo(models.Rack, { foreignKey: "RackID" });
      StorageBin.belongsTo(models.Shelf, { foreignKey: "ShelfID" });
      StorageBin.hasMany(models.StockLevels, {
        foreignKey: "StorageBinID",
        as: "StockLevels"
      });
    }
  }

  StorageBin.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    BinNumber: { type: DataTypes.STRING, unique: true, allowNull: false },
    LocationID: { type: DataTypes.INTEGER, allowNull: false },
    ZoneID: { type: DataTypes.INTEGER, allowNull: true },
    RackID: { type: DataTypes.INTEGER, allowNull: true },
    ShelfID: { type: DataTypes.INTEGER, allowNull: true },
    MaxCapacity: { type: DataTypes.INTEGER, allowNull: false },
    CurrentStock: { type: DataTypes.INTEGER, allowNull: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    deletedAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    modelName: 'StorageBin',
    tableName: 'StorageBins',
    timestamps: true,
    paranoid: true
  });

  return StorageBin;
};
