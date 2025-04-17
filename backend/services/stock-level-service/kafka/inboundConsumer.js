'use strict';
const { Kafka } = require("kafkajs");
const { StockLevels, StorageBin } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");

const kafka = new Kafka({
  clientId: "stock-level-service-consumer",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "stock-level-group" });

const startConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "inbound-events", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const parsed = JSON.parse(message.value.toString());
          const { eventType, payload } = parsed;

          logger.info(`📩 Received Kafka Message: ${eventType}`);

          if (eventType === "INBOUND_CREATED") {
            const TradeItemID = parseInt(payload.TradeItemID);
            const StorageBinID = parseInt(payload.StorageBinID);
            const ReceivedQuantity = parseInt(payload.ReceivedQuantity);

            if (!TradeItemID || !StorageBinID || !ReceivedQuantity) {
              logger.warn("⚠️ Missing fields in INBOUND_CREATED payload");
              return;
            }

            const bin = await StorageBin.findByPk(StorageBinID);
            if (!bin) {
              logger.warn(`❌ Bin ID ${StorageBinID} not found`);
              return;
            }

            const LocationID = bin.LocationID;

            const existing = await StockLevels.findOne({ where: { TradeItemID, StorageBinID } });

            if (existing) {
              existing.Quantity += ReceivedQuantity;
              existing.LastUpdated = new Date();
              await existing.save();
              logger.info(`🔁 Updated Stock Level ID ${existing.StockLevelID}`);
            } else {
              const newStock = await StockLevels.create({
                TradeItemID,
                StorageBinID,
                LocationID,
                Quantity: ReceivedQuantity,
                LastUpdated: new Date(),
              });
              logger.info(`🆕 Created New Stock Level ID ${newStock.StockLevelID}`);
            }
          }
        } catch (err) {
          logger.error("💥 Error processing Kafka message", err);
        }
      },
    });

    logger.info("🚀 Kafka consumer for inbound-events is running...");
  } catch (err) {
    logger.error("❌ Kafka consumer connection error", err);
  }
};

module.exports = { startConsumer };
