'use strict';
module.exports = (sequelize, DataTypes) => {
    const CountryMaster = sequelize.define("CountryMaster", {
        CountryID: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        CountryName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ISOCode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        CountryCode: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        timestamps: false,
        tableName: "CountryMaster"
    });

    return CountryMaster;
};