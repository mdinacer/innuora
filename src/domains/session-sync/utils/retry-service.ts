/**
 * Retry Service
 * Handles exponential backoff retry logic for sync operations
 */

import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs?: number;
  exponentialBase?: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000, // 30 seconds max
  exponentialBase: 2,
};

/**
 * Service for handling retry logic with exponential backoff
 */
export class RetryService {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
  }

  /**
   * Retry an operation with exponential backoff
   */
  async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName?: string,
    customConfig?: Partial<RetryConfig>
  ): Promise<T> {
    const config = customConfig ? { ...this.config, ...customConfig } : this.config;
    const { maxRetries, baseDelayMs, maxDelayMs = 30000, exponentialBase = 2 } = config;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        // If this is the last attempt, give up
        if (attempt === maxRetries - 1) {
          this.logRetryExhausted(operationName, error, maxRetries);
          throw error;
        }

        // Calculate delay with exponential backoff and max cap
        const delayMs = Math.min(baseDelayMs * Math.pow(exponentialBase, attempt), maxDelayMs);

        this.logRetryAttempt(operationName, error, attempt + 1, maxRetries, delayMs);

        // Wait before retrying
        await this.delay(delayMs);
      }
    }

    // This should never be reached, but TypeScript doesn't know that
    logger.logErrorAndThrow(ERROR_CODES.SERVER_ERROR, new Error("Retry operation failed after all attempts"), {
      operation: "retry_service_exhausted",
      metadata: {
        operationName: operationName || "unknown",
        maxRetries,
        baseDelayMs,
      },
    });
    throw new Error("Unreachable"); // TypeScript satisfaction
  }

  /**
   * Retry a specific sync operation for a session
   */
  async retrySessionOperation(
    sessionId: string,
    operation: () => Promise<void>,
    operationType: "local" | "cloud"
  ): Promise<void> {
    const operationName = `${operationType}_sync_${sessionId}`;

    try {
      await this.retryWithBackoff(operation, operationName);
    } catch (error) {
      logger.logWarning(`${operationType} sync retry failed for session`, {
        operation: `retry_service_${operationType}_sync_failed`,
        sessionId,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          operationType,
        },
      });
      throw error;
    }
  }

  /**
   * Check if an error is retryable
   */
  isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      // Network errors are usually retryable
      if (error.message.includes("fetch") || error.message.includes("network")) {
        return true;
      }

      // Rate limiting errors are retryable
      if (error.message.includes("rate limit") || error.message.includes("429")) {
        return true;
      }

      // Temporary server errors are retryable
      if (error.message.includes("500") || error.message.includes("502") || error.message.includes("503")) {
        return true;
      }

      // Database connection errors are retryable
      if (error.message.includes("connection") || error.message.includes("timeout")) {
        return true;
      }
    }

    return false;
  }

  /**
   * Retry only if the error is retryable
   */
  async retryIfRetryable<T>(operation: () => Promise<T>, operationName?: string): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (this.isRetryableError(error)) {
        logger.logInfo("Error is retryable, attempting retry", {
          operation: "retry_service_retryable_error",
          metadata: {
            operationName: operationName || "unknown",
            error: error instanceof Error ? error.message : String(error),
          },
        });
        return await this.retryWithBackoff(operation, operationName);
      } else {
        logger.logInfo("Error is not retryable, failing immediately", {
          operation: "retry_service_non_retryable_error",
          metadata: {
            operationName: operationName || "unknown",
            error: error instanceof Error ? error.message : String(error),
          },
        });
        throw error;
      }
    }
  }

  /**
   * Update retry configuration
   */
  updateConfig(updates: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Get current configuration
   */
  getConfig(): RetryConfig {
    return { ...this.config };
  }

  /**
   * Private helper methods
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private logRetryAttempt(
    operationName: string | undefined,
    error: unknown,
    attempt: number,
    maxRetries: number,
    delayMs: number
  ): void {
    logger.logWarning("Retry attempt failed, retrying with backoff", {
      operation: "retry_service_attempt_failed",
      metadata: {
        operationName: operationName || "unknown",
        attempt,
        maxRetries,
        delayMs,
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }

  private logRetryExhausted(operationName: string | undefined, error: unknown, maxRetries: number): void {
    logger.logWarning("All retry attempts exhausted", {
      operation: "retry_service_exhausted",
      metadata: {
        operationName: operationName || "unknown",
        maxRetries,
        finalError: error instanceof Error ? error.message : String(error),
      },
    });
  }
}
