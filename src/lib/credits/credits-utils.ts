// Credits system utilities and constants
// Note: This file contains ONLY client-safe utilities
// Model pricing and configuration are server-side only (see credit-config.ts)

import { CreditUtils } from "./credit-config";

// Credit conversion: 1 credit = $0.005 USD (0.5¢)
// This is safe to expose - it's public pricing information
export const CREDIT_UNIT_USD = 0.005;

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

// Diagnostic tier levels (client-safe)
export type DiagnosticTier = "free" | "regular" | "premium";

// Diagnostic feature access by tier
export const DIAGNOSTIC_FEATURES = {
  free: {
    sections: ["whats_happening"] as const,
    description: "See what patterns we notice",
    exportable: false,
  },
  regular: {
    sections: [
      "whats_happening",
      "hidden_rules",
      "why_heavy",
      "meta_patterns",
      "leverage_points",
      "where_to_start",
      "relevant_resources",
    ] as const,
    description: "Full actionable insights for self-work",
    exportable: true,
    exportFormat: "pdf" as const,
  },
  premium: {
    sections: [
      "themes",
      "cognitive_distortions",
      "emotional_state",
      "risk_assessment",
      "therapist_focus",
      "clinical_interpretations",
      "treatment_recommendations",
      "professional_language",
      "clinical_insights",
    ] as const,
    description: "Clinical-grade diagnostic for therapist collaboration",
    exportable: true,
    exportFormat: "pdf" as const,
    shareWithTherapist: true,
  },
} as const;

// Credit package bundles - VALUE-BASED PRICING
// Pricing reflects the clinical value delivered, not just API costs
export const CREDIT_PACKAGES = {
  // FREE TIER - Marketing hook to experience the system
  free: {
    price: 0,
    credits: 50,
    bonus: 0,
    diagnosticTier: "free" as DiagnosticTier,
    description: "Try Innuora's structured CBT system",
    features: [
      "50 conversation credits (~12 messages)",
      "Basic pattern insights (what's happening)",
      "Experience CBT module quality",
    ],
    valueProposition: "See how Innuora understands you",
  },

  // STARTER TIER - Try the full system
  starter: {
    price: 35.0,
    credits: 700,
    bonus: 0,
    diagnosticTier: "regular" as DiagnosticTier,
    description: "Try the full system",
    features: [
      "700 conversation credits (~175 messages)",
      "Full actionable diagnostic reports",
      "Hidden rules & leverage points",
      "Concrete next steps",
      "PDF export for personal use",
    ],
    valueProposition: "Experience clinical-grade self-insight",
    estimatedUsage: "~150 messages + 15 full diagnostics per month",
  },

  // REGULAR TIER - Most popular, monthly self-work
  regular: {
    price: 75.0,
    credits: 1500,
    bonus: 100,
    diagnosticTier: "regular" as DiagnosticTier,
    mostPopular: true,
    description: "Monthly structured support",
    features: [
      "1,500 conversation credits (~375 messages)",
      "Full actionable diagnostic reports",
      "Pattern tracking across sessions",
      "All self-work insights + resources",
      "PDF export for personal use",
    ],
    valueProposition: "Professional-grade CBT companion for serious self-work",
    estimatedUsage: "~330 messages + 55 full diagnostics per month",
    savings: "2x more credits vs Starter for 2.1x price",
  },

  // PREMIUM TIER - Clinical-grade for therapist collaboration
  premium: {
    price: 150.0,
    credits: 3000,
    bonus: 300,
    diagnosticTier: "premium" as DiagnosticTier,
    description: "Clinical-grade companion",
    features: [
      "3,000 conversation credits (~750 messages)",
      "Unlimited clinical diagnostic reports ($500+ value each)",
      "Therapist-grade clinical interpretations",
      "Treatment recommendations",
      "Risk assessment tracking",
      "Email export to therapist",
      "All regular features included",
    ],
    valueProposition: "Professional assessment + therapy companion",
    estimatedUsage: "~660 messages + 100 clinical diagnostics per month",
    savings: "4x more credits vs Starter for 4.3x price",
    clinicalValue: "$1,500+ in professional psychological assessments",
  },
} as const;

// Type helper for package keys
export type PackageKey = keyof typeof CREDIT_PACKAGES;
