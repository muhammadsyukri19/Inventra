import winston from 'winston';
import { env } from '../config/env';

/**
 * Application logger using Winston.
 *
 * Structured JSON logging in production, colorized console output in development.
 */

const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  env.NODE_ENV === 'production'
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} [${level}]: ${stack ?? message}`;
        })
      )
);

export const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [new winston.transports.Console()],
  exceptionHandlers: [new winston.transports.Console()],
  rejectionHandlers: [new winston.transports.Console()],
});
