/**
 * Centralized App Configuration
 * This file contains all app-wide constants that can be easily updated for rebranding
 */

// =========================
// Core App Identity
// =========================

export const APP_CONFIG = {
  // Brand Identity
  name: "Innuora",
  tagline: "AI Emotional Companion Guiding High-Functioning Women Through Burnout and Overwhelm",
  description:
    "Digital emotional companion for high-functioning women facing burnout, overwhelm, and perfectionism. Get clarity through emotionally attuned conversations that reflect patterns, challenge cognitive distortions, and help you understand what's beneath the surface.",

  // AI Agent Identity
  aiAgent: {
    name: "Innuora",
    persona: "compassionate AI emotional companion",
    pronouns: "she/her",
  },

  // Company Details
  company: {
    legalName: "Innuora, Inc.",
    founder: "Abdenasser Mohammedi",
    establishedYear: 2025,
  },

  // Contact Information
  contact: {
    support: "innuora@gmail.com",
    privacy: "innuora@gmail.com",
    business: "innuora@gmail.com",
    // support: "support@innuora.com",
    // privacy: "privacy@innuora.com",
    // business: "hello@innuora.com",
  },

  // Domains & URLs
  domains: {
    primary: "https://www.innuora.com",
    canonical: "https://innuora.com",
    api: "https://api.innuora.com",
  },

  // Social Media
  social: {
    twitter: {
      handle: "@innuora",
      creator: "@innuora",
    },
    linkedin: "@innuora",
    instagram: "@innuora",
  },

  // Legal & Compliance
  legal: {
    ageRequirement: "18+",
    jurisdiction: "United States",
    privacyCompliance: ["GDPR", "CCPA"],
  },

  // App Store & PWA
  app: {
    bundleId: "com.innuora.app",
    appleTouchIcon: "/assets/icons/ios/180.png",
    manifestIcon: "/assets/icons/ios/512.png",
  },

  // SEO & Marketing
  seo: {
    primaryKeywords: [
      "emotional burnout support",
      "women burnout recovery",
      "high-functioning women support",
      "emotional overwhelm relief",
      "perfectionist burnout help",
      "AI emotional companion",
      "emotional clarity app",
    ],
    targetAudience: "high-functioning women",
    category: "health",
  },

  // Theme & Styling
  theme: {
    cssPrefix: "inn", // For CSS variables: --inn-bg-primary, --inn-text-primary, etc.
    primaryColor: "#6366f1", // Current accent color
    brandColors: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#06b6d4",
    },
  },

  // Features & Capabilities
  features: {
    multiLanguageSupport: true,
    supportedLanguages: ["en", "fr", "ar"],
    offlineMode: true,
    cloudSync: true,
    endToEndEncryption: true,
    billingSystem: true,
  },

  // Versioning
  version: {
    current: "1.0.0",
    apiVersion: "v1",
    schemaVersion: "1.0",
  },
} as const;

// =========================
// Derived Constants
// =========================

// Avatar/Icon Letters for different languages
export const AVATAR_LETTERS = {
  en: "I", // Innuora
  fr: "I", // Innuora (same in French)
  ar: "I", // Keep Latin "I" for brand consistency
} as const;

// App names for different contexts
export const APP_NAMES = {
  full: APP_CONFIG.name,
  short: APP_CONFIG.name,
  taglined: `${APP_CONFIG.name} - ${APP_CONFIG.tagline}`,
  withAI: `${APP_CONFIG.name} AI`,
} as const;

// Email addresses (derived from contact config)
export const EMAIL_ADDRESSES = {
  support: APP_CONFIG.contact.support,
  privacy: APP_CONFIG.contact.privacy,
  business: APP_CONFIG.contact.business,
  noreply: `noreply@${APP_CONFIG.domains.primary.replace("https://www.", "")}`,
} as const;

// Social media URLs
export const SOCIAL_URLS = {
  twitter: `https://twitter.com/${APP_CONFIG.social.twitter.handle.replace("@", "")}`,
  linkedin: `https://linkedin.com/company/${APP_CONFIG.social.linkedin.replace("@", "")}`,
  instagram: `https://instagram.com/${APP_CONFIG.social.instagram.replace("@", "")}`,
} as const;

// =========================
// Type Exports
// =========================

export type AppConfig = typeof APP_CONFIG;
export type AvatarLetter = typeof AVATAR_LETTERS;
export type AppName = typeof APP_NAMES;
export type EmailAddress = typeof EMAIL_ADDRESSES;
export type SocialUrl = typeof SOCIAL_URLS;
