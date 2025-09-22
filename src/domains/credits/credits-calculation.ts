import { CompletionUsage } from "openai/resources";

import { AiModel } from "@/types/ai-model.types";

export interface CreditSystemConfig {
  creditUsdValue: number; // baseline: 1 credit = $X USD infra
  marginMultiplier: number; // e.g. 2.0 → 100% markup
  minimumChargeCredits: number; // enforce floor, e.g. 1
}

export const DEFAULT_CREDIT_CONFIG: CreditSystemConfig = {
  creditUsdValue: 0.0025, // peg: 1 credit = $0.0025 infra
  marginMultiplier: 2.0, // doubles infra cost for margin + overhead
  minimumChargeCredits: 0,
};

export function calculateCreditsUsed(
  model: AiModel,
  tokenUsage: CompletionUsage,
  config: CreditSystemConfig = DEFAULT_CREDIT_CONFIG
): number {
  if (!model.pricing) {
    throw new Error(`Model ${model.model} has no pricing info`);
  }

  const { completion_tokens: completionTokens, prompt_tokens: promptTokens } = tokenUsage;

  const { prompt, completion } = model.pricing;

  // Step 1: raw infra USD cost
  const rawCostUsd = (promptTokens / 1000) * prompt + (completionTokens / 1000) * completion;

  // Step 2: apply margin
  const adjustedCostUsd = rawCostUsd * config.marginMultiplier;

  // Step 3: convert to credits
  const creditsUsed = adjustedCostUsd / config.creditUsdValue;

  // Step 4: rounding + floor
  return Math.max(config.minimumChargeCredits, Math.ceil(creditsUsed));
}
