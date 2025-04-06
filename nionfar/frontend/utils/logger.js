/**
 * Simple logger utility for client-side logging
 */

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

// Set default log level based on environment
const DEFAULT_LEVEL = process.env.NODE_ENV === 'production' ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;

export const logger = {
  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  warn: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  info: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  debug: (message, ...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  
  // Log with explicit level
  log: (level, message, ...args) => {
    switch (level) {
      case LOG_LEVELS.ERROR:
        logger.error(message, ...args);
        break;
      case LOG_LEVELS.WARN:
        logger.warn(message, ...args);
        break;
      case LOG_LEVELS.INFO:
        logger.info(message, ...args);
        break;
      case LOG_LEVELS.DEBUG:
        logger.debug(message, ...args);
        break;
      default:
        logger.info(message, ...args);
    }
  }
}; 