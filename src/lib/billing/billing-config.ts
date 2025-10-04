/**
 * Billing System Configuration
 *
 * Centralized configuration for payment processing, Stripe integration,
 * and billing-related constants.
 */

// =========================
// Stripe Configuration
// =========================

export const STRIPE_CONFIG = {
  // Stripe API keys (loaded from environment)
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  secretKey: process.env.STRIPE_SECRET_KEY || "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",

  // Stripe settings
  currency: "usd",

  // Payment method types to accept
  paymentMethods: ["card"] as const,

  // Stripe API version
  apiVersion: "2025-08-27.basil" as const,
} as const;

// =========================
// Billing Product Configuration
// =========================

// export const BILLING_PRODUCTS = {
//   // Credit packages with Stripe price IDs
//   starter: {
//     priceId: process.env.STRIPE_PRICE_STARTER || "price_starter",
//     credits: 50,
//     price: 5.0,
//     popular: false,
//   },
//   regular: {
//     priceId: process.env.STRIPE_PRICE_REGULAR || "price_regular",
//     credits: 150,
//     price: 10.0,
//     popular: true,
//   },
//   premium: {
//     priceId: process.env.STRIPE_PRICE_PREMIUM || "price_premium",
//     credits: 400,
//     price: 25.0,
//     popular: false,
//   },
// } as const;

/**
 * VALUE-BASED PRICING - B2C Credit Packages
 *
 * Pricing reflects clinical value delivered (professional-grade diagnostics),
 * not just API token costs. See docs/PRICING_STRATEGY.md for full rationale.
 *
 * Price positioning:
 * - Starter ($35): Less than therapy book, try full system
 * - Regular ($75): 1/4 cost of therapy, structured CBT companion
 * - Premium ($150): Includes unlimited $500 assessments
 */
export const BILLING_PRODUCTS = {
  // FREE TIER - Not a Stripe product, handled separately
  // 50 credits, basic insights only, no payment required

  // STARTER TIER - Try the full system
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER || "price_starter",
    credits: 700, // ~175 messages OR ~150 messages + 15 full diagnostics
    price: 35.0,
    popular: false,
    label: "Starter",
    tagline: "Experience clinical-grade self-insight",
    features: [
      "700 conversation credits (~175 messages)",
      "Full actionable diagnostic reports",
      "Hidden rules & leverage points",
      "Concrete next steps",
      "PDF export for personal use",
    ],
    diagnosticTier: "regular" as const, // 7-section actionable diagnostics
  },

  // REGULAR TIER - Most popular, monthly self-work
  regular: {
    priceId: process.env.STRIPE_PRICE_REGULAR || "price_regular",
    credits: 1500, // ~375 messages OR ~330 messages + 55 full diagnostics
    price: 75.0,
    popular: true,
    label: "Regular",
    tagline: "Professional-grade CBT companion for serious self-work",
    features: [
      "1,500 conversation credits (~375 messages)",
      "Full actionable diagnostic reports",
      "Pattern tracking across sessions",
      "All self-work insights + resources",
      "PDF export for personal use",
    ],
    diagnosticTier: "regular" as const, // 7-section actionable diagnostics
    bonus: 100, // Bonus credits vs buying Starter twice
    savings: "2x more credits vs Starter for 2.1x price",
  },

  // PREMIUM TIER - Clinical-grade for therapist collaboration
  premium: {
    priceId: process.env.STRIPE_PRICE_PREMIUM || "price_premium",
    credits: 3000, // ~750 messages OR ~660 messages + 100 clinical diagnostics
    price: 150.0,
    popular: false,
    label: "Premium",
    tagline: "Professional assessment + therapy companion",
    features: [
      "3,000 conversation credits (~750 messages)",
      "Unlimited clinical diagnostic reports ($500+ value each)",
      "Therapist-grade clinical interpretations",
      "Treatment recommendations",
      "Risk assessment tracking",
      "Email export to therapist",
      "All regular features included",
    ],
    diagnosticTier: "premium" as const, // 9-section clinical diagnostics
    bonus: 300, // Bonus credits
    savings: "4x more credits vs Starter for 4.3x price",
    clinicalValue: "$1,500+ in professional psychological assessments",
  },
} as const;

// =========================
// Transaction Configuration
// =========================

