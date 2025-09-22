/**
 * Unified Logging System - Simple, Efficient, Non-Overengineered
 *
 * Combines audit logging and error management into one system.
 * Handles both success operations (audit) and failures (errors).
 */

// Import Prisma types for LogLevel enum

import { LogLevel } from "@prisma/client";

import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/error-codes";
import { prisma } from "@/lib/prisma";

// Operation context for logging
interface LogContext {
  userId?: string;
  sessionId?: string;
  operation: string;
  metadata?: Record<string, any>;
  userAgent?: string;
  ip?: string;
}

// Unified log entry
interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  timestamp: Date;
  errorCode?: ErrorCode;
  error?: Error;
}

class UnifiedLogger {
  private shouldLog: boolean;
  private shouldPersist: boolean;

  constructor() {
    this.shouldLog = process.env.NODE_ENV === "development" || process.env.ENABLE_LOGGING === "true";
    this.shouldPersist = process.env.NODE_ENV === "production" || process.env.ENABLE_DB_LOGGING === "true";
  }

  /**
   * Log successful operations (replaces logAction)
   */
  async logSuccess(message: string, context: LogContext): Promise<void> {
    await this.log({
      level: LogLevel.AUDIT,
      message,
      context,
      timestamp: new Date(),
    });
  }

  /**
   * Log errors and throw AppError (replaces errorManager.handleError)
   */
  logErrorAndThrow: (errorCode: ErrorCode, originalError: Error | unknown, context: LogContext) => never = (
    errorCode: ErrorCode,
    originalError: Error | unknown,
    context: LogContext
  ): never => {
    // Create log entry
    const logEntry: LogEntry = {
      level: LogLevel.ERROR,
      message: originalError instanceof Error ? originalError.message : String(originalError),
      context,
      timestamp: new Date(),
      errorCode,
      error: originalError instanceof Error ? originalError : undefined,
    };

    // Log it
    this.log(logEntry).catch(() => {}); // Don't await - non-blocking

    // Throw AppError for client
    throw new AppError(errorCode, context, originalError instanceof Error ? originalError : undefined);
  };

  /**
   * Log warnings (non-critical issues)
   */
  async logWarning(message: string, context: LogContext): Promise<void> {
    await this.log({
      level: LogLevel.WARN,
      message,
      context,
      timestamp: new Date(),
    });
  }

  /**
   * Log info (general operations)
   */
  async logInfo(message: string, context: LogContext): Promise<void> {
    await this.log({
      level: LogLevel.INFO,
      message,
      context,
      timestamp: new Date(),
    });
  }

  /**
   * Wrap async operations with automatic error logging
   */
  async wrapOperation<T>(
    operation: () => Promise<T>,
    errorCode: ErrorCode,
    context: LogContext,
    successMessage?: string
  ): Promise<T> {
    try {
      const result = await operation();

      // Log successful operation if message provided
      if (successMessage) {
        await this.logSuccess(successMessage, context);
      }

      return result;
    } catch (error) {
      this.logErrorAndThrow(errorCode, error, context);
    }
  }

  /**
   * Core logging method - handles all logging
   */
  private async log(entry: LogEntry): Promise<void> {
    // Always console log in development
    if (this.shouldLog) {
      this.consoleLog(entry);
    }

    // Persist to database in production (audit and errors only)
    if (this.shouldPersist && (entry.level === LogLevel.AUDIT || entry.level === LogLevel.ERROR)) {
      await this.persistLog(entry).catch((error) => {
        // Fallback: don't break operations if logging fails
        console.error("Failed to persist log:", error);
      });
    }

    // Send to external services (optional)
    this.sendToExternalServices(entry).catch(() => {}); // Non-blocking
  }

  /**
   * Console logging with formatting
   */
  private consoleLog(entry: LogEntry): void {
    const { level, message, context, errorCode, error } = entry;

    const logData = {
      level,
      message,
      operation: context.operation,
      userId: context.userId,
      sessionId: context.sessionId,
      errorCode,
      metadata: context.metadata,
      stack: error?.stack,
    };

    switch (level) {
      case LogLevel.ERROR:
        console.error("🔴 ERROR:", logData);
        break;
      case LogLevel.WARN:
        console.warn("🟡 WARNING:", logData);
        break;
      case LogLevel.AUDIT:
        console.info("📋 AUDIT:", logData);
        break;
      case LogLevel.INFO:
      default:
        console.log("📝 INFO:", logData);
    }
  }

  /**
   * Persist to database using enhanced schema
   */
  private async persistLog(entry: LogEntry): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          // Core fields
          operation: entry.context.operation,
          level: entry.level,
          message: entry.message,

          // Context fields
          userId: entry.context.userId || null,
          sessionId: entry.context.sessionId || null,
          errorCode: entry.errorCode || null,
          userAgent: entry.context.userAgent || null,
          ipAddress: entry.context.ip || null,

          // Additional metadata (cleaned of duplicates)
          metadata: entry.context.metadata ?? undefined,
        },
      });
    } catch (error) {
      // Fallback: don't break operations if audit logging fails
      console.error("Failed to create audit log:", error);
    }
  }

  /**
   * Send to external logging services (implement as needed)
   */
  private async sendToExternalServices(entry: LogEntry): Promise<void> {
    // Example integrations:
    // - Sentry for error tracking
    // - LogRocket for user sessions
    // - DataDog for metrics
    // - Custom webhook for Slack/Discord alerts

    // For now, just placeholder
    if (entry.level === LogLevel.ERROR && process.env.NODE_ENV === "production") {
      // Could send to Sentry, webhook, etc.
    }
  }
}

// Export singleton instance
export const logger = new UnifiedLogger();

// Convenience exports for backward compatibility
export const logAction = logger.logSuccess.bind(logger);
export const handleError = logger.logErrorAndThrow.bind(logger);
export const wrapOperation = logger.wrapOperation.bind(logger);
