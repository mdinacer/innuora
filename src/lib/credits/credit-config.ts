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
  tokensPerCredit: 40,

  /**
   * Display precision for credit amounts
   *
   * Examples:
   * - 0: Show whole numbers only (1, 2, 3 credits)
   * - 1: Show 1 decimal place (1.0, 1.5, 2.0 credits)
   * - 2: Show 2 decimal places (1.00, 1.25, 1.50 credits)
   */
  displayPrecision: 1,

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
  minimumCharge: 0,
} as const;

/**
 * Credit UX helper functions for user-friendly messaging
 */
export const CreditUXUtils = {
  /**
   * Convert credits to estimated conversation days
   * Assumes ~25 credits per conversation, 1-2 conversations per day
   */
  creditsToEstimatedDays: (credits: number): number => {
    const creditsPerConversation = 25;
    const conversationsPerDay = 1.5; // Conservative estimate
    return Math.floor(credits / (creditsPerConversation * conversationsPerDay));
  },

  /**
   * Convert credits to estimated weeks
   */
  creditsToEstimatedWeeks: (credits: number): number => {
    const days = CreditUXUtils.creditsToEstimatedDays(credits);
    return Math.floor(days / 7);
  },

  /**
   * Get abundance-focused balance display text
   */
  getBalanceDisplayText: (credits: number): string => {
    const weeks = CreditUXUtils.creditsToEstimatedWeeks(credits);
    const days = CreditUXUtils.creditsToEstimatedDays(credits);

    if (weeks >= 4) {
      return `${CreditUtils.formatCreditsForDisplay(credits)} credits available\n(enough for ~${weeks} weeks of daily conversations)`;
    } else if (days >= 7) {
      return `${CreditUtils.formatCreditsForDisplay(credits)} credits available\n(enough for ~${Math.floor(days / 7)} weeks of support)`;
    } else if (days >= 3) {
      return `${CreditUtils.formatCreditsForDisplay(credits)} credits available\n(~${days} days of conversations)`;
    } else if (days >= 1) {
      return `${CreditUtils.formatCreditsForDisplay(credits)} credits available\n(~${days} day${days > 1 ? "s" : ""} remaining)`;
    } else {
      return `${CreditUtils.formatCreditsForDisplay(credits)} credits available\n(time to top up for uninterrupted support)`;
    }
  },

  /**
   * Get consumption feedback message (after AI response)
   */
  getConsumptionFeedback: (creditsUsed: number, remainingBalance: number): string => {
    const usdCost = (creditsUsed * 0.005).toFixed(2); // Assuming 1 credit = $0.005
    return `Today's reflection: ${CreditUtils.formatCreditsForDisplay(creditsUsed)} credits (≈ $${usdCost}) — balance: ${CreditUtils.formatCreditsForDisplay(remainingBalance)} credits`;
  },

  /**
   * Get low balance warning message
   */
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

  /**
   * Check if balance is low (less than 5 days of usage)
   */
  isBalanceLow: (credits: number): boolean => {
    return CreditUXUtils.creditsToEstimatedDays(credits) <= 5;
  },

  /**
   * Check if balance is critically low (less than 2 days)
   */
  isBalanceCritical: (credits: number): boolean => {
    return CreditUXUtils.creditsToEstimatedDays(credits) <= 2;
  },
};

/**
 * Helper functions for credit calculations
 */
export const CreditUtils = {
  /**
   * Convert tokens to credits using the configured rate
   */
  tokensToCredits: (tokens: number): number => {
    return tokens / CREDIT_CONFIG.tokensPerCredit;
  },

  /**
   * Convert credits to tokens using the configured rate
   */
  creditsToTokens: (credits: number): number => {
    return credits * CREDIT_CONFIG.tokensPerCredit;
  },

  /**
   * Apply rounding and minimum charge rules
   */
  applyBillingRules: (credits: number): number => {
    let result = credits;

    // Apply rounding
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

    // Apply minimum charge
    return Math.max(result, CREDIT_CONFIG.minimumCharge);
  },

  /**
   * Format credits for display with configured precision
   */
  formatCreditsForDisplay: (credits: number): string => {
    return credits.toFixed(CREDIT_CONFIG.displayPrecision);
  },

  /**
   * Calculate final billable credits (applies rounding and minimum charge)
   */
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
