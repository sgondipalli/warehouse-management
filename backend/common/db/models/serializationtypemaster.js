'use strict';
module.exports = (sequelize, DataTypes) => {
  const SerializationTypeMaster = sequelize.define("SerializationTypeMaster", {
    SerializationTypeID: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    TypeCode: { type: DataTypes.STRING, allowNull: false },
    TypeDescription: { type: DataTypes.STRING, allowNull: true }
  }, {
    timestamps: false,
    tableName: "SerializationTypeMaster"
  });
  return SerializationTypeMaster;
};
