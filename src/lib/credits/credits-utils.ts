// Credits system utilities and constants
import { encodingForModel } from "js-tiktoken";

import { CREDIT_CONFIG, CreditUtils } from "./credit-config";

// Credit conversion: 1 credit = $0.005 USD (0.5¢)
export const CREDIT_UNIT_USD = 0.005;

// Business cost configuration
export const COST_CONFIG = {
  infraBufferUSD: 0.015, // Infrastructure overhead per conversation
  markupMultiplier: 3, // 3x markup (66% margin)
} as const;

// API pricing for AI models (USD per 1K tokens)
export const AI_MODEL_PRICING_USD = {
  M1: {
    // GPT-4o-mini
    inputPer1K: 0.00015,
    outputPer1K: 0.0006,
  },
  M2: {
    // GPT-4o
    inputPer1K: 0.0025,
    outputPer1K: 0.01,
  },
  M3: {
    // Claude-3.5-Sonnet
    inputPer1K: 0.003,
    outputPer1K: 0.015,
  },
} as const;

/**
 * Convert credits to USD value
 */
export function creditsToUSD(credits: number): number {
  return credits * CREDIT_UNIT_USD;
}

/**
 * Convert USD to credits
 */
export function usdToCredits(usd: number): number {
  return Math.ceil(usd / CREDIT_UNIT_USD);
}

/**
 * Format credits amount for display using centralized configuration
 */
export function formatCredits(credits: number): string {
  return CreditUtils.formatCreditsForDisplay(credits);
}

/**
 * Format USD amount for display
 */
export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Calculate credits cost for AI conversation using centralized configuration
 */
export function calculateCreditsFromTokens(
  modelCode: keyof typeof AI_MODEL_PRICING_USD,
  inputTokens: number,
  outputTokens: number
): number {
  const totalTokens = inputTokens + outputTokens;

  // Use centralized credit configuration for token-to-credit conversion
  const rawCredits = CreditUtils.tokensToCredits(totalTokens);

  // Apply billing rules (rounding, minimum charge)
  return CreditUtils.applyBillingRules(rawCredits);
}

// Model mapping for tiktoken
const TIKTOKEN_MODEL_MAP = {
  M1: "gpt-4", // GPT-4.1 Mini uses GPT-4 encoding
  M2: "gpt-4o", // GPT-4o
  M3: "gpt-3.5-turbo", // GPT-3.5 Turbo
} as const;

/**
 * Get accurate token count using js-tiktoken
 */
function getAccurateTokenCount(content: string, modelCode: keyof typeof AI_MODEL_PRICING_USD): number | null {
  try {
    const tiktokenModel = TIKTOKEN_MODEL_MAP[modelCode];
    if (!tiktokenModel) {
      return null;
    }

    const encoding = encodingForModel(tiktokenModel);
    const tokens = encoding.encode(content);

    return tokens.length;
  } catch (error) {
    // Silently fall back to character-based estimation
    console.warn("js-tiktoken not available, falling back to character estimation:", error);
    return null;
  }
}

/**
 * Estimate credits cost from content using centralized configuration
 */
export function estimateCreditsFromContent(content: string, modelCode: keyof typeof AI_MODEL_PRICING_USD): number {
  // Try accurate token counting first
  const accurateTokenCount = getAccurateTokenCount(content, modelCode);

  let estimatedInputTokens: number;

  if (accurateTokenCount !== null) {
    // Use accurate token count
    estimatedInputTokens = accurateTokenCount;
  } else {
    // Fallback to character-based estimation: ~4 characters per token
    estimatedInputTokens = Math.ceil(content.length / 4);
  }

  // Conservative estimate for output tokens (1.5x input)
  const estimatedOutputTokens = Math.ceil(estimatedInputTokens * 1.5);

  // Use centralized credit calculation
  const totalTokens = estimatedInputTokens + estimatedOutputTokens;
  const rawCredits = CreditUtils.tokensToCredits(totalTokens);

  return CreditUtils.applyBillingRules(rawCredits);
}

/**
 * Get accurate input token count only (for real-time estimation UI)
 */
export function getInputTokenCount(content: string, modelCode: keyof typeof AI_MODEL_PRICING_USD): number {
  const accurateTokenCount = getAccurateTokenCount(content, modelCode);

  if (accurateTokenCount !== null) {
    return accurateTokenCount;
  }

  // Fallback to character-based estimation
  return Math.ceil(content.length / 4);
}

// Credit package bundles for purchase
export const CREDIT_PACKAGES = {
  starter: {
    price: 5.0,
    credits: 1000,
    bonus: 0,
    description: "Perfect for trying Mirael",
  },
  regular: {
    price: 10.0,
    credits: 2200, // 10% bonus
    bonus: 200,
    description: "Most popular choice",
  },
  premium: {
    price: 25.0,
    credits: 6000, // 20% bonus
    bonus: 1000,
    description: "Best value for power users",
  },
} as const;
