"use server";

import {
  ChatCompletion,
  ChatCompletionMessageParam,
  ChatModel,
  ResponseFormatJSONObject,
  ResponseFormatJSONSchema,
  ResponseFormatText,
} from "openai/resources";

import { findCurrentUser } from "@/app/actions/auth-actions";
import { AIModelCategory } from "@/domains/ai-conversation/ai-models";
import { SECURITY_PROTOCOL_BY_MODEL } from "@/domains/ai-conversation/prompts/prompt.security-protocol";
import { AppError } from "@/lib/errors";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import openai from "@/lib/openai";
import { rateLimiter } from "@/lib/rate-limiting/rate-limiter";
import type { ActionResult } from "@/types/action-result";
import { AiMessageResponse } from "@/types/ai-model.types";

export type RequestOptions = {
  stream?: boolean;
  max_completion_tokens?: number;
  temperature?: number;
  top_p?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  response_format?: ResponseFormatText | ResponseFormatJSONSchema | ResponseFormatJSONObject;
  stop?: string | string[] | null;

  seed?: number | null;
  model?: AIModelCategory; // Model selection: default=gpt-4o, fallback=gpt-4.1, mini=gpt-4.1-mini
};

const DEFAULT_AI_OPTIONS: Omit<RequestOptions, "model"> = {
  temperature: 0.6,
  top_p: 0.9,
  presence_penalty: 0.1,
  frequency_penalty: 0.2,
  max_completion_tokens: 800,
};

// Credit calculation is now centralized in credit-config.ts
// No local calculation needed - import CreditUtils instead

/**
 * Calls OpenAI API using the official SDK
 */
async function executeChatCompletion(
  model: ChatModel,
  prompts: ChatCompletionMessageParam[],
  options: Partial<RequestOptions>
): Promise<ActionResult<ChatCompletion>> {
  const securityProtocol = SECURITY_PROTOCOL_BY_MODEL[model];
  console.log("Use model: ", model);
  return await logger.wrapOperation(
    async () => {
      const completion = await openai.chat.completions.create({
        model,
        messages: prompts, //[securityProtocol, ...prompts],
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
          metadata: { promptIndex: index, prompt },
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
      const start = performance.now();

      // Import model configuration (simple constants from env)
      const { AI_MODELS } = await import("@/domains/ai-conversation/ai-models");

      // Import centralized credit calculation
      const { CreditUtils } = await import("@/lib/credits/credit-config");

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

      const { model, ...restOptions } = options;
      // Select model based on options (default=gpt-4o, fallback=gpt-4.1, mini=gpt-4.1-mini)
      const modelType = model || "reflection"; // Default to best quality for conversations
      const modelConfig = AI_MODELS[modelType];
      const modelName = modelConfig.name as ChatModel;

      console.log(modelName);

      // Remove 'model' from options to avoid passing "default" or "mini" string to OpenAI

      const mergedOptions = { ...DEFAULT_AI_OPTIONS, ...restOptions };

      // Call OpenAI API with actual model name
      const result = await executeChatCompletion(modelName, prompts, mergedOptions);

      // Handle ActionResult wrapper
      if (result.error) {
        logger.logErrorAndThrow(ERROR_CODES.AI_REQUEST_FAILED, new Error(result.error.message), {
          operation: "ai_send_prompts",
          metadata: { model: modelConfig.name, errorCode: result.error.code },
        });
      }

      // At this point result.data is guaranteed to be non-null (logErrorAndThrow throws on error)
      const data = result.data!;

      console.log("DATA:", data);

      // Extract and validate response
      const rawContent = data?.choices?.[0]?.message?.content?.trim();
      if (!rawContent) {
        logger.logErrorAndThrow(ERROR_CODES.AI_EMPTY_RESPONSE, new Error("AI returned empty content"), {
          operation: "ai_send_prompts",
          metadata: { model: modelConfig.name, vendor: modelConfig.vendor },
        });
      }

      // At this point, rawContent is guaranteed to be a non-empty string (logErrorAndThrow throws)
      const message = rawContent!;

      // Log AI response details for monitoring
      await logger.logInfo("AI completion successful", {
        operation: "ai_send_prompts",
        metadata: {
          promptTokens: data.usage?.prompt_tokens || 0,
          cached_tokens: data.usage?.prompt_tokens_details?.cached_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
          responseLength: message.length,
        },
      });

      // Calculate credits using simple token-based system
      // Profit margin is controlled by pack pricing, not by code multipliers
      const totalTokens = data.usage?.total_tokens || 0;
      const consumedCredits = data.usage ? CreditUtils.calculateBillableCredits(totalTokens) : 0;
      const timeElapsed = performance.now() - start;

      return {
        message,
        modelTokenUsage: data.usage
          ? {
              completionTokens: data.usage.completion_tokens,
              promptTokens: data.usage.prompt_tokens,
              cachedTokens: data.usage?.prompt_tokens_details?.cached_tokens || 0,
              totalTokens: data.usage.total_tokens,
              timestamp: new Date().toISOString(),
              responseLength: message.length,
            }
          : null,
        consumedCredits,
        elapsedMs: timeElapsed,
      };
    },
    ERROR_CODES.AI_REQUEST_FAILED,
    {
      operation: "ai_send_prompts",
      metadata: {
        model: options.model || "reflection",
        vendor: "openai",
      },
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
