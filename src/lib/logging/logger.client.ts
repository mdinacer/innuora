"use client";

import { AppError } from "@/lib/errors/app-error";
import { ErrorCode } from "@/lib/errors/error-codes";
import { LogContext, Logger, WrapOperationResult } from "./logger.types";

function consoleLog(level: "info" | "warn" | "error" | "audit", message: string, context: LogContext, error?: Error) {
  const payload = {
    level,
    message,
    operation: context.operation,
    metadata: context.metadata,
    userId: context.userId,
    sessionId: context.sessionId,
    stack: error?.stack,
  };

  switch (level) {
    case "error":
      console.error("🔴 ERROR:", payload);
      break;
    case "warn":
      console.warn("🟡 WARN:", payload);
      break;
    case "audit":
      console.info("📋 AUDIT:", payload);
      break;
    default:
      console.log("📝 INFO:", payload);
  }
}

class ClientLogger implements Logger {
  async logSuccess(message: string, context: LogContext): Promise<void> {
    consoleLog("audit", message, context);
  }

  async logWarning(message: string, context: LogContext): Promise<void> {
    consoleLog("warn", message, context);
  }

  async logError(message: string, context: LogContext): Promise<void> {
    consoleLog("error", message, context);
  }

  async logInfo(message: string, context: LogContext): Promise<void> {
    consoleLog("info", message, context);
  }

  logErrorAndThrow(errorCode: ErrorCode, originalError: Error | unknown, context: LogContext): never {
    const error = originalError instanceof Error ? originalError : new Error(String(originalError));
    this.logError(error.message, context);
    throw new AppError(errorCode, context, error);
  }

  async wrapOperation<T>(
    operation: () => Promise<T>,
    errorCode: ErrorCode,
    context: LogContext,
    successMessage?: string
  ): Promise<WrapOperationResult<T>> {
    try {
      const result = await operation();
      if (successMessage) {
        await this.logSuccess(successMessage, context);
      }
      return { data: result, error: null };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      await this.logError(err.message, {
        ...context,
        metadata: { ...(context.metadata || {}), errorMessage: err.message },
      });
      return {
        data: null,
        error: {
          message: err.message,
          code: errorCode,
        },
      };
    }
  }
}

export const logger = new ClientLogger();
export const logAction = logger.logSuccess.bind(logger);
export const handleError = logger.logErrorAndThrow.bind(logger);
export const wrapOperation = logger.wrapOperation.bind(logger);
