/**
 * AI Model Configuration
 * All configuration is now environment-based for easy production updates
 * Uses OpenRouter API with standard OpenAI model names (no prefix required)
 */

import { ChatModel } from "openai/resources";

import { ModelTokenUsage } from "@/domains/shared-types";

export type ModelConfig = {
  name: ChatModel;
  vendor: "openai";
  inputPricePer1K: number;
  cachedInputPricePer1K: number; // ← added for cached token pricing
  outputPricePer1K: number;
  maxOutput: number;
};

// Utility for parsing environment variables safely
const num = (val: string | undefined, fallback: number): number => (val ? parseFloat(val) : fallback);

export const AI_REFLECTION_MODEL_CONFIG: ModelConfig = {
  name: (process.env.AI_REFLECTION_MODEL_NAME || "gpt-4o") as ChatModel,
  vendor: "openai",
  inputPricePer1K: num(process.env.AI_REFLECTION_MODEL_PRICE_INPUT_PER_1K, 0.0025), // $2.50/M input tokens
  cachedInputPricePer1K: num(process.env.AI_REFLECTION_MODEL_PRICE_CACHED_INPUT_PER_1K, 0.00125), // $1.25/M cached input tokens
  outputPricePer1K: num(process.env.AI_REFLECTION_MODEL_PRICE_OUTPUT_PER_1K, 0.01), // $10/M output tokens
  maxOutput: num(process.env.AI_REFLECTION_MODEL_MAX_OUTPUT, 4096),
};

//────────────────────────────────────────────
// DIAGNOSTIC MODEL — GPT-4.1 (Deep Analysis)
// Used for structured diagnostics and reasoning
//────────────────────────────────────────────
export const AI_DIAGNOSTIC_MODEL_CONFIG: ModelConfig = {
  name: (process.env.AI_DIAGNOSTIC_MODEL_NAME || "gpt-4.1") as ChatModel,
  vendor: "openai",
  inputPricePer1K: num(process.env.AI_DIAGNOSTIC_MODEL_PRICE_INPUT_PER_1K, 0.002), // $2.00/M input tokens
  cachedInputPricePer1K: num(process.env.AI_DIAGNOSTIC_MODEL_PRICE_CACHED_INPUT_PER_1K, 0.001), // $1.00/M cached input tokens
  outputPricePer1K: num(process.env.AI_DIAGNOSTIC_MODEL_PRICE_OUTPUT_PER_1K, 0.008), // $8.00/M output tokens
  maxOutput: num(process.env.AI_DIAGNOSTIC_MODEL_MAX_OUTPUT, 4096),
};

//────────────────────────────────────────────
// BACKGROUND MODEL — GPT-4.1-mini (Efficient)
// Used for async or low-priority tasks (titles, summaries, categorization)
//────────────────────────────────────────────
export const AI_BACKGROUND_MODEL_CONFIG: ModelConfig = {
  name: (process.env.AI_BACKGROUND_MODEL_NAME || "gpt-4.1-mini") as ChatModel,
  vendor: "openai",
  inputPricePer1K: num(process.env.AI_BACKGROUND_MODEL_PRICE_INPUT_PER_1K, 0.0004), // $0.40/M input tokens
  cachedInputPricePer1K: num(process.env.AI_BACKGROUND_MODEL_PRICE_CACHED_INPUT_PER_1K, 0.0002), // $0.20/M cached input tokens
  outputPricePer1K: num(process.env.AI_BACKGROUND_MODEL_PRICE_OUTPUT_PER_1K, 0.0016), // $1.60/M output tokens
  maxOutput: num(process.env.AI_BACKGROUND_MODEL_MAX_OUTPUT, 2048),
};

