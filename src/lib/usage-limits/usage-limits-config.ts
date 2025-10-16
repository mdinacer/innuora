/**
 * Flexible Usage Limits Configuration
 *
 * Change the LIMIT_MODE to switch between different monetization models:
 * - "session": Limit by therapy sessions (recommended)
 * - "message": Limit by message count
 * - "credit": Limit by credit consumption
 * - "unlimited": No limits (for testing or unlimited plans)
 */

// =========================
// Core Configuration
// =========================

export type LimitMode = "session" | "message" | "credit" | "unlimited";

export const USAGE_LIMITS_CONFIG = {
  /**
   * Active limit mode - change this to switch monetization models
   */
  mode: (process.env.NEXT_PUBLIC_LIMIT_MODE as LimitMode) || "session",

  /**
   * Session-based limits configuration
   */
  sessionLimits: {
    // Maximum messages per session before auto-end
    maxMessagesPerSession: parseInt(process.env.NEXT_PUBLIC_MAX_MESSAGES_PER_SESSION || "30"),

    // Maximum tokens per session before auto-end
    maxTokensPerSession: parseInt(process.env.NEXT_PUBLIC_MAX_TOKENS_PER_SESSION || "20000"),

    // Grace period before hard-stopping (warning at 80%, stop at 100%)
    warningThreshold: 0.8,

    // Message shown when session limit reached
    sessionEndMessage:
      "We've covered a lot in this session. Let's take time to reflect on what we discussed. Start a new session when you're ready to continue.",
  },

  /**
   * Message-based limits configuration
   */
  messageLimits: {
    // Count both user and AI messages, or just user messages?
    countBothSides: false, // false = count only user messages

    // Maximum message length before counting as multiple messages
    maxTokensPerMessage: parseInt(process.env.NEXT_PUBLIC_MAX_TOKENS_PER_MESSAGE || "2000"),

    // Warning threshold (show warning at 80% usage)
    warningThreshold: 0.8,
  },

  /**
   * Credit-based limits configuration
   */
  creditLimits: {
    // Minimum credits required to start conversation
    minimumToStart: parseInt(process.env.NEXT_PUBLIC_MIN_CREDITS_TO_START || "5"),

    // Warning threshold (show warning at this balance)
    warningThreshold: parseInt(process.env.NEXT_PUBLIC_CREDIT_WARNING_THRESHOLD || "50"),

    // Critical threshold (urgent warning)
    criticalThreshold: parseInt(process.env.NEXT_PUBLIC_CREDIT_CRITICAL_THRESHOLD || "20"),
  },

  /**
   * Rate limiting (applies to all modes)
   */
  rateLimits: {
    // Maximum messages per hour (prevents spam)
    maxMessagesPerHour: parseInt(process.env.NEXT_PUBLIC_MAX_MESSAGES_PER_HOUR || "100"),

    // Maximum sessions per day (prevents abuse)
    maxSessionsPerDay: parseInt(process.env.NEXT_PUBLIC_MAX_SESSIONS_PER_DAY || "10"),
  },
} as const;

// =========================
// Subscription Tier Configuration
// =========================

export interface SubscriptionTier {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  limits: {
    // Session-based limits
    sessionsPerMonth?: number;
    messagesPerSession?: number;
    tokensPerSession?: number;

    // Message-based limits
    messagesPerMonth?: number;
    tokensPerMessage?: number;

    // Credit-based limits
    creditsPerMonth?: number;

    // Feature flags
    unlimitedConversations?: boolean;
    unlimitedDiagnostics?: boolean;
    clinicalReports?: boolean;
    therapistSharing?: boolean;
  };
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: "free",
    name: "Free",
    price: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      // SESSION MODE: 2 trial sessions
      sessionsPerMonth: parseInt(process.env.NEXT_PUBLIC_FREE_SESSIONS || "2"),
      messagesPerSession: 30,
      tokensPerSession: 20000,

      // MESSAGE MODE: 20 messages
      messagesPerMonth: parseInt(process.env.NEXT_PUBLIC_FREE_MESSAGES || "20"),
      tokensPerMessage: 2000,

