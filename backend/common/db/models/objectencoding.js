'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const ObjectEncoding = sequelize.define("ObjectEncoding", {
    EncodingID: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    TradeItemID: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      references: { model: "TradeItems", key: "TradeItemID" },
      onDelete: "CASCADE"
    },
    ObjectType: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    EncodingFormat: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    Owner: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    Product: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    Serial: { 
      type: DataTypes.STRING, 
      unique: true, 
      allowNull: false 
    }
  }, { 
    timestamps: true, 
    tableName: "ObjectEncodings"
  });

  ObjectEncoding.associate = (models) => {
    ObjectEncoding.belongsTo(models.TradeItem, { foreignKey: "TradeItemID", onDelete: "CASCADE" });
  };

  return ObjectEncoding;
};
