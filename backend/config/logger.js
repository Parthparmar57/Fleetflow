import winston from 'winston';
import 'winston-mongodb';

const { combine, timestamp, json, printf, colorize } = winston.format;

// Custom format for console
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      )
    }),
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Add MongoDB transport in production
if (process.env.NODE_ENV === 'production' && process.env.MONGODB_URI) {
  logger.add(
    new winston.transports.MongoDB({
      db: process.env.MONGODB_URI,
      collection: 'logs',
      level: 'error',
      options: { useUnifiedTopology: true },
      metaKey: 'metadata'
    })
  );
}

// Security event logger
export const logSecurityEvent = (event, details) => {
  logger.warn('SECURITY_EVENT', {
    event,
    ...details,
    timestamp: new Date().toISOString()
  });
};

export default logger;
