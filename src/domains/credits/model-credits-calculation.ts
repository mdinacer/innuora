import { AIModelCategory, calculateModelCostUsd, ModelCostBreakdown } from "@/domains/ai-conversation/ai-models";
import { ModelTokenUsage } from "@/types/ai-model.types";

// ────────────────────────────────────────────
// Credit Calculation Configuration
// ────────────────────────────────────────────

export interface CreditCalculationConfig {
  creditUsdValue: number; // How much USD 1 credit represents in infra cost
  marginMultiplier: number; // Markup multiplier (e.g., 2.0 = 100% margin)
  minimumCredits: number; // Floor for any operation
}

export const DEFAULT_CREDIT_CONFIG: CreditCalculationConfig = {
  creditUsdValue: 0.0025, // 1 credit = $0.0025 infra cost
  marginMultiplier: 2.0, // 100% margin for overhead + profit
  minimumCredits: 0.01, // Minimum 0.01 credits (1 cent equivalent)
};

// ────────────────────────────────────────────
// Credit Calculation Result
// ────────────────────────────────────────────

export interface CreditCalculationResult {
  credits: number;
  rawCostUsd: number;
  adjustedCostUsd: number;
  breakdown: ModelCostBreakdown;
}

// ────────────────────────────────────────────
// Main Calculation Function
// ────────────────────────────────────────────

/**
 * Calculate credits to charge based on actual model usage and pricing.
 *
 * This replaces the naive "totalTokens / 40" formula with accurate pricing that:
 * - Uses model-specific rates (GPT-4o costs more than GPT-4o-mini)
 * - Differentiates input vs output tokens (output is ~4x more expensive)
 * - Accounts for cached token discounts (50% cheaper)
 *
 * Formula:
 * 1. Calculate real USD cost from token usage and model-specific rates
 * 2. Apply margin multiplier (covers overhead, profit, rate fluctuations)
 * 3. Convert to credits using creditUsdValue
 * 4. Round up and apply minimum
 *
 * @example
 * // GPT-4o reflection with 1000 input, 500 output tokens
 * const result = calculateCreditsFromUsage("reflection", {
 *   promptTokens: 1000,
 *   completionTokens: 500,
 *   cachedTokens: 0,
 *   totalTokens: 1500,
 *   timestamp: new Date().toISOString(),
 *   responseLength: 0,
 * });
 * // result.credits = 6 (based on actual pricing)
 * // vs old formula: 1500/40 = 38 credits (way off!)
 */
export function calculateCreditsFromUsage(
  model: AIModelCategory,
  tokenUsage: ModelTokenUsage,
  config: CreditCalculationConfig = DEFAULT_CREDIT_CONFIG
): CreditCalculationResult {
  // Step 1: Get actual USD cost breakdown
  const breakdown = calculateModelCostUsd(model, tokenUsage);

  // Step 2: Apply margin multiplier
  const adjustedCostUsd = breakdown.total * config.marginMultiplier;

  // Step 3: Convert to credits
  const rawCredits = adjustedCostUsd / config.creditUsdValue;

  // Step 4: Round to 2 decimal places and apply minimum
  // Using Math.round with 100 multiplier to avoid floating point issues
  const roundedCredits = Math.round(rawCredits * 100) / 100;
  const credits = Math.max(config.minimumCredits, roundedCredits);

  // Debug logging - remove after fixing
  console.log("[Credit Calc]", {
    model,
    total: breakdown.total,
    adjustedCostUsd,
    creditUsdValue: config.creditUsdValue,
    rawCredits,
    roundedCredits,
    minimumCredits: config.minimumCredits,
    finalCredits: credits,
  });

  return {
    credits,
    rawCostUsd: breakdown.total,
    adjustedCostUsd,
    breakdown,
  };
}

/**
 * Simplified version that just returns the credit count.
 * Use this when you don't need the full breakdown.
 */
export function calculateCredits(
  model: AIModelCategory,
  tokenUsage: ModelTokenUsage,
  config: CreditCalculationConfig = DEFAULT_CREDIT_CONFIG
): number {
  return calculateCreditsFromUsage(model, tokenUsage, config).credits;
}
