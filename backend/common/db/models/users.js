'use strict';
const { Model } = require('sequelize');
const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define("Users", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },  // Ensure ID consistency
    username: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: true },
    lastName: { type: DataTypes.STRING, allowNull: true },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false }, // soft delete implementation
  });

  Users.associate = (models) => {
    Users.belongsToMany(models.Roles, { 
      through: models.UserRoles, 
      foreignKey: "userId"  // Fix FK reference in association
    });
    Users.hasMany(models.Inbound, { foreignKey: "ReceivedBy" });
  };
  
  // Hash password before saving user
  Users.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
  });


  return Users;
};
