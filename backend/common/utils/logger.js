// backend/common/utils/logger.js

const { createLogger, format, transports } = require('winston');
const path = require('path');

// Custom structured log formatting for clear readability
const customFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack, ...metadata }) => {
    let msg = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (stack) msg += `\nStack Trace: ${stack}`;
    if (Object.keys(metadata).length > 0) msg += ` | Metadata: ${JSON.stringify(metadata)}`;
    return msg;
  }),
);

// Create Logger Instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info', // Default level: info, configurable through env
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.json(),
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

// In development mode, enhance console readability
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  );
}

module.exports = logger;
