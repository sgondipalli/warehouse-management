'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Permissions = sequelize.define("Permissions", {
    permissionId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    permissionName: { type: DataTypes.STRING, unique: true, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true }
  });

  Permissions.associate = (models) => {
    Permissions.belongsToMany(models.Roles, { through: models.RolePermissions, foreignKey: "permissionId" });
  };

  return Permissions;
};
