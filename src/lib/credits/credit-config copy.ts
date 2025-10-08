export const CREDIT_CONFIG = {
  /**
   * CORE CREDIT VALUES
   * 1 credit = $0.005 USD (half a cent)
   * This creates simple, predictable pricing for users
   */
  tokensPerCredit: 1000,
  creditUnitUSD: 0.005,

  /**
   * USER-FACING SETTINGS
   * Designed for clarity and simplicity in the UI
   */
  displayPrecision: 0, // Show whole credits only (1, 2, 3)
  roundingMode: "up" as const, // Always round up in user's favor for transparency
  minimumCharge: 1, // Always charge at least 1 credit

  /**
   * BUSINESS PRICING MODEL
   * Ensures healthy margins while remaining fair to users
   */
  pricing: {
    // 3x markup ensures 66% gross margin after AI costs
    markupMultiplier: 3.0,

    // Fixed overhead covers infrastructure per request
    infraOverheadUSD: 0.015,

    // Target margins after all costs
    targetMarginPercent: 65,
  },

  /**
   * PREDICTABLE FEATURE PRICING
   * Users know exactly what diagnostics cost
   */
  features: {
    // Conversation messaging - pay as you go
    messaging: {
      estimatedTokensPerMessage: 3000,
      estimatedCreditsPerMessage: 3, // 3000 tokens ÷ 1000
      description: "Per message",
    },

    // Diagnostic reports - fixed, predictable pricing
    diagnostics: {
      basic: {
        maxTokens: 1000,
        fixedCreditCost: 1,
        includes: ["whats_happening"],
        description: "Quick insights",
      },
      standard: {
        maxTokens: 3000,
        fixedCreditCost: 3,
        includes: ["whats_happening", "hidden_rules", "why_heavy", "where_to_start"],
        description: "Full actionable report",
      },
      advanced: {
        maxTokens: 3500,
        fixedCreditCost: 4,
        includes: "all sections + clinical insights",
        description: "Clinical-grade assessment",
      },
    },
  },

  /**
   * SUBSCRIPTION PLANS
   * Bundled credits create predictable monthly value
   */
  plans: {
    essential: {
      monthlyCredits: 100, // $10 value
      priceUSD: 29, // 65% effective discount
      bestFor: "Light users",
    },
    professional: {
      monthlyCredits: 300, // $30 value
      priceUSD: 79, // 62% effective discount
      bestFor: "Regular users",
    },
    unlimited: {
      monthlyCredits: 1000, // $100 value
      priceUSD: 197, // 51% effective discount
      bestFor: "Heavy users & professionals",
    },
  },

  /**
   * CALCULATION UTILITIES
   */
  calculateCost: (tokensUsed: number) => {
    const aiCost = tokensUsed * 0.0009; // Average token cost
    const totalCost = aiCost + CREDIT_CONFIG.pricing.infraOverheadUSD;
    const chargedToUser = totalCost * CREDIT_CONFIG.pricing.markupMultiplier;
    const credits = Math.ceil(chargedToUser / CREDIT_CONFIG.creditUnitUSD);
    return Math.max(credits, CREDIT_CONFIG.minimumCharge);
  },

  // Quick reference for common calculations
  estimates: {
    averageSessionCredits: 15, // ~15k token session
    averageMonthlyUsage: 150, // 10 sessions/month
    costPerSession: 0.06, // Your actual cost
    revenuePerSession: 0.18, // Your revenue at 3x markup
  },
} as const;