//────────────────────────────────────────────
// AUXILIARY MODEL — GPT-4o-mini (Ultra-Light)
// Used for quick meta-reasoning, introspection, or parallel micro-calls
//────────────────────────────────────────────
export const AI_AUXILIARY_MODEL_CONFIG: ModelConfig = {
  name: (process.env.AI_AUXILIARY_MODEL_NAME || "gpt-4o-mini") as ChatModel,
  vendor: "openai",
  inputPricePer1K: num(process.env.AI_AUXILIARY_MODEL_PRICE_INPUT_PER_1K, 0.00015), // $0.15/M input tokens
  cachedInputPricePer1K: num(process.env.AI_AUXILIARY_MODEL_PRICE_CACHED_INPUT_PER_1K, 0.000075), // $0.075/M cached input tokens
  outputPricePer1K: num(process.env.AI_AUXILIARY_MODEL_PRICE_OUTPUT_PER_1K, 0.0006), // $0.60/M output tokens
  maxOutput: num(process.env.AI_AUXILIARY_MODEL_MAX_OUTPUT, 2048),
};
export type AIModelCategory = "reflection" | "diagnostic" | "background" | "auxiliary";

export const AI_MODELS: Record<AIModelCategory, ModelConfig> = {
  reflection: AI_REFLECTION_MODEL_CONFIG,
  diagnostic: AI_DIAGNOSTIC_MODEL_CONFIG,
  background: AI_BACKGROUND_MODEL_CONFIG,
  auxiliary: AI_AUXILIARY_MODEL_CONFIG,
} as const;

export interface ModelCostBreakdown {
  model: string;
  vendor: "openai";
  inputTokens: number;
  cachedTokens: number;
  outputTokens: number;
  inputCost: number;
  cachedCost: number;
  outputCost: number;
  total: number;
}

export function calculateModelCost(
  model: AIModelCategory,
  inputTokens: number,
  outputTokens: number,
  cachedTokens: number = 0
): ModelCostBreakdown {
  // Get model config
  const cfg = AI_MODELS[model];

  // Compute token splits
  const effectiveInputTokens = Math.max(inputTokens - cachedTokens, 0);

  // Calculate each cost component using model-specific rates
  const inputCost = (effectiveInputTokens / 1_000) * cfg.inputPricePer1K;
  const cachedCost = (cachedTokens / 1_000) * cfg.cachedInputPricePer1K;
  const outputCost = (outputTokens / 1_000) * cfg.outputPricePer1K;

  // Total session cost
  const total = inputCost + cachedCost + outputCost;

  return {
    model: cfg.name,
    vendor: cfg.vendor,
    inputTokens,
    cachedTokens,
    outputTokens,
    inputCost: +inputCost.toFixed(6),
    cachedCost: +cachedCost.toFixed(6),
    outputCost: +outputCost.toFixed(6),
    total: +total.toFixed(6),
  };
}
export function calculateModelCostUsd(model: AIModelCategory, tokenUsage: ModelTokenUsage): ModelCostBreakdown {
  // Get model config
  const cfg = AI_MODELS[model];

  // Extract with defaults to handle undefined values
  const inputTokens = tokenUsage.promptTokens || 0;
  const outputTokens = tokenUsage.completionTokens || 0;
  const cachedTokens = tokenUsage.cachedTokens || 0;

  // Compute token splits
  const effectiveInputTokens = Math.max(inputTokens - cachedTokens, 0);

  // Calculate each cost component using model-specific rates
  const inputCost = (effectiveInputTokens / 1_000) * cfg.inputPricePer1K;
  const cachedCost = (cachedTokens / 1_000) * cfg.cachedInputPricePer1K;
  const outputCost = (outputTokens / 1_000) * cfg.outputPricePer1K;

  // Total session cost
  const total = inputCost + cachedCost + outputCost;

  return {
    model: cfg.name,
    vendor: cfg.vendor,
    inputTokens,
    cachedTokens,
    outputTokens,
    inputCost: +inputCost.toFixed(6),
    cachedCost: +cachedCost.toFixed(6),
    outputCost: +outputCost.toFixed(6),
    total: +total.toFixed(6),
  };
}
