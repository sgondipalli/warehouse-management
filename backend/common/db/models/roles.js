'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const Roles = sequelize.define("Roles", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },  // Change roleId to id
    roleName: { type: DataTypes.STRING, unique: true, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true }
  });
  

  Roles.associate = (models) => {
    Roles.belongsToMany(models.Users, { 
      through: models.UserRoles, 
      foreignKey: "roleId" 
    });
    Roles.belongsToMany(models.Permissions, { 
      through: models.RolePermissions, 
      foreignKey: "roleId" 
    });
  };

  return Roles;
};
