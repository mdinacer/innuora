"use server";

import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources";

import { calculateCost } from "@/lib/ai/shared/cost-estimation";
import { AppError } from "@/lib/errors";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { errorManager } from "@/lib/errors/error-manager";
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
  try {
    const completion = await openai.chat.completions.create({
      model: modelPath,
      messages: prompts,
      ...options,
    });
    return completion as ChatCompletion;
  } catch (error) {
    return errorManager.handleError(ERROR_CODES.AI_OPENAI_ERROR, error, {
      operation: "callOpenAi",
      metadata: { model: modelPath },
    });
  }
}

/**
 * Calls OpenRouter API with error handling and retry logic
 */
async function callOpenRouter(
  modelPath: string,
  prompts: ChatCompletionMessageParam[],
  options: Partial<RequestOptions>
): Promise<ChatCompletion> {
  const apiKey = process.env.OPEN_ROUTER_API_KEY;
  if (!apiKey) {
    return errorManager.handleError(
      ERROR_CODES.AI_OPENROUTER_ERROR,
      new Error("OPEN_ROUTER_API_KEY environment variable is not set"),
      {
        operation: "callOpenRouter",
        metadata: { model: modelPath },
      }
    );
  }

  try {
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

      return errorManager.handleError(ERROR_CODES.AI_OPENROUTER_ERROR, new Error(`${response.status} - ${errorText}`), {
        operation: "callOpenRouter",
        metadata: { model: modelPath, status: response.status },
      });
    }

    const data = (await response.json()) as ChatCompletion;
    return data;
  } catch (error: unknown) {
    // Re-throw AppError from errorManager.handleError calls

    if (error instanceof Error && error.name === "AppError") throw error;

    return errorManager.handleError(ERROR_CODES.AI_NETWORK_ERROR, error, {
      operation: "callOpenRouter",
      metadata: { model: modelPath },
    });
  }
}

/**
 * Validates AI model configuration
 */
function validateAiModel(model: AiModel): void {
  if (!model) {
    return errorManager.handleError(ERROR_CODES.AI_INVALID_MODEL, new Error("AI model configuration is required"), {
      operation: "validateAiModel",
    });
  }

  if (!model.apiPath) {
    return errorManager.handleError(ERROR_CODES.AI_INVALID_MODEL, new Error("AI model apiPath is required"), {
      operation: "validateAiModel",
      metadata: { model: model.vendor },
    });
  }

  if (!model.vendor) {
    return errorManager.handleError(ERROR_CODES.AI_INVALID_MODEL, new Error("AI model vendor is required"), {
      operation: "validateAiModel",
    });
  }

  if (!["openai", "tngtech", "mistralai", "qwen", "moonshotai", "rekaai", "deepseek"].includes(model.vendor)) {
    return errorManager.handleError(
      ERROR_CODES.AI_UNSUPPORTED_VENDOR,
      new Error(`Unsupported vendor: ${model.vendor}`),
      {
        operation: "validateAiModel",
        metadata: { vendor: model.vendor },
      }
    );
  }
}

/**
 * Validates prompts array
 */
function validatePrompts(prompts: ChatCompletionMessageParam[]): void {
  if (!Array.isArray(prompts) || prompts.length === 0) {
    return errorManager.handleError(ERROR_CODES.AI_INVALID_PROMPTS, new Error("Prompts array cannot be empty"), {
      operation: "validatePrompts",
    });
  }

  // Validate each prompt has required fields
  prompts.forEach((prompt, index) => {
    if (!prompt.role || !prompt.content) {
      return errorManager.handleError(
        ERROR_CODES.AI_INVALID_PROMPTS,
        new Error(`Prompt at index ${index} is missing required role or content`),
        {
          operation: "validatePrompts",
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

  const costUSD = model.pricing ? calculateCost(model.pricing, data.usage) : 0;

  return {
    type: "completion",
    model: data.model,
    mode: model.mode,
    usage: data.usage,
    timestamp: new Date().toISOString(),
    version: "", // You might want to add version tracking
    costUSD,
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
  // Validate inputs
  validatePrompts(prompts);
  validateAiModel(model);

  const mergedOptions = { ...DEFAULT_AI_OPTIONS, ...options };

  try {
    // Call appropriate AI service
    const data = await (model.vendor === "openai"
      ? callOpenAi(model.apiPath, prompts, mergedOptions)
      : callOpenRouter(model.apiPath, prompts, mergedOptions));

    // Extract and validate response
    const raw = data?.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return errorManager.handleError(ERROR_CODES.AI_EMPTY_RESPONSE, new Error("AI returned empty content"), {
        operation: "SendPromptsToAi",
        metadata: { model: model.apiPath, vendor: model.vendor },
      });
    }

    // Log in development environment
    if (process.env.NODE_ENV === "development") {
      console.info(
        `AI Service Called:
        Model: ${model.apiPath}
        Vendor: ${model.vendor}
        Prompts: %o
        TokenUsage: %o
        Response: %s`,
        prompts,
        data?.usage,
        raw
      );
    }

    return {
      message: raw,
      modelTokenUsage: createModelTokenUsage(data, model),
    };
  } catch (error) {
    // Re-throw AppError from errorManager.handleError calls
    if (error instanceof AppError && error.name === "AppError") throw error;

    // Log and handle unexpected errors
    return errorManager.handleError(ERROR_CODES.AI_REQUEST_FAILED, error, {
      operation: "SendPromptsToAi",
      metadata: { model: model.apiPath, vendor: model.vendor },
    });
  }
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
        return errorManager.handleError(
          ERROR_CODES.AI_RETRY_EXHAUSTED,
          new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError.message}`),
          {
            operation: "SendPromptsToAiWithRetry",
            metadata: { attempts: maxRetries, model: model.apiPath },
          }
        );
      }

      // Wait before retrying (with exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt - 1);
      console.warn(`AI request failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached due to the logic above, but TypeScript needs it
  return errorManager.handleError(
    ERROR_CODES.AI_RETRY_EXHAUSTED,
    new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError?.message || "Unknown error"}`),
    {
      operation: "SendPromptsToAiWithRetry",
      metadata: { attempts: maxRetries },
    }
  );
}
