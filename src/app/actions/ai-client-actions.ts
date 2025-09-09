"use server";

import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources";

import { AiClientError, EmptyResponseError, NetworkError, OpenAiError, OpenRouterError } from "@/errors/ai-errors";
import { calculateCost } from "@/lib/ai/shared/cost-estimation";
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
  max_tokens: 500,
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new OpenAiError(errorMessage);
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
    throw new OpenRouterError("OPEN_ROUTER_API_KEY environment variable is not set");
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

      throw new OpenRouterError(`${response.status} - ${errorText}`);
    }

    const data = (await response.json()) as ChatCompletion;
    return data;
  } catch (error) {
    if (error instanceof AiClientError) throw error;

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new NetworkError(errorMessage);
  }
}

/**
 * Validates AI model configuration
 */
function validateAiModel(model: AiModel): void {
  if (!model) {
    throw new AiClientError("AI model configuration is required", "INVALID_MODEL");
  }

  if (!model.apiPath) {
    throw new AiClientError("AI model apiPath is required", "INVALID_MODEL_PATH");
  }

  if (!model.vendor) {
    throw new AiClientError("AI model vendor is required", "INVALID_VENDOR");
  }

  if (!["openai", "tngtech", "mistralai", "qwen", "moonshotai", "rekaai", "deepseek"].includes(model.vendor)) {
    throw new AiClientError(`Unsupported vendor: ${model.vendor}`, "UNSUPPORTED_VENDOR");
  }
}

/**
 * Validates prompts array
 */
function validatePrompts(prompts: ChatCompletionMessageParam[]): void {
  if (!Array.isArray(prompts) || prompts.length === 0) {
    throw new AiClientError("Prompts array cannot be empty", "INVALID_PROMPTS");
  }

  // Validate each prompt has required fields
  prompts.forEach((prompt, index) => {
    if (!prompt.role || !prompt.content) {
      throw new AiClientError(`Prompt at index ${index} is missing required role or content`, "INVALID_PROMPT_FORMAT");
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
      throw new EmptyResponseError();
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
    // Log error for debugging
    console.error("AI Service Error:", {
      modelPath: model.apiPath,
      vendor: model.vendor,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    // Re-throw known errors, wrap unknown ones
    if (error instanceof AiClientError) {
      throw error;
    }

    throw new AiClientError(
      `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
      "UNEXPECTED_ERROR"
    );
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

      // Don't retry on certain error types
      if (error instanceof EmptyResponseError || (error instanceof AiClientError && error.code === "INVALID_PROMPTS")) {
        throw error;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new AiClientError(
          `Failed after ${maxRetries} attempts. Last error: ${lastError.message}`,
          "RETRY_EXHAUSTED"
        );
      }

      // Wait before retrying (with exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt - 1);
      console.warn(`AI request failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached due to the logic above, but TypeScript needs it
  throw new AiClientError(
    `Failed after ${maxRetries} attempts. Last error: ${lastError?.message || "Unknown error"}`,
    "RETRY_EXHAUSTED"
  );
}
