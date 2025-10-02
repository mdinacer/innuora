"use server";

import { ChatCompletion, ChatCompletionMessageParam, ChatModel } from "openai/resources";

import { findCurrentUser } from "@/app/actions/auth-actions";
import { AppError } from "@/lib/errors";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import openai from "@/lib/openai";
import { rateLimiter } from "@/lib/rate-limiting/rate-limiter";
import type { ActionResult } from "@/types/action-result";
import { AiMessageResponse } from "@/types/ai-model.types";

type RequestOptions = {
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
};

const DEFAULT_AI_OPTIONS: RequestOptions = {
  stream: false,
  max_tokens: 700,
  temperature: 0.6,
  top_p: 0.9,
};

/**
 * Calculates credits from token usage based on model pricing
 * Credits = (tokens / 1000) * pricePerK * 100, rounded up with minimum 1 credit
 *
 * @param inputTokens - Number of input/prompt tokens
 * @param outputTokens - Number of output/completion tokens
 * @param inputPricePer1K - Price per 1000 input tokens in USD
 * @param outputPricePer1K - Price per 1000 output tokens in USD
 * @returns Total credits consumed (minimum 1)
 */
function calculateCreditsFromUsage(
  inputTokens: number,
  outputTokens: number,
  inputPricePer1K: number,
  outputPricePer1K: number
): number {
  const inputCredits = Math.ceil((inputTokens / 1000) * inputPricePer1K * 100);
  const outputCredits = Math.ceil((outputTokens / 1000) * outputPricePer1K * 100);
  return Math.max(1, inputCredits + outputCredits);
}

/**
 * Calls OpenAI API using the official SDK
 */
async function executeChatCompletion(
  model: ChatModel,
  prompts: ChatCompletionMessageParam[],
  options: Partial<RequestOptions>
): Promise<ActionResult<ChatCompletion>> {
  return await logger.wrapOperation(
    async () => {
      const completion = await openai.chat.completions.create({
        model: model,
        messages: prompts,
        ...options,
      });
      return completion as ChatCompletion;
    },
    ERROR_CODES.AI_OPENAI_ERROR,
    {
      operation: "ai_openai_call",
      metadata: { model: model },
    }
  );
}

/**
 * Validates prompts array
 */
function assertValidPrompts(prompts: ChatCompletionMessageParam[]): void {
  if (!Array.isArray(prompts) || prompts.length === 0) {
    logger.logErrorAndThrow(ERROR_CODES.AI_INVALID_PROMPTS, new Error("Prompts array cannot be empty"), {
      operation: "ai_validate_prompts",
    });
  }

  // Validate each prompt has required fields
  prompts.forEach((prompt, index) => {
    if (!prompt.role || !prompt.content) {
      logger.logErrorAndThrow(
        ERROR_CODES.AI_INVALID_PROMPTS,
        new Error(`Prompt at index ${index} is missing required role or content`),
        {
          operation: "ai_validate_prompts",
          metadata: { promptIndex: index },
        }
      );
    }
  });
}

/**
 * Main function to send prompts to AI services
 * Uses GPT-4.1 Mini (configured via environment variables)
 * Automatically gets current user from session for rate limiting
 */
