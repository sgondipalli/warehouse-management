'use strict';
module.exports = (sequelize, DataTypes) => {
  const TradeItemCountry = sequelize.define("TradeItemCountry", {
    TradeItemCountryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    TradeItemID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'TradeItems', key: 'TradeItemID' },
      onDelete: 'CASCADE'
    },
    CountryCode: { 
      type: DataTypes.STRING,
      allowNull: false,
      references: { model: 'CountryMaster', key: 'ISOCode' }, // 🆕 Connect to CountryMaster
      onDelete: 'CASCADE'
    }
  }, {
    tableName: "TradeItemCountries",
    timestamps: true,
  });

  TradeItemCountry.associate = (models) => {
    TradeItemCountry.belongsTo(models.CountryMaster, {
      foreignKey: "CountryCode",
      targetKey: "ISOCode",
      as: "Country"
    });
  };

  return TradeItemCountry;
};