      // CREDIT MODE: 50 credits
      creditsPerMonth: parseInt(process.env.NEXT_PUBLIC_FREE_CREDITS || "50"),

      // Features
      unlimitedConversations: false,
      unlimitedDiagnostics: false,
      clinicalReports: false,
      therapistSharing: false,
    },
    features: ["Basic AI conversations", "Basic insights", "Session history"],
  },

  basic: {
    id: "basic",
    name: "Basic",
    price: {
      monthly: parseFloat(process.env.NEXT_PUBLIC_BASIC_PRICE_MONTHLY || "25"),
      yearly: parseFloat(process.env.NEXT_PUBLIC_BASIC_PRICE_YEARLY || "250"),
    },
    limits: {
      // SESSION MODE: 5 sessions per month
      sessionsPerMonth: parseInt(process.env.NEXT_PUBLIC_BASIC_SESSIONS || "5"),
      messagesPerSession: 30,
      tokensPerSession: 20000,

      // MESSAGE MODE: 150 messages
      messagesPerMonth: parseInt(process.env.NEXT_PUBLIC_BASIC_MESSAGES || "150"),
      tokensPerMessage: 2000,

      // CREDIT MODE: 500 credits
      creditsPerMonth: parseInt(process.env.NEXT_PUBLIC_BASIC_CREDITS || "500"),

      // Features
      unlimitedConversations: false,
      unlimitedDiagnostics: false,
      clinicalReports: false,
      therapistSharing: false,
    },
    features: [
      "Full therapeutic conversations",
      "Complete analysis",
      "Standard diagnostic reports",
      "Pattern tracking",
    ],
  },

  regular: {
    id: "regular",
    name: "Regular",
    price: {
      monthly: parseFloat(process.env.NEXT_PUBLIC_REGULAR_PRICE_MONTHLY || "45"),
      yearly: parseFloat(process.env.NEXT_PUBLIC_REGULAR_PRICE_YEARLY || "450"),
    },
    limits: {
      // SESSION MODE: 12 sessions per month
      sessionsPerMonth: parseInt(process.env.NEXT_PUBLIC_REGULAR_SESSIONS || "12"),
      messagesPerSession: 30,
      tokensPerSession: 20000,

      // MESSAGE MODE: 400 messages
      messagesPerMonth: parseInt(process.env.NEXT_PUBLIC_REGULAR_MESSAGES || "400"),
      tokensPerMessage: 2000,

      // CREDIT MODE: 1200 credits
      creditsPerMonth: parseInt(process.env.NEXT_PUBLIC_REGULAR_CREDITS || "1200"),

      // Features
      unlimitedConversations: false,
      unlimitedDiagnostics: true,
      clinicalReports: false,
      therapistSharing: false,
    },
    features: [
      "Everything in Basic",
      "Advanced pattern recognition",
      "Progress tracking",
      "Unlimited diagnostic reports",
    ],
    popular: true,
  },

  pro: {
    id: "pro",
    name: "Professional",
    price: {
      monthly: parseFloat(process.env.NEXT_PUBLIC_PRO_PRICE_MONTHLY || "75"),
      yearly: parseFloat(process.env.NEXT_PUBLIC_PRO_PRICE_YEARLY || "750"),
    },
    limits: {
      // SESSION MODE: 25 sessions per month
      sessionsPerMonth: parseInt(process.env.NEXT_PUBLIC_PRO_SESSIONS || "25"),
      messagesPerSession: 30,
      tokensPerSession: 20000,

      // MESSAGE MODE: 800 messages
      messagesPerMonth: parseInt(process.env.NEXT_PUBLIC_PRO_MESSAGES || "800"),
      tokensPerMessage: 2000,

      // CREDIT MODE: 2500 credits
      creditsPerMonth: parseInt(process.env.NEXT_PUBLIC_PRO_CREDITS || "2500"),

      // Features
      unlimitedConversations: false,
      unlimitedDiagnostics: true,
      clinicalReports: true,
      therapistSharing: true,
    },
    features: ["Everything in Regular", "Clinical-grade diagnostics", "Therapist report sharing", "Priority support"],
  },
};