export async function processAiPrompts(
  prompts: ChatCompletionMessageParam[],
  options: Partial<RequestOptions> = {}
): Promise<ActionResult<AiMessageResponse>> {
  return await logger.wrapOperation(
    async () => {
      // Import model configuration (simple constants from env)
      const { AI_MODEL, AI_MODEL_VENDOR, AI_MODEL_INPUT_PRICE_PER_1K, AI_MODEL_OUTPUT_PRICE_PER_1K } = await import(
        "@/domains/ai-conversation/ai-models"
      );

      // Validate inputs
      assertValidPrompts(prompts);

      // Get current user for rate limiting
      const user = await findCurrentUser();

      // Check rate limits (if user is authenticated)
      if (user) {
        const burstLimit = rateLimiter.checkLimit(user.id, "AI_BURST");
        if (!burstLimit.success) {
          throw new AppError(ERROR_CODES.RATE_LIMIT_AI_BURST, {
            remaining: burstLimit.remaining,
            resetTime: burstLimit.resetTime,
          });
        }

        const generalLimit = rateLimiter.checkLimit(user.id, "AI_REQUESTS");
        if (!generalLimit.success) {
          throw new AppError(ERROR_CODES.RATE_LIMIT_AI_REQUESTS, {
            remaining: generalLimit.remaining,
            resetTime: generalLimit.resetTime,
          });
        }
      }

      const mergedOptions = { ...DEFAULT_AI_OPTIONS, ...options };

      // Call OpenAI API (single vendor)
      const result = await executeChatCompletion(AI_MODEL, prompts, mergedOptions);

      // Handle ActionResult wrapper
      if (result.error) {
        logger.logErrorAndThrow(ERROR_CODES.AI_REQUEST_FAILED, new Error(result.error.message), {
          operation: "ai_send_prompts",
          metadata: { model: AI_MODEL, errorCode: result.error.code },
        });
      }

      // At this point result.data is guaranteed to be non-null (logErrorAndThrow throws on error)
      const data = result.data!;

      // Extract and validate response
      const rawContent = data?.choices?.[0]?.message?.content?.trim();
      if (!rawContent) {
        logger.logErrorAndThrow(ERROR_CODES.AI_EMPTY_RESPONSE, new Error("AI returned empty content"), {
          operation: "ai_send_prompts",
          metadata: { model: AI_MODEL, vendor: AI_MODEL_VENDOR },
        });
      }

      // At this point, rawContent is guaranteed to be a non-empty string (logErrorAndThrow throws)
      const message = rawContent!;

      // Log in development environment
      if (process.env.NODE_ENV === "development") {
        console.info(
          `AI Service Called:
          Model: ${AI_MODEL}
          Vendor: ${AI_MODEL_VENDOR}
          TokenUsage: %o
          Prompts: %o
          Response: %s`,
          data?.usage,
          prompts,
          message
        );
      }

      // Calculate credits based on token usage and model pricing
      const consumedCredits = data.usage
        ? calculateCreditsFromUsage(
            data.usage.prompt_tokens,
            data.usage.completion_tokens,
            AI_MODEL_INPUT_PRICE_PER_1K,
            AI_MODEL_OUTPUT_PRICE_PER_1K
          )
        : 0;

      return {
        message,
        modelTokenUsage: data.usage
          ? {
              type: "completion" as const,
              model: data.model,
              mode: "paid" as const,
              usage: data.usage,
              timestamp: new Date().toISOString(),
              version: "",
              costUSD: 0, // Legacy field
            }
          : null,
        consumedCredits,
      };
    },
    ERROR_CODES.AI_REQUEST_FAILED,
    {
      operation: "ai_send_prompts",
      metadata: { model: "gpt-4.1-mini", vendor: "openai" },
    }
  );
}

/**
 * Send prompts with retry logic for transient failures
 * Uses GPT-4.1 Mini with automatic user detection
 */
export async function processAiPromptsWithRetry(
  prompts: ChatCompletionMessageParam[],
  options: Partial<RequestOptions> = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<ActionResult<AiMessageResponse>> {
  return await logger.wrapOperation(
    async (): Promise<AiMessageResponse> => {
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const result = await processAiPrompts(prompts, options);

        if (result.error) {
          lastError = new Error(result.error.message);
          // Don't retry on certain error types
          if (
            result.error.code === ERROR_CODES.AI_EMPTY_RESPONSE ||
            result.error.code === ERROR_CODES.AI_INVALID_PROMPTS
          ) {
            logger.logErrorAndThrow(ERROR_CODES.AI_RETRY_EXHAUSTED, lastError, {
              operation: "ai_send_prompts_with_retry",
              metadata: {
                attempts: attempt,
                maxRetries,
                errorCode: result.error.code,
                reason: "non_retryable_error",
              },
            });
          }

          // If this is the last attempt, throw error
          if (attempt === maxRetries) {
            logger.logErrorAndThrow(
              ERROR_CODES.AI_RETRY_EXHAUSTED,
              new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`),
              {
                operation: "ai_send_prompts_with_retry",
                metadata: { attempts: maxRetries },
              }
            );
          }

          // Wait before retrying (with exponential backoff)
          const delay = retryDelay * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // Success - return the unwrapped data (guaranteed non-null since no error)
          return result.data!;
        }
      }

      // This should never be reached due to the logic above
      logger.logErrorAndThrow(
        ERROR_CODES.AI_RETRY_EXHAUSTED,
        new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError?.message || "Unknown error"}`),
        {
          operation: "ai_send_prompts_with_retry",
          metadata: { attempts: maxRetries, reason: "unexpected_fallthrough" },
        }
      );

      // TypeScript safety - this line is unreachable since logErrorAndThrow always throws
      throw new Error("Unreachable code");
    },
    ERROR_CODES.AI_RETRY_EXHAUSTED,
    {
      operation: "ai_send_prompts_with_retry",
      metadata: { attempts: maxRetries },
    }
  );
}
