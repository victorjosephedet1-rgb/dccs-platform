/**
 * Centralized Error Handler
 *
 * Provides consistent error handling, logging, and user-friendly messages
 * across the entire platform.
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  AUTH = 'authentication',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  VERIFICATION = 'verification',
  DCCS = 'dccs',
  NETWORK = 'network',
  STORAGE = 'storage',
  DATABASE = 'database',
  VALIDATION = 'validation',
  UNKNOWN = 'unknown'
}

export interface PlatformError {
  code: string;
  message: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  userMessage: string;
  details?: any;
  timestamp: string;
  retryable: boolean;
  solution?: string;
}

class ErrorHandler {
  private errorLog: PlatformError[] = [];
  private maxLogSize = 100;

  handleError(
    error: any,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    context?: string
  ): PlatformError {
    const platformError = this.parseError(error, category, context);

    this.logError(platformError);

    if (platformError.severity === ErrorSeverity.CRITICAL) {
      console.error('[CRITICAL ERROR]', {
        code: platformError.code,
        message: platformError.message,
        category: platformError.category,
        context,
        details: platformError.details
      });
    } else {
      console.warn('[ERROR]', {
        code: platformError.code,
        message: platformError.message,
        category: platformError.category,
        context
      });
    }

    return platformError;
  }

  private parseError(
    error: any,
    category: ErrorCategory,
    context?: string
  ): PlatformError {
    const timestamp = new Date().toISOString();
    const errorMessage = error?.message || String(error);

    if (category === ErrorCategory.AUTH) {
      return this.parseAuthError(error, errorMessage, timestamp);
    }

    if (category === ErrorCategory.UPLOAD) {
      return this.parseUploadError(error, errorMessage, timestamp);
    }

    if (category === ErrorCategory.DOWNLOAD) {
      return this.parseDownloadError(error, errorMessage, timestamp);
    }

    if (category === ErrorCategory.VERIFICATION) {
      return this.parseVerificationError(error, errorMessage, timestamp);
    }

    if (category === ErrorCategory.NETWORK) {
      return this.parseNetworkError(error, errorMessage, timestamp);
    }

    if (category === ErrorCategory.STORAGE) {
      return this.parseStorageError(error, errorMessage, timestamp);
    }

    if (category === ErrorCategory.DATABASE) {
      return this.parseDatabaseError(error, errorMessage, timestamp);
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: errorMessage,
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'An unexpected error occurred. Please try again.',
      details: error,
      timestamp,
      retryable: true
    };
  }

  private parseAuthError(error: any, message: string, timestamp: string): PlatformError {
    if (message.includes('Invalid login credentials') || message.includes('invalid_credentials')) {
      return {
        code: 'AUTH_INVALID_CREDENTIALS',
        message,
        category: ErrorCategory.AUTH,
        severity: ErrorSeverity.LOW,
        userMessage: 'Invalid email or password. Please check your credentials and try again.',
        timestamp,
        retryable: true,
        solution: 'Double-check your email and password, or use the magic link option.'
      };
    }

    if (message.includes('Email not confirmed') || message.includes('not_confirmed')) {
      return {
        code: 'AUTH_EMAIL_NOT_CONFIRMED',
        message,
        category: ErrorCategory.AUTH,
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'Please verify your email address before logging in.',
        timestamp,
        retryable: false,
        solution: 'Check your email inbox for a verification link.'
      };
    }

    if (message.includes('User not found') || message.includes('not_found')) {
      return {
        code: 'AUTH_USER_NOT_FOUND',
        message,
        category: ErrorCategory.AUTH,
        severity: ErrorSeverity.LOW,
        userMessage: 'No account found with this email address.',
        timestamp,
        retryable: false,
        solution: 'Please register for a new account.'
      };
    }

    if (message.includes('timeout') || message.includes('ETIMEDOUT')) {
      return {
        code: 'AUTH_TIMEOUT',
        message,
        category: ErrorCategory.AUTH,
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'Authentication request timed out. Please try again.',
        timestamp,
        retryable: true,
        solution: 'Check your internet connection and retry.'
      };
    }

    return {
      code: 'AUTH_UNKNOWN',
      message,
      category: ErrorCategory.AUTH,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Authentication failed. Please try again.',
      details: error,
      timestamp,
      retryable: true
    };
  }

  private parseUploadError(error: any, message: string, timestamp: string): PlatformError {
    if (message.includes('File too large') || message.includes('size')) {
      return {
        code: 'UPLOAD_FILE_TOO_LARGE',
        message,
        category: ErrorCategory.UPLOAD,
        severity: ErrorSeverity.LOW,
        userMessage: 'File size exceeds the maximum allowed limit.',
        timestamp,
        retryable: false,
        solution: 'Compress your file or select a smaller file.'
      };
    }

    if (message.includes('Invalid file type') || message.includes('format')) {
      return {
        code: 'UPLOAD_INVALID_TYPE',
        message,
        category: ErrorCategory.UPLOAD,
        severity: ErrorSeverity.LOW,
        userMessage: 'File type not supported.',
        timestamp,
        retryable: false,
        solution: 'Please upload audio (MP3, WAV, FLAC) or video files (MP4, MOV).'
      };
    }

    if (message.includes('Storage error') || message.includes('bucket')) {
      return {
        code: 'UPLOAD_STORAGE_ERROR',
        message,
        category: ErrorCategory.UPLOAD,
        severity: ErrorSeverity.HIGH,
        userMessage: 'Failed to store your file. Please try again.',
        timestamp,
        retryable: true,
        solution: 'Wait a moment and retry. If the issue persists, contact support.'
      };
    }

    if (message.includes('Network') || message.includes('connection')) {
      return {
        code: 'UPLOAD_NETWORK_ERROR',
        message,
        category: ErrorCategory.UPLOAD,
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'Upload failed due to network issues.',
        timestamp,
        retryable: true,
        solution: 'Check your internet connection and retry the upload.'
      };
    }

    return {
      code: 'UPLOAD_FAILED',
      message,
      category: ErrorCategory.UPLOAD,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Upload failed. Please try again.',
      details: error,
      timestamp,
      retryable: true
    };
  }

  private parseDownloadError(error: any, message: string, timestamp: string): PlatformError {
    if (message.includes('not authorized') || message.includes('permission')) {
      return {
        code: 'DOWNLOAD_UNAUTHORIZED',
        message,
        category: ErrorCategory.DOWNLOAD,
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'You do not have permission to download this file.',
        timestamp,
        retryable: false,
        solution: 'Only file creators can download DCCS-protected files.'
      };
    }

    if (message.includes('not found') || message.includes('404')) {
      return {
        code: 'DOWNLOAD_FILE_NOT_FOUND',
        message,
        category: ErrorCategory.DOWNLOAD,
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'File not found or has been removed.',
        timestamp,
        retryable: false
      };
    }

    if (message.includes('expired')) {
      return {
        code: 'DOWNLOAD_LINK_EXPIRED',
        message,
        category: ErrorCategory.DOWNLOAD,
        severity: ErrorSeverity.LOW,
        userMessage: 'Download link has expired.',
        timestamp,
        retryable: true,
        solution: 'Request a new download link.'
      };
    }

    return {
      code: 'DOWNLOAD_FAILED',
      message,
      category: ErrorCategory.DOWNLOAD,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Download failed. Please try again.',
      details: error,
      timestamp,
      retryable: true
    };
  }

  private parseVerificationError(error: any, message: string, timestamp: string): PlatformError {
    if (message.includes('Invalid') || message.includes('format')) {
      return {
        code: 'VERIFICATION_INVALID_CODE',
        message,
        category: ErrorCategory.VERIFICATION,
        severity: ErrorSeverity.LOW,
        userMessage: 'Invalid DCCS code format.',
        timestamp,
        retryable: false,
        solution: 'Check the code and try again. Format: DCCS-TYPE-YEAR-XXXXXX'
      };
    }

    if (message.includes('not found')) {
      return {
        code: 'VERIFICATION_CODE_NOT_FOUND',
        message,
        category: ErrorCategory.VERIFICATION,
        severity: ErrorSeverity.LOW,
        userMessage: 'DCCS code not found in registry.',
        timestamp,
        retryable: false
      };
    }

    return {
      code: 'VERIFICATION_FAILED',
      message,
      category: ErrorCategory.VERIFICATION,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Verification failed. Please try again.',
      details: error,
      timestamp,
      retryable: true
    };
  }

  private parseNetworkError(error: any, message: string, timestamp: string): PlatformError {
    return {
      code: 'NETWORK_ERROR',
      message,
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      userMessage: 'Network connection failed. Please check your internet connection.',
      timestamp,
      retryable: true,
      solution: 'Ensure you have a stable internet connection and retry.'
    };
  }

  private parseStorageError(error: any, message: string, timestamp: string): PlatformError {
    return {
      code: 'STORAGE_ERROR',
      message,
      category: ErrorCategory.STORAGE,
      severity: ErrorSeverity.HIGH,
      userMessage: 'Storage operation failed. Please try again.',
      timestamp,
      retryable: true
    };
  }

  private parseDatabaseError(error: any, message: string, timestamp: string): PlatformError {
    if (message.includes('permission denied') || message.includes('RLS')) {
      return {
        code: 'DATABASE_PERMISSION_DENIED',
        message,
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.HIGH,
        userMessage: 'Database permission error. Please log in again.',
        timestamp,
        retryable: true,
        solution: 'Log out and log back in. If the issue persists, contact support.'
      };
    }

    if (message.includes('timeout')) {
      return {
        code: 'DATABASE_TIMEOUT',
        message,
        category: ErrorCategory.DATABASE,
        severity: ErrorSeverity.MEDIUM,
        userMessage: 'Database request timed out. Please try again.',
        timestamp,
        retryable: true
      };
    }

    return {
      code: 'DATABASE_ERROR',
      message,
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.HIGH,
      userMessage: 'Database error occurred. Please try again.',
      details: error,
      timestamp,
      retryable: true
    };
  }

  private logError(error: PlatformError): void {
    this.errorLog.push(error);

    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `${error.category}: ${error.code}`,
        fatal: error.severity === ErrorSeverity.CRITICAL
      });
    }
  }

  getRecentErrors(count: number = 10): PlatformError[] {
    return this.errorLog.slice(-count);
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  getCriticalErrors(): PlatformError[] {
    return this.errorLog.filter(e => e.severity === ErrorSeverity.CRITICAL);
  }
}

export const errorHandler = new ErrorHandler();
