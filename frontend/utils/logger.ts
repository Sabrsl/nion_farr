/**
 * Simple logger utility for the application
 */
export class Logger {
  info(message: string, data?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[INFO] ${message}`, data ?? '');
    }
  }

  warn(message: string, data?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[WARNING] ${message}`, data ?? '');
    }
  }

  error(message: string, data?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[ERROR] ${message}`, data ?? '');
    }
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data ?? '');
    }
  }
}

// Export a singleton instance
export const logger = new Logger(); 