/**
 * Development Tools Configuration
 *
 * Centralized feature flags for development-only tools.
 * Easy to disable all dev tools for production builds.
 */

/**
 * Master switch for all development tools
 * Set to false before production deployment
 */
export const DEV_TOOLS_ENABLED = process.env.NODE_ENV === "development";

/**
 * Session consumption tracker
 * Shows detailed AI usage metrics for monetization analysis
 */
export const ENABLE_CONSUMPTION_TRACKER = DEV_TOOLS_ENABLED && true;

/**
 * Debug mode flags
 */
export const DEBUG_FLAGS = {
  logAIOperations: DEV_TOOLS_ENABLED && false,
  logStateChanges: DEV_TOOLS_ENABLED && false,
  logCreditOperations: DEV_TOOLS_ENABLED && false,
} as const;
