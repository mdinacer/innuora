import { CompletionUsage } from "openai/resources";

import { AiModel, AiModelPricing } from "@/types/ai-model.types";

export function estimateCost(
  pricing: AiModelPricing | undefined | null,
  promptTokens: number,
  completionTokens: number
): number {
  if (!pricing) return 0;

  const promptCost = (promptTokens / 1000) * pricing.prompt;
  const completionCost = (completionTokens / 1000) * pricing.completion;

  return parseFloat((promptCost + completionCost).toFixed(6));
}

export function calculateCost(pricing: AiModelPricing, usage: CompletionUsage): number {
  const { prompt, completion } = pricing;

  const cached = usage.prompt_tokens_details?.cached_tokens ?? 0;

  // Calculate effective prompt tokens with 50% discount for cached tokens
  const nonCachedTokens = usage.prompt_tokens - cached;
  const cachedTokensAtHalfPrice = cached * 0.5;
  const effectivePromptTokens = nonCachedTokens + cachedTokensAtHalfPrice;

  // FIX: Divide by 1000 since pricing is per 1K tokens
  const promptCost = (effectivePromptTokens * prompt) / 1000;
  const completionCost = (usage.completion_tokens * completion) / 1000;

  return promptCost + completionCost;
}

export function calculateRoundCost(model: AiModel, usages: CompletionUsage[]): number {
  if (!model.pricing) throw new Error(`Pricing not defined for model: ${model.model}`);

  let totalCost = 0;

  for (const usage of usages) {
    const usageCost = calculateCost(model.pricing, usage);

    totalCost += usageCost;
  }

  return totalCost;
}
