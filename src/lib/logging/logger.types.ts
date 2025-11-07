import { ErrorCode } from "@/lib/errors/error-codes";

export interface LogContext {
  userId?: string;
  sessionId?: string;
  operation: string;
  metadata?: Record<string, any>;
  userAgent?: string;
  ip?: string;
}

export type WrapOperationResult<T> =
  | { data: T; error: null }
  | { data: null; error: { message: string; code: string } };

export interface Logger {
  logSuccess(message: string, context: LogContext): Promise<void>;
  logWarning(message: string, context: LogContext): Promise<void>;
  logError(message: string, context: LogContext): Promise<void>;
  logInfo(message: string, context: LogContext): Promise<void>;
  logErrorAndThrow(errorCode: ErrorCode, originalError: Error | unknown, context: LogContext): never;
  wrapOperation<T>(
    operation: () => Promise<T>,
    errorCode: ErrorCode,
    context: LogContext,
    successMessage?: string
  ): Promise<WrapOperationResult<T>>;
}
