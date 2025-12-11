/**
 * Centralized Logger Module
 * Fornece logging estruturado para toda a aplicação
 */

import winston from 'winston';
import { ENV } from './env';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
  })
);

const transports: winston.transport[] = [
  // Console output
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} [${level}]: ${message}${metaStr}`;
      })
    ),
  }),

  // Error log file
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // Combined log file
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Em produção, adicionar transporte para arquivo de auditoria
if (ENV.isProduction) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/audit.log',
      level: 'warn',
      format: logFormat,
      maxsize: 5242880,
      maxFiles: 10,
    })
  );
}

export const logger = winston.createLogger({
  level: ENV.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: 'logs/exceptions.log',
      format: logFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: 'logs/rejections.log',
      format: logFormat,
    }),
  ],
});

/**
 * Criar child logger com contexto
 */
export function createChildLogger(context: string) {
  return logger.child({ context });
}

/**
 * Log de auditoria para eventos de segurança
 */
export function logAudit(event: string, details: Record<string, any>) {
  logger.warn(`AUDIT: ${event}`, {
    timestamp: new Date().toISOString(),
    ...details,
  });
}

/**
 * Log de erro com stack trace
 */
export function logError(message: string, error: Error, context?: Record<string, any>) {
  logger.error(message, {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    ...context,
  });
}

/**
 * Log de performance
 */
export function logPerformance(operation: string, duration: number, context?: Record<string, any>) {
  const level = duration > 1000 ? 'warn' : 'debug';
  logger[level as 'warn' | 'debug'](`Performance: ${operation}`, {
    duration: `${duration}ms`,
    ...context,
  });
}

export default logger;
