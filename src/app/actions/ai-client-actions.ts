"use server";

import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources";

import { calculateCreditsUsed } from "@/domains/credits/credits-calculation";
import { AppError } from "@/lib/errors";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import openai from "@/lib/openai";
import { AiMessageResponse, AiModel, ModelTokenUsage } from "@/types/ai-model.types";

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
 * Calls OpenAI API with error handling
 */
async function callOpenAi(
  modelPath: string,
  prompts: ChatCompletionMessageParam[],
  options: Partial<RequestOptions>
): Promise<ChatCompletion> {
  return await logger.wrapOperation(
    async () => {
      const completion = await openai.chat.completions.create({
        model: modelPath,
        messages: prompts,
        ...options,
      });
      return completion as ChatCompletion;
    },
    ERROR_CODES.AI_OPENAI_ERROR,
    {
      operation: "ai_openai_call",
      metadata: { model: modelPath },
    }
  );
}

/**
 * Calls OpenRouter API with error handling and retry logic
 */
async function callOpenRouter(
  modelPath: string,
  prompts: ChatCompletionMessageParam[],
  options: Partial<RequestOptions>
): Promise<ChatCompletion> {
  return await logger.wrapOperation(
    async () => {
      const apiKey = process.env.OPEN_ROUTER_API_KEY;
      if (!apiKey) {
        throw new Error("OPEN_ROUTER_API_KEY environment variable is not set");
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: modelPath,
          messages: prompts,
          ...options,
        }),
      });

      if (!response.ok) {
        let errorText: string;
        try {
          errorText = await response.text();
        } catch {
          errorText = "Unable to read error response";
        }
        throw new Error(`${response.status} - ${errorText}`);
      }

      const data = (await response.json()) as ChatCompletion;
      return data;
    },
    ERROR_CODES.AI_OPENROUTER_ERROR,
    {
      operation: "ai_openrouter_call",
      metadata: { model: modelPath },
    }
  );
}

/**
 * Validates AI model configuration
 */
function validateAiModel(model: AiModel): void {
  if (!model) {
    logger.logErrorAndThrow(ERROR_CODES.AI_INVALID_MODEL, new Error("AI model configuration is required"), {
      operation: "ai_validate_model",
    });
  }

  if (!model.apiPath) {
    logger.logErrorAndThrow(ERROR_CODES.AI_INVALID_MODEL, new Error("AI model apiPath is required"), {
      operation: "ai_validate_model",
      metadata: { model: model.vendor },
    });
  }

  if (!model.vendor) {
    logger.logErrorAndThrow(ERROR_CODES.AI_INVALID_MODEL, new Error("AI model vendor is required"), {
      operation: "ai_validate_model",
    });
  }

  if (!["openai", "tngtech", "mistralai", "qwen", "moonshotai", "rekaai", "deepseek"].includes(model.vendor)) {
    logger.logErrorAndThrow(ERROR_CODES.AI_UNSUPPORTED_VENDOR, new Error(`Unsupported vendor: ${model.vendor}`), {
      operation: "ai_validate_model",
      metadata: { vendor: model.vendor },
    });
  }
}

/**
 * Validates prompts array
 */
function validatePrompts(prompts: ChatCompletionMessageParam[]): void {
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
 * Creates model token usage object
 */
function createModelTokenUsage(data: ChatCompletion, model: AiModel): ModelTokenUsage | null {
  if (!data.usage) return null;

  return {
    type: "completion",
    model: data.model,
    mode: model.mode,
    usage: data.usage,
    timestamp: new Date().toISOString(),
    version: "", // You might want to add version tracking
    costUSD: 0, // Legacy field - will be removed once credit system is fully integrated
  };
}

/**
 * Main function to send prompts to AI services
 */
export async function SendPromptsToAi(
  prompts: ChatCompletionMessageParam[],
  model: AiModel,
  options: Partial<RequestOptions> = {}
): Promise<AiMessageResponse> {
  return await logger.wrapOperation(
    async () => {
      // Validate inputs
      validatePrompts(prompts);
      validateAiModel(model);

      const mergedOptions = { ...DEFAULT_AI_OPTIONS, ...options };

      // Call appropriate AI service
      const data = await (model.vendor === "openai"
        ? callOpenAi(model.apiPath, prompts, mergedOptions)
        : callOpenRouter(model.apiPath, prompts, mergedOptions));

      // Extract and validate response
      const raw = data?.choices?.[0]?.message?.content?.trim();
      if (!raw) {
        throw new Error("AI returned empty content");
      }

      // Log in development environment
      if (process.env.NODE_ENV === "development") {
        console.info(
          `AI Service Called:
          Model: ${model.apiPath}
          Vendor: ${model.vendor}
          TokenUsage: %o
          Response: %s`,
          data?.usage,
          raw
        );
      }

      let consumedCredits = 0;

      if (data.usage) {
        consumedCredits = calculateCreditsUsed(model, data.usage);
      }

      return {
        message: raw,
        modelTokenUsage: createModelTokenUsage(data, model),
        consumedCredits,
      };
    },
    ERROR_CODES.AI_REQUEST_FAILED,
    {
      operation: "ai_send_prompts",
      metadata: { model: model.apiPath, vendor: model.vendor },
    }
  );
}

/**
 * Send prompts with retry logic for transient failures
 */
export async function SendPromptsToAiWithRetry(
  prompts: ChatCompletionMessageParam[],
  model: AiModel,
  options: Partial<RequestOptions> = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<AiMessageResponse> {
  return await logger.wrapOperation(
    async () => {
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await SendPromptsToAi(prompts, model, options);
        } catch (error) {
          lastError = error as Error;

          // Don't retry on certain error types - check AppError errorCode if available
          if (
            error instanceof AppError &&
            error.name === "AppError" &&
            ((error && error.errorCode === ERROR_CODES.AI_EMPTY_RESPONSE) ||
              error.errorCode === ERROR_CODES.AI_INVALID_PROMPTS)
          ) {
            throw error;
          }

          // If this is the last attempt, throw the error
          if (attempt === maxRetries) {
            throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
          }

          // Wait before retrying (with exponential backoff)
          const delay = retryDelay * Math.pow(2, attempt - 1);
          console.warn(`AI request failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      // This should never be reached due to the logic above
      throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError?.message || "Unknown error"}`);
    },
    ERROR_CODES.AI_RETRY_EXHAUSTED,
    {
      operation: "ai_send_prompts_with_retry",
      metadata: { attempts: maxRetries, model: model.apiPath },
    }
  );
}
