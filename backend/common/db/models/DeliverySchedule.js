// models/DeliverySchedule.js
module.exports = (sequelize, DataTypes) => {
    const DeliverySchedule = sequelize.define("DeliverySchedule", {
        ScheduleID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        DeliveryAgentID: { type: DataTypes.INTEGER, allowNull: false },
        VehicleID: { type: DataTypes.INTEGER, allowNull: false },
        DispatchDate: { type: DataTypes.DATEONLY, allowNull: false },
        Status: { type: DataTypes.STRING, defaultValue: "ASSIGNED" }
    }, {
        tableName: "DeliverySchedules",
        timestamps: true
    });

    return DeliverySchedule;
};
