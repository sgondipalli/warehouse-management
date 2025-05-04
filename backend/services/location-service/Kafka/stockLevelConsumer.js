// kafka/stockLevelConsumer.js
const { Kafka } = require("kafkajs");
const { StorageBin } = require("../../../common/db/models");
const logger = require("../../../common/utils/logger");

const kafka = new Kafka({
  clientId: "location-service",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "location-group" });

// Safe update function with transaction and locking
const incrementBinStock = async (binId, delta) => {
  const transaction = await StorageBin.sequelize.transaction();
  try {
    const bin = await StorageBin.findByPk(binId, { transaction, lock: true });

    if (!bin) {
      logger.warn(`❗ Bin ${binId} not found`);
      await transaction.rollback();
      return;
    }

    const newStock = bin.CurrentStock + delta;

    if (newStock < 0) {
      logger.warn(`⚠️ Attempt to reduce stock below zero for Bin ${binId}`);
      await transaction.rollback();
      return;
    }

    if (newStock > bin.MaxCapacity) {
      logger.warn(`⚠️ Exceeded max capacity for Bin ${binId}. Max: ${bin.MaxCapacity}, Attempted: ${newStock}`);
      await transaction.rollback();
      return;
    }

    await bin.update({ CurrentStock: newStock }, { transaction });
    await transaction.commit();
    logger.info(`Updated Bin ${binId} stock to ${newStock}`);
  } catch (err) {
    await transaction.rollback();
    logger.error(`Error updating stock for Bin ${binId}`, err);
  }
};

const startConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: "stock-level-events", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value.toString());
        const { eventType, payload } = event;

        try {
          switch (eventType) {
            case "STOCK_LEVEL_CREATED":
              await incrementBinStock(payload.StorageBinID, payload.Quantity);
              break;

            case "STOCK_LEVEL_UPDATED":
              const delta = payload.newQuantity - payload.previousQuantity;
              await incrementBinStock(payload.StorageBinID, delta);
              break;

            case "STOCK_LEVEL_DELETED":
              await incrementBinStock(payload.StorageBinID, -payload.Quantity);
              break;

            default:
              logger.warn(`⚠️ Unhandled event type: ${eventType}`);
          }
        } catch (err) {
          logger.error(`Failed to process ${eventType}`, err);
        }
      },
    });
  } catch (err) {
    logger.error("Kafka consumer initialization failed", err);
  }
};

module.exports = { startConsumer };