// =========================
// Usage Calculation Utilities
// =========================

export const UsageLimitUtils = {
  /**
   * Get current active limit mode
   */
  getLimitMode: (): LimitMode => {
    return USAGE_LIMITS_CONFIG.mode;
  },

  /**
   * Get tier limits for current mode
   */
  getTierLimits: (tierId: string) => {
    const tier = SUBSCRIPTION_TIERS[tierId];
    if (!tier) return null;

    const mode = UsageLimitUtils.getLimitMode();

    switch (mode) {
      case "session":
        return {
          type: "session" as const,
          limit: tier.limits.sessionsPerMonth || 0,
          maxMessagesPerSession: tier.limits.messagesPerSession || 30,
          maxTokensPerSession: tier.limits.tokensPerSession || 20000,
        };

      case "message":
        return {
          type: "message" as const,
          limit: tier.limits.messagesPerMonth || 0,
          maxTokensPerMessage: tier.limits.tokensPerMessage || 2000,
        };

      case "credit":
        return {
          type: "credit" as const,
          limit: tier.limits.creditsPerMonth || 0,
        };

      case "unlimited":
        return {
          type: "unlimited" as const,
          limit: Infinity,
        };

      default:
        return null;
    }
  },

  /**
   * Check if user has exceeded limit
   */
  hasExceededLimit: (used: number, limit: number): boolean => {
    if (USAGE_LIMITS_CONFIG.mode === "unlimited") return false;
    return used >= limit;
  },

  /**
   * Check if user is approaching limit (warning)
   */
  isApproachingLimit: (used: number, limit: number): boolean => {
    if (USAGE_LIMITS_CONFIG.mode === "unlimited") return false;
    const threshold =
      USAGE_LIMITS_CONFIG.mode === "session"
        ? USAGE_LIMITS_CONFIG.sessionLimits.warningThreshold
        : USAGE_LIMITS_CONFIG.mode === "message"
          ? USAGE_LIMITS_CONFIG.messageLimits.warningThreshold
          : 0.8;

    return used >= limit * threshold;
  },

  /**
   * Get warning message for current mode
   */
  getWarningMessage: (used: number, limit: number): string => {
    const remaining = limit - used;
    const mode = USAGE_LIMITS_CONFIG.mode;

    switch (mode) {
      case "session":
        return `You have ${remaining} session${remaining !== 1 ? "s" : ""} remaining this month.`;

      case "message":
        return `You have ${remaining} message${remaining !== 1 ? "s" : ""} remaining this month.`;

      case "credit":
        return `You have ${remaining} credit${remaining !== 1 ? "s" : ""} remaining.`;

      default:
        return "";
    }
  },

  /**
   * Get limit exceeded message
   */
  getLimitExceededMessage: (): string => {
    const mode = USAGE_LIMITS_CONFIG.mode;

    switch (mode) {
      case "session":
        return "You've reached your monthly session limit. Upgrade your plan to continue your therapeutic journey.";

      case "message":
        return "You've reached your monthly message limit. Upgrade your plan to continue conversations.";

      case "credit":
        return "Your credits have run out. Purchase more credits to continue.";

      default:
        return "";
    }
  },

  /**
   * Format remaining usage for display
   */
  formatRemainingUsage: (used: number, limit: number): string => {
    const remaining = Math.max(0, limit - used);
    const mode = USAGE_LIMITS_CONFIG.mode;

    switch (mode) {
      case "session":
        return `${remaining} of ${limit} sessions`;

      case "message":
        return `${remaining} of ${limit} messages`;

      case "credit":
        return `${remaining} credits`;

      case "unlimited":
        return "Unlimited";

      default:
        return `${remaining}`;
    }
  },
};

// =========================
// Type Exports
// =========================

export type UsageLimitMode = typeof USAGE_LIMITS_CONFIG.mode;
export type SubscriptionTierId = keyof typeof SUBSCRIPTION_TIERS;
