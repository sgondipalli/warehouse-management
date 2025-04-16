'use strict';
module.exports = (sequelize, DataTypes) => {
  const Zone = sequelize.define("Zone", {
    ZoneID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    LocationID: { type: DataTypes.INTEGER, allowNull: false },
    ZoneName: { type: DataTypes.STRING, allowNull: false },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    deletedAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    sequelize,
    tableName: "Zones",
    timestamps: true,
    paranoid: true,
  });

  Zone.associate = (models) => {
    Zone.belongsTo(models.LocationMaster, { foreignKey: "LocationID" });
    Zone.hasMany(models.Rack, { foreignKey: "ZoneID" });
    Zone.hasMany(models.StorageBin, { foreignKey: "ZoneID" });
  };

  return Zone;
};
