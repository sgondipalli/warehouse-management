'use strict';
const cron = require("node-cron");
const { Op } = require("sequelize");
const { OutboundDispatch } = require("../../../common/db/models");

const monitorSecondLegs = async () => {
  try {
    const THRESHOLD_MINUTES = 30;
    const cutoffTime = new Date(Date.now() - THRESHOLD_MINUTES * 60 * 1000);

    const delayedDispatches = await OutboundDispatch.findAll({
      where: {
        IsFinalLeg: true,
        DeliveryAgentID: null,
        VehicleID: null,
        createdAt: { [Op.lt]: cutoffTime },
        ParentDispatchID: { [Op.ne]: null },
      }
    });

    if (delayedDispatches.length) {
      console.warn(`⚠️ ${delayedDispatches.length} second-leg dispatches are delayed.`);
      delayedDispatches.forEach(d => {
        console.warn(`→ Dispatch #${d.DispatchID} (Parent: #${d.ParentDispatchID}) delayed since ${d.createdAt}`);
      });
      // Optional: send email/SMS/slack alert here
    } else {
      console.log("✅ No delayed second-leg dispatches at this interval.");
    }
  } catch (err) {
    console.error("❌ Error in second-leg cron monitor", err);
  }
};

// Schedule to run every 10 minutes
cron.schedule("*/10 * * * *", monitorSecondLegs);
