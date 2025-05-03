'use strict';
module.exports = (sequelize, DataTypes) => {
  const Rack = sequelize.define("Rack", {
    RackID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ZoneID: { type: DataTypes.INTEGER, allowNull: false },
    RackNumber: { type: DataTypes.STRING, allowNull: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    deletedAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    tableName: "Racks",
    timestamps: true,
    paranoid : true
  });

  Rack.associate = (models) => {
    Rack.belongsTo(models.Zone, { foreignKey: "ZoneID" });
    Rack.hasMany(models.Shelf, { foreignKey: "RackID", as: "Shelves" });
    Rack.hasMany(models.StorageBin, { foreignKey: "RackID", as: "StorageBins" });
  };

  return Rack;
};
