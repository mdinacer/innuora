import { ErrorCode } from "./error-codes";

/**
 * Custom error class that uses i18n error codes
 */
export class AppError extends Error {
  constructor(
    public errorCode: ErrorCode,
    public details?: any,
    public originalError?: Error
  ) {
    super(errorCode);
    this.name = "AppError";
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}
