/* eslint-disable @typescript-eslint/no-use-before-define */
/**
 * Centralized Credit System Configuration
 *
 * Adjusting tokensPerCredit upward makes each credit feel more valuable.
 * Profit margin is controlled by pack pricing, not hardcoded multipliers.
 *
 * Example: 1 credit = 1000 tokens (premium currency feel)
 */

export const CREDIT_CONFIG = {
  /**
   * Base rate: How many tokens equal 1 credit point
   *
   * - tokensPerCredit: 40    → 1 credit = 40 tokens (low-value currency feel)
   * - tokensPerCredit: 1000  → 1 credit = 1000 tokens (premium currency feel)
   */
  tokensPerCredit: 1000,

  /**
   * Display precision for credit amounts
   * Keep whole numbers to reinforce "weight" of each credit.
   */
  displayPrecision: 0,

  /**
   * Rounding strategy for billing
   * Always round up to avoid micro-credits slipping through.
   */
  roundingMode: "up" as "up" | "nearest" | "down",

  /**
   * Minimum credit charge (ensures every call has weight)
   */
  minimumCharge: 1,
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
};
/**
 * Type definitions for credit configuration
 */
export type CreditConfigType = typeof CREDIT_CONFIG;
export type RoundingMode = CreditConfigType["roundingMode"];
