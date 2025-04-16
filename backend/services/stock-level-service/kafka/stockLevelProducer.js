const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "stock-level-service",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();
const topic = "stock-level-events";

const connectProducer = async () => {
  await producer.connect();
};

const publishEvent = async (eventType, payload) => {
  await connectProducer();
  await producer.send({
    topic,
    messages: [
      {
        key: eventType,
        value: JSON.stringify({ eventType, payload, timestamp: new Date() }),
      },
    ],
  });
};

const publishStockCreated = async (stock) => {
  await publishEvent("STOCK_LEVEL_CREATED", stock);
};

const publishStockUpdated = async (stock) => {
  await publishEvent("STOCK_LEVEL_UPDATED", stock);
};

const publishStockDeleted = async (id) => {
  await publishEvent("STOCK_LEVEL_DELETED", { StockLevelID: id });
};

module.exports = {
  publishStockCreated,
  publishStockUpdated,
  publishStockDeleted,
};
