'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const UserRoles = sequelize.define("UserRoles", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Users", key: "id" } },
    roleId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Roles", key: "id" } }  // Fix reference
  }, { timestamps: true, freezeTableName: true });
  

  UserRoles.associate = (models) => {
    UserRoles.belongsTo(models.Users, { foreignKey: "userId" });  // Fix foreign key reference
    UserRoles.belongsTo(models.Roles, { foreignKey: "roleId" });  // Fix foreign key reference
  };

  return UserRoles;
};
