const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "trade-item-service",
  brokers: ["localhost:9092"], // Update if using different broker config
});

const producer = kafka.producer();
const topic = "trade-items-events";

const connectProducer = async () => {
  await producer.connect();
};

// Utility to publish messages
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

// Publish Trade Item Created
const publishTradeItemCreated = async (tradeItem) => {
  await publishEvent("TRADE_ITEM_CREATED", tradeItem);
};

// Publish Trade Item Updated
const publishTradeItemUpdated = async (tradeItem) => {
  await publishEvent("TRADE_ITEM_UPDATED", tradeItem);
};

// Publish Trade Item Deleted
const publishTradeItemDeleted = async (id) => {
  await publishEvent("TRADE_ITEM_DELETED", { TradeItemID: id });
};

module.exports = {
  publishTradeItemCreated,
  publishTradeItemUpdated,
  publishTradeItemDeleted,
};
