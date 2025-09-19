import { AppError, ErrorCode } from "./index";

interface ErrorContext {
  userId?: string;
  sessionId?: string;
  operation?: string;
  metadata?: Record<string, any>;
}

interface ErrorLogEntry {
  timestamp: Date;
  errorCode: ErrorCode;
  originalError: Error | unknown;
  context: ErrorContext;
  userAgent?: string;
  ip?: string;
}

class ErrorManager {
  private logErrors: boolean;

  constructor() {
    // Only log in development or when explicitly enabled
    this.logErrors = process.env.NODE_ENV === "development" || process.env.ENABLE_ERROR_LOGGING === "true";
  }

  /**
   * Handles an error: logs for debugging and throws AppError for client
   */
  handleError(errorCode: ErrorCode, originalError: Error | unknown, context: ErrorContext = {}): never {
    // Log for debugging (server-side only)
    this.logError(errorCode, originalError, context);

    // Throw AppError for client
    throw new AppError(errorCode, context, originalError instanceof Error ? originalError : undefined);
  }

  /**
   * Log error for debugging/monitoring
   */
  private logError(errorCode: ErrorCode, originalError: Error | unknown, context: ErrorContext): void {
    if (!this.logErrors) return;

    const logEntry: ErrorLogEntry = {
      timestamp: new Date(),
      errorCode,
      originalError,
      context,
    };

    // For now, just console.error with structured data
    // Later this can be replaced with proper logging service
    console.error("ERROR:", {
      code: errorCode,
      message: originalError instanceof Error ? originalError.message : String(originalError),
      context,
      stack: originalError instanceof Error ? originalError.stack : undefined,
    });

    // TODO: In production, send to logging service
    // - Sentry for error tracking
    // - CloudWatch/DataDog for metrics
    // - Database for audit trail
    this.sendToLoggingService(logEntry);
  }

  /**
   * Send to external logging service (implement as needed)
   */
  private sendToLoggingService(entry: ErrorLogEntry): void {
    // Example implementations:
    // Sentry
    // Sentry.captureException(entry.originalError, {
    //   tags: { errorCode: entry.errorCode },
    //   extra: entry.context
    // });
    // Custom API
    // fetch('/api/errors', {
    //   method: 'POST',
    //   body: JSON.stringify(entry)
    // }).catch(() => {}); // Don't fail on logging failure
    // For now, do nothing in production
  }

  /**
   * Utility to wrap async operations with error handling
   */
  async wrapOperation<T>(operation: () => Promise<T>, errorCode: ErrorCode, context: ErrorContext = {}): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(errorCode, error, context);
    }
  }
}

// Export singleton instance
export const errorManager = new ErrorManager();
