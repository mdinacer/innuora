/**
 * Centralized Credit System Configuration
 *
 * VALUE-BASED PRICING MODEL:
 * - Credits represent consumption tracking units
 * - Pricing anchored to clinical value delivered (not API costs)
 * - 1 Innuora session = 5 therapy sessions worth of insights ($1000 value)
 * - Positioned at 97% discount = $30/session
 * - Cost per credit: $0.004, Price per credit: $0.37 (98.9% margin)
 */

export const CREDIT_CONFIG = {
  /**
   * Base rate: How many tokens equal 1 credit point
   *
   * Value-based calculation:
   * - Typical session: 20,500 tokens delivers $1000 of therapeutic value
   * - Priced at $30 (97% discount for accessibility)
   * - tokensPerCredit: 250 → granular tracking, proportional charging
   * - Average message (600 tokens) = 2.4 credits → rounds to 3 credits
   */
  tokensPerCredit: 250,

  /**
   * Display precision for credit amounts
   * Keep whole numbers to maintain clear, simple UX.
   */
  displayPrecision: 0,

  /**
   * Rounding strategy for billing
   * Always round up to ensure proper revenue capture.
   */
  roundingMode: "up" as "up" | "nearest" | "down",

  /**
   * Minimum credit charge (prevents zero-credit operations)
   */
  minimumCharge: 1,
} as const;

/**
 * Credit UX helper functions
 *
 * Note: Token consumption is variable (short messages vs deep reflections),
 * so we avoid misleading "days remaining" estimations.
 * Just show credits - users understand their usage patterns.
 */
export const CreditUXUtils = {
  /**
   * Simple balance check thresholds
   */
  isBalanceLow: (credits: number): boolean => {
    return credits < 50; // Less than ~17 typical messages
  },

  isBalanceCritical: (credits: number): boolean => {
    return credits < 20; // Less than ~7 typical messages
  },

  /**
   * Get simple low balance warning (no predictions, just threshold)
   */
  getLowBalanceWarning: (credits: number): string => {
    if (credits < 20) {
      return "Your balance is low. Top up now to continue your sessions.";
    } else if (credits < 50) {
      return "Your balance is getting low. Consider topping up soon.";
    } else {
      return "";
    }
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
