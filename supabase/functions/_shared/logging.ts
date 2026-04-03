/**
 * Logging Utilities
 * Structured logging for Edge Functions
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogContext {
  functionName?: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Structured logger
 */
export class Logger {
  private context: LogContext;

  constructor(context: LogContext = {}) {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...(data && { data }),
    };

    console.log(JSON.stringify(logEntry));
  }

  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: unknown): void {
    const errorData = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;

    this.log(LogLevel.ERROR, message, errorData);
  }

  withContext(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }
}

/**
 * Create logger for edge function
 * @param functionName - Name of the edge function
 * @returns Logger instance
 */
export function createLogger(functionName: string): Logger {
  return new Logger({ functionName });
}

/**
 * Generate unique request ID
 * @returns Unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
