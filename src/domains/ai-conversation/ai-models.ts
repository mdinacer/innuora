/**
 * AI Model Configuration
 * All configuration is now environment-based for easy production updates
 * GPT-4.1 Mini - OpenAI's most cost-effective model with 1M context window
 */

import { ChatModel } from "openai/resources";

export type ModelConfig = {
  name: ChatModel;
  vendor: "openai";
  inputPricePer1K: number;
  outputPricePer1K: number;
  maxOutput: number;
};

// Utility for parsing environment variables safely
const num = (val: string | undefined, fallback: number): number => (val ? parseFloat(val) : fallback);

//────────────────────────────────────────────
// PRIMARY MODEL — GPT-4.1
//────────────────────────────────────────────
export const AI_MODEL_CONFIG: ModelConfig = {
  name: (process.env.AI_MODEL_NAME || "gpt-4.1") as ChatModel,
  vendor: "openai",
  inputPricePer1K: num(process.env.AI_MODEL_PRICE_INPUT_PER_1K, 0.002), // $2/M input tokens
  outputPricePer1K: num(process.env.AI_MODEL_PRICE_OUTPUT_PER_1K, 0.008), // $8/M output tokens
  maxOutput: num(process.env.AI_MODEL_MAX_OUTPUT, 4096),
};

//────────────────────────────────────────────
// FALLBACK MODEL — GPT-4.1-mini
//────────────────────────────────────────────
export const AI_FALLBACK_MODEL_CONFIG: ModelConfig = {
  name: (process.env.AI_FALLBACK_MODEL_NAME || "gpt-4.1-mini") as ChatModel,
  vendor: "openai",
  inputPricePer1K: num(process.env.AI_FALLBACK_MODEL_PRICE_INPUT_PER_1K, 0.0003), // $0.30/M
  outputPricePer1K: num(process.env.AI_FALLBACK_MODEL_PRICE_OUTPUT_PER_1K, 0.0006), // $0.60/M
  maxOutput: num(process.env.AI_FALLBACK_MODEL_MAX_OUTPUT, 2048),
};

export const AI_MODELS = {
  default: AI_MODEL_CONFIG,
  fallback: AI_FALLBACK_MODEL_CONFIG,
} as const;
export function calculateModelCost(model: "default" | "fallback", inputTokens: number, outputTokens: number) {
  const cfg = AI_MODELS[model];

  // Correct divisor: 1K since env vars store per-1K pricing
  const inputCost = (inputTokens / 1_000) * cfg.inputPricePer1K;
  const outputCost = (outputTokens / 1_000) * cfg.outputPricePer1K;
  const total = inputCost + outputCost;

  return {
    model: cfg.name,
    vendor: cfg.vendor,
    inputTokens,
    outputTokens,
    inputCost: +inputCost.toFixed(6),
    outputCost: +outputCost.toFixed(6),
    total: +total.toFixed(6),
  };
}