export const TRANSACTION_CONFIG = {
  // Transaction reasons for audit trail
  reasons: {
    PURCHASE: "credit_purchase",
    AI_USAGE: "ai_usage",
    MEMORY_GENERATION: "memory_generation",
    ANALYSIS: "session_analysis",
    ADMIN_ADJUSTMENT: "admin_adjustment",
    BONUS: "bonus_credits",
    REFUND: "refund",
    SUBSCRIPTION: "subscription_renewal",
  },

  // Transaction statuses
  statuses: {
    PENDING: "pending",
    COMPLETED: "completed",
    FAILED: "failed",
    REFUNDED: "refunded",
    CANCELLED: "cancelled",
  },

  // Limits and constraints
  limits: {
    maxCreditsPerPurchase: 10000, // Allow up to ~3x Premium tier
    minCreditsPerPurchase: 700, // Starter tier minimum
    maxTransactionsPerDay: 10,
  },
} as const;

// =========================
// Webhook Configuration
// =========================

export const WEBHOOK_CONFIG = {
  // Events we handle from Stripe
  handledEvents: [
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
  ] as const,

  // Retry configuration for failed webhooks
  retryConfig: {
    maxRetries: 3,
    retryDelayMs: 5000,
    exponentialBackoff: true,
  },
} as const;

// =========================
// Security Configuration
// =========================

export const BILLING_SECURITY = {
  // Rate limiting
  rateLimits: {
    purchaseAttempts: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    webhookProcessing: {
      maxAttempts: 10,
      windowMs: 60 * 1000, // 1 minute
    },
  },

  // Validation rules
  validation: {
    maxMetadataSize: 1024, // bytes
    allowedCurrencies: ["usd"] as const,
    minAmount: 3500, // cents ($35.00) - Starter tier minimum
    maxAmount: 15000, // cents ($150.00) - Premium tier
  },
} as const;

// =========================
// Type Definitions
// =========================

export type BillingProductKey = keyof typeof BILLING_PRODUCTS;
export type TransactionReason = (typeof TRANSACTION_CONFIG.reasons)[keyof typeof TRANSACTION_CONFIG.reasons];
export type TransactionStatus = (typeof TRANSACTION_CONFIG.statuses)[keyof typeof TRANSACTION_CONFIG.statuses];
export type StripeWebhookEvent = (typeof WEBHOOK_CONFIG.handledEvents)[number];

// =========================
// Utility Functions
// =========================

export const BillingUtils = {
  /**
   * Convert dollars to cents for Stripe
   */
  dollarsToCents: (dollars: number): number => {
    return Math.round(dollars * 100);
  },

  /**
   * Convert cents to dollars
   */
  centsToDollars: (cents: number): number => {
    return cents / 100;
  },

  /**
   * Get product configuration by key
   */
  getProduct: (key: BillingProductKey) => {
    return BILLING_PRODUCTS[key];
  },

  /**
   * Validate purchase amount
   */
  isValidPurchaseAmount: (amountCents: number): boolean => {
    return amountCents >= BILLING_SECURITY.validation.minAmount && amountCents <= BILLING_SECURITY.validation.maxAmount;
  },

  /**
   * Calculate platform fee (if any)
   */
  calculatePlatformFee: (): number => {
    // Currently no platform fee, but ready for future implementation
    return 0;
  },

  /**
   * Format amount for display
   */
  formatAmount: (amountCents: number, currency: string = STRIPE_CONFIG.currency): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(BillingUtils.centsToDollars(amountCents));
  },
};

// =========================
// Error Codes
// =========================

export const BILLING_ERROR_CODES = {
  // Payment errors
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_CANCELLED: "PAYMENT_CANCELLED",
  INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
  CARD_DECLINED: "CARD_DECLINED",

  // Webhook errors
  WEBHOOK_VERIFICATION_FAILED: "WEBHOOK_VERIFICATION_FAILED",
  WEBHOOK_PROCESSING_FAILED: "WEBHOOK_PROCESSING_FAILED",

  // Configuration errors
  INVALID_PRODUCT: "INVALID_PRODUCT",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  MISSING_STRIPE_KEYS: "MISSING_STRIPE_KEYS",

  // User errors
  USER_NOT_FOUND: "USER_NOT_FOUND",
  CREDIT_LIMIT_EXCEEDED: "CREDIT_LIMIT_EXCEEDED",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const;
