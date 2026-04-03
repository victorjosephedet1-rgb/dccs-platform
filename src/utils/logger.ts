const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
       
      console.log('[DEBUG]', ...args);
    }
  },

  info: (...args: unknown[]) => {
    if (isDevelopment) {
       
      console.info('[INFO]', ...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (isDevelopment) {
       
      console.warn('[WARN]', ...args);
    }
  },

  error: (...args: unknown[]) => {
    if (isDevelopment || isProduction) {
       
      console.error('[ERROR]', ...args);
    }
  }
};
