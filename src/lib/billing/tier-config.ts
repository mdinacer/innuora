/**
 * User Tier Configuration
 *
 * Centralized tier management for feature access and subscription benefits.
 * This config-based approach allows easy tier modifications without code changes.
 *
 * Tier Hierarchy:
 * - FREE: Trial users with basic access
 * - STARTER: One-time purchase (700 credits)
 * - REGULAR: One-time purchase (1500 credits)
 * - PREMIUM: One-time purchase (3000 credits) + clinical diagnostics
 *
 * Future: Can easily add subscription tiers (MONTHLY, YEARLY) by extending this config
 */

// =========================
// Type Definitions
// =========================

export type UserTier = "FREE" | "STARTER" | "REGULAR" | "PREMIUM";
export type DiagnosticLevel = "basic" | "regular" | "premium";

export interface TierFeatures {
  // Session limits
  maxSessionsPerMonth: number | null; // null = unlimited

  // Feature access
  diagnosticReports: boolean; // Access to actionable diagnostic reports
  advancedInsights: boolean; // Advanced therapeutic insights
  sessionExport: boolean; // Export sessions as PDF/JSON
  prioritySupport: boolean; // Priority customer support

  // Diagnostic capabilities
  diagnosticLevel: DiagnosticLevel; // Level of diagnostic detail
  clinicalReports: boolean; // Therapist-grade clinical reports
}

export interface TierConfig {
  name: string;
  description: string;
  features: TierFeatures;

  // Subscription properties (for future use)
  isSubscription?: boolean;
  billingInterval?: "monthly" | "yearly" | "one_time";
  price?: number; // Monthly/yearly price (if subscription)
}

// =========================
// Tier Configuration
// =========================

export const TIER_CONFIG: Record<UserTier, TierConfig> = {
  FREE: {
    name: "Free Trial",
    description: "Basic access to explore the platform",
    features: {
      maxSessionsPerMonth: 5,
      diagnosticReports: false,
      advancedInsights: false,
      sessionExport: false,
      prioritySupport: false,
      diagnosticLevel: "basic",
      clinicalReports: false,
    },
    isSubscription: false,
    billingInterval: "one_time",
  },

  STARTER: {
    name: "Starter",
    description: "Experience clinical-grade self-insight (700 credits)",
    features: {
      maxSessionsPerMonth: null, // Unlimited sessions
      diagnosticReports: true,
      advancedInsights: true,
      sessionExport: true,
      prioritySupport: false,
      diagnosticLevel: "regular",
      clinicalReports: false,
    },
    isSubscription: false,
    billingInterval: "one_time",
  },

  REGULAR: {
    name: "Regular",
    description: "Professional-grade CBT companion (1500 credits)",
    features: {
      maxSessionsPerMonth: null, // Unlimited sessions
      diagnosticReports: true,
      advancedInsights: true,
      sessionExport: true,
      prioritySupport: true,
      diagnosticLevel: "regular",
      clinicalReports: false,
    },
    isSubscription: false,
    billingInterval: "one_time",
  },

  PREMIUM: {
    name: "Premium",
    description: "Professional assessment + therapy companion (3000 credits)",
    features: {
      maxSessionsPerMonth: null, // Unlimited sessions
      diagnosticReports: true,
      advancedInsights: true,
      sessionExport: true,
      prioritySupport: true,
      diagnosticLevel: "premium",
      clinicalReports: true, // Therapist-grade clinical reports
    },
    isSubscription: false,
    billingInterval: "one_time",
  },
} as const;

// =========================
// Utility Functions
// =========================

/**
 * Get tier configuration
 */
export function getTierConfig(tier: UserTier): TierConfig {
  return TIER_CONFIG[tier];
}

/**
 * Check if user can access a specific feature
 */
export function canAccessFeature(tier: UserTier, feature: keyof TierFeatures): boolean {
  const config = getTierConfig(tier);
  return config.features[feature] as boolean;
}

/**
 * Get diagnostic level for tier
 */
export function getDiagnosticLevel(tier: UserTier): DiagnosticLevel {
  return getTierConfig(tier).features.diagnosticLevel;
}

/**
 * Check if tier has session limits
 */
export function hasSessionLimit(tier: UserTier): boolean {
  const config = getTierConfig(tier);
  return config.features.maxSessionsPerMonth !== null;
}

/**
 * Get remaining sessions for user (if limited)
 * Returns null if unlimited
 */
export function getSessionLimit(tier: UserTier): number | null {
  const config = getTierConfig(tier);
  return config.features.maxSessionsPerMonth;
}

/**
 * Check if tier is a subscription tier
 */
export function isSubscriptionTier(tier: UserTier): boolean {
  return getTierConfig(tier).isSubscription ?? false;
}

/**
 * Get tier display name
 */
export function getTierName(tier: UserTier): string {
  return getTierConfig(tier).name;
}

/**
 * Get all available tiers (for admin/upgrade UI)
 */
export function getAllTiers(): UserTier[] {
  return Object.keys(TIER_CONFIG) as UserTier[];
}

/**
 * Check if user should see upgrade prompt
 */
export function shouldShowUpgrade(tier: UserTier): boolean {
  // Free users should always see upgrade options
  if (tier === "FREE") return true;

  // Starter/Regular users can upgrade to higher tiers
  if (tier === "STARTER" || tier === "REGULAR") return true;

  // Premium users have everything
  return false;
}

/**
 * Get next tier for upgrade prompt
 */
export function getNextTier(currentTier: UserTier): UserTier | null {
  const tierHierarchy: UserTier[] = ["FREE", "STARTER", "REGULAR", "PREMIUM"];
  const currentIndex = tierHierarchy.indexOf(currentTier);

  if (currentIndex === -1 || currentIndex === tierHierarchy.length - 1) {
    return null; // Already at highest tier
  }

  return tierHierarchy[currentIndex + 1];
}
