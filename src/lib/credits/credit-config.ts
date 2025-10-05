/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 * Centralized Credit System Configuration
 *
 * Change only the values here to adjust the entire credit economy.
 * All credit calculations, UI displays, and billing will automatically adjust.
 */

export const CREDIT_CONFIG = {
  /**
   * Base rate: How many tokens equal 1 credit point
   *
   * Examples:
   * - tokensPerCredit: 40    → 1 credit = 40 tokens (current system)
   * - tokensPerCredit: 1000  → 1 credit = 1000 tokens (~25x more valuable)
   * - tokensPerCredit: 2000  → 1 credit = 2000 tokens (~50x more valuable)
   */
  tokensPerCredit: 1000,

  /**
   * Display precision for credit amounts
   *
   * Examples:
   * - 0: Show whole numbers only (1, 2, 3 credits)
   * - 1: Show 1 decimal place (1.0, 1.5, 2.0 credits)
   * - 2: Show 2 decimal places (1.00, 1.25, 1.50 credits)
   */
  displayPrecision: 0,

  /**
   * How to handle fractional credits when charging users
   *
   * - 'up': Always round up (0.1 credits → charge 1 credit)
   * - 'nearest': Round to nearest (0.4 → 0, 0.6 → 1)
   * - 'down': Always round down (0.9 credits → charge 0 credits)
   */
  roundingMode: "up" as "up" | "nearest" | "down",

  /**
   * Minimum credit charge (prevents micro-transactions)
   * Set to 0 to allow any amount, or 1 to always charge at least 1 credit
   */
  minimumCharge: 1,

  /**
   * Business cost configuration
   * Allows adding profit margin and infrastructure overhead to API costs
   */
  pricing: {
    /**
     * Markup multiplier applied to raw API costs
     * Examples:
     * - 1.0: No markup (charge exactly API cost)
     * - 2.0: 2x markup (50% profit margin)
     * - 3.0: 3x markup (66% profit margin)
     */
    markupMultiplier: 3.0,

    /**
     * Fixed infrastructure overhead per AI request (in USD)
     * Covers: hosting, database, CDN, monitoring, etc.
     */
    infraOverheadUSD: 0.015,

    /**
     * Credit unit value in USD
     * 1 credit = $0.005 (half a cent)
     */
    creditUnitUSD: 0.005,
  },

  /**
   * Diagnostic feature cost estimates
   * Actual costs calculated dynamically from token usage
   */
  diagnostics: {
    /**
     * Basic diagnostic (free tier)
     * - Shows: whats_happening section only
     * - Estimated tokens: ~500-800
     * - Estimated cost: ~1 credit (calculated from actual usage)
     */
    basic: {
      estimatedTokens: 650,
      sections: 1,
      displayName: "Basic Pattern Insights",
    },

    /**
     * Standard diagnostic (regular tier)
     * - Shows: 7 sections (actionable insights for self-work)
     * - Estimated tokens: ~2848
     * - Estimated cost: ~3 credits (calculated from actual usage)
     * - Perceived value: Structured insights ChatGPT cannot provide
     */
    standard: {
      estimatedTokens: 2848,
      sections: 7,
      displayName: "Full Actionable Diagnostic",
      perceivedValue: "Personalized CBT workbook insights",
    },

    /**
     * Advanced diagnostic (premium tier)
     * - Shows: 9 sections (clinical-grade for therapist collaboration)
     * - Estimated tokens: ~3311
     * - Estimated cost: ~3 credits (calculated from actual usage)
     * - Perceived value: $500-1500 professional psychological assessment
     */
    advanced: {
      estimatedTokens: 3311,
      sections: 9,
      displayName: "Clinical-Grade Diagnostic",
      perceivedValue: "$500-1500 professional psychological assessment",
      professionalEquivalent: "Comprehensive psychological evaluation",
    },
  },
} as const;

/**
 * Credit UX helper functions for user-friendly messaging
 */
