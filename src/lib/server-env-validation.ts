// Server-side environment validation
// This file runs on the server and validates all environment variables

import { EnvironmentValidationError, validateEnvironmentVariables } from "./env-validation";

let isValidated = false;

/**
 * Validate environment variables once on server startup
 * This ensures the server fails fast if critical environment variables are missing
 */
export function ensureServerEnvironment(): void {
  if (isValidated) {
    return; // Already validated
  }

  try {
    validateEnvironmentVariables();
    isValidated = true;
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      console.error("❌ Server environment validation failed:");
      console.error(error.message);

      // In production, you might want to exit the process
      if (process.env.NODE_ENV === "production") {
        console.error("🚨 Application cannot start with invalid environment configuration");
        process.exit(1);
      }

      throw error;
    } else {
      console.error("❌ Unexpected error during server environment validation:", error);
      throw error;
    }
  }
}

/**
 * Middleware to ensure environment is validated before processing requests
 */
export function withEnvironmentValidation<T extends (...args: any[]) => any>(handler: T): T {
  return ((...args: any[]) => {
    ensureServerEnvironment();
    return handler(...args);
  }) as T;
}