export const CreditUXUtils = {
  creditsToEstimatedDays: (credits: number): number => {
    const creditsPerConversation = 2; // ~2 credits per round
    const conversationsPerDay = 1.5;
    return Math.floor(credits / (creditsPerConversation * conversationsPerDay));
  },

  creditsToEstimatedWeeks: (credits: number): number => {
    const days = CreditUXUtils.creditsToEstimatedDays(credits);
    return Math.floor(days / 7);
  },

  getApproximationDisplayText: (credits: number): string => {
    const weeks = CreditUXUtils.creditsToEstimatedWeeks(credits);
    const days = CreditUXUtils.creditsToEstimatedDays(credits);

    if (weeks >= 4) {
      return `Approx. ${weeks} weeks of steady reflection`;
    } else if (days >= 7) {
      return `Approx. ${Math.floor(days / 7)} weeks of support`;
    } else if (days >= 3) {
      return `Approx. ${days} days of conversations`;
    } else if (days >= 1) {
      return `Approx. ${days} day${days > 1 ? "s" : ""} remaining`;
    } else {
      return `Time to renew for uninterrupted support`;
    }
  },
  getBalanceDisplayText: (credits: number): string => {
    const weeks = CreditUXUtils.creditsToEstimatedWeeks(credits);
    const days = CreditUXUtils.creditsToEstimatedDays(credits);

    if (weeks >= 4) {
      return `${CreditUtils.formatCreditsForDisplay(credits)} credits available • Approx. ${weeks} weeks of steady reflection`;
    } else if (days >= 7) {
      return `${CreditUtils.formatCreditsForDisplay(credits)} credits available • Approx. ${Math.floor(days / 7)} weeks of support`;
    } else if (days >= 3) {
      return `${CreditUtils.formatCreditsForDisplay(credits)} credits available • Approx. ${days} days of conversations`;
    } else if (days >= 1) {
      return `${CreditUtils.formatCreditsForDisplay(credits)} credits available • Approx. ${days} day${days > 1 ? "s" : ""} remaining`;
    } else {
      return `${CreditUtils.formatCreditsForDisplay(credits)} credits available • Time to renew for uninterrupted support`;
    }
  },

  getConsumptionFeedback: (creditsUsed: number, remainingBalance: number): string => {
    const usdCost = (creditsUsed * 0.05).toFixed(2); // assuming 1 credit ≈ $0.05 perceived value
    return `Today's reflection: ${CreditUtils.formatCreditsForDisplay(creditsUsed)} credits (≈ $${usdCost}) - balance: ${CreditUtils.formatCreditsForDisplay(remainingBalance)} credits`;
  },

  getLowBalanceWarning: (credits: number): string => {
    const days = CreditUXUtils.creditsToEstimatedDays(credits);

    if (days <= 1) {
      return "Your balance is getting low.\nYou have less than a day of conversations left. Top up now to stay uninterrupted.";
    } else if (days <= 3) {
      return `Your balance is getting low.\nYou have about ${days} days of daily conversations left. Top up now to stay uninterrupted.`;
    } else {
      return `Your balance is getting low.\nYou have about ${days} days of support remaining. Consider topping up soon.`;
    }
  },

  isBalanceLow: (credits: number): boolean => {
    return CreditUXUtils.creditsToEstimatedDays(credits) <= 5;
  },

  isBalanceCritical: (credits: number): boolean => {
    return CreditUXUtils.creditsToEstimatedDays(credits) <= 2;
  },
};

export const CreditUtils = {
  tokensToCredits: (tokens: number): number => {
    return tokens / CREDIT_CONFIG.tokensPerCredit;
  },

  creditsToTokens: (credits: number): number => {
    return credits * CREDIT_CONFIG.tokensPerCredit;
  },

  applyBillingRules: (credits: number): number => {
    let result = credits;

    switch (CREDIT_CONFIG.roundingMode) {
      case "up":
        result = Math.ceil(credits);
        break;
      case "nearest":
        result = Math.round(credits);
        break;
      case "down":
        result = Math.floor(credits);
        break;
    }

    return Math.max(result, CREDIT_CONFIG.minimumCharge);
  },

  formatCreditsForDisplay: (credits: number): string => {
    return credits.toFixed(CREDIT_CONFIG.displayPrecision);
  },

  calculateBillableCredits: (tokens: number): number => {
    const rawCredits = CreditUtils.tokensToCredits(tokens);
    return CreditUtils.applyBillingRules(rawCredits);
  },

  /**
   * Calculate credits from AI API usage with markup and infrastructure overhead
   * This is the main function that should be used for all AI credit calculations
   *
   * Formula:
   * 1. Calculate raw API cost: (inputTokens * inputPrice + outputTokens * outputPrice) / 1000
   * 2. Apply markup: rawCost * markupMultiplier
   * 3. Add infrastructure overhead: markedUpCost + infraOverheadUSD
   * 4. Convert to credits: totalCost / creditUnitUSD
   * 5. Apply billing rules: rounding + minimum charge
   *
   * @param inputTokens - Number of input/prompt tokens
   * @param outputTokens - Number of output/completion tokens
   * @param inputPricePer1K - Price per 1000 input tokens in USD
   * @param outputPricePer1K - Price per 1000 output tokens in USD
   * @returns Total credits to charge user
   */
  calculateCreditsFromAIUsage: (
    inputTokens: number,
    outputTokens: number,
    inputPricePer1K: number,
    outputPricePer1K: number
  ): number => {
    // Step 1: Calculate raw API cost
    const inputCost = (inputTokens / 1000) * inputPricePer1K;
    const outputCost = (outputTokens / 1000) * outputPricePer1K;
    const rawAPICost = inputCost + outputCost;

    // Step 2: Apply markup multiplier
    const markedUpCost = rawAPICost * CREDIT_CONFIG.pricing.markupMultiplier;

    // Step 3: Add infrastructure overhead
    const totalCost = markedUpCost + CREDIT_CONFIG.pricing.infraOverheadUSD;

    // Step 4: Convert to credits
    const rawCredits = totalCost / CREDIT_CONFIG.pricing.creditUnitUSD;

    // Step 5: Apply billing rules (rounding + minimum charge)
    return CreditUtils.applyBillingRules(rawCredits);
  },
};
/**
 * Type definitions for credit configuration
 */
export type CreditConfigType = typeof CREDIT_CONFIG;
export type RoundingMode = CreditConfigType["roundingMode"];
