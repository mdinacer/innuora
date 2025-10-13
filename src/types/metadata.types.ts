/**
 * Metadata Type Definitions
 *
 * This file contains strongly-typed metadata schemas for all JSON metadata fields
 * used throughout the application. These types eliminate unsafe `any` casts and
 * provide compile-time validation.
 */

import { Prisma } from "@prisma/client";

// =========================
// Credit Transaction Metadata
// =========================

/**
 * Metadata for credit transactions related to payments
 */
export interface PaymentCreditMetadata {
  paymentIntentId: string;
  customerId?: string;
  status: "pending" | "completed" | "failed" | "refunded";
  refundedAt?: string; // ISO date string
  refundReason?: string;
}

/**
 * Metadata for credit transactions related to subscriptions
 */
export interface SubscriptionCreditMetadata {
  subscriptionId: string;
  invoiceId?: string;
  paymentIntentId?: string;
  status: "pending" | "completed" | "failed";
}

/**
 * Metadata for credit transactions related to AI usage
 */
export interface AiUsageCreditMetadata {
  sessionId: string;
  messageId?: string;
  modelCode?: string;
  tokensUsed?: number;
  requestTimestamp?: string; // ISO date string
}

/**
 * Union type for all credit transaction metadata
 */
export type CreditTransactionMetadata =
  | PaymentCreditMetadata
  | SubscriptionCreditMetadata
  | AiUsageCreditMetadata
  | Record<string, unknown>; // Fallback for custom metadata

// =========================
// Session Metadata
// =========================

/**
 * Metadata stored in Session.metadata (non-sensitive)
 */
export interface SessionMetadata {
  messageCount: number;
  creditsUsed: number;
  lastActiveAt?: string; // ISO date string
  activeDurationMs?: number;
  tokenUsage?: Array<{
    type: "completion";
    model: string;
    mode: "paid" | "free";
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    timestamp: string; // ISO date string
    version: string;
    costUSD: number; // Legacy field
  }>;
}

// =========================
// User Profile Metadata
// =========================

/**
 * Metadata for user profiles (flexible additional data)
 */
export interface UserProfileMetadata {
  onboardingCompletedAt?: string; // ISO date string
  preferredTheme?: "light" | "dark" | "auto";
  notificationPreferences?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  lastSeenAt?: string; // ISO date string
  timezone?: string;
}

// =========================
// Audit Log Metadata
// =========================

/**
 * Metadata for audit logs
 */
export interface AuditLogMetadata {
  endpoint?: string;
  userId?: string;
  sessionId?: string;
  role?: string;
  model?: string;
  vendor?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  responseLength?: number;
  errorCode?: string;
  promptIndex?: number;
  attempts?: number;
  maxRetries?: number;
  reason?: string;
  [key: string]: unknown; // Allow additional flexible fields
}

// =========================
// Notification Metadata
// =========================

/**
 * Metadata for notifications
 */
export interface NotificationMetadata {
  actionUrl?: string;
  actionLabel?: string;
  relatedEntityId?: string;
  relatedEntityType?: "session" | "transaction" | "subscription" | "user";
  priority?: "low" | "medium" | "high" | "urgent";
  expiresAt?: string; // ISO date string
}

// =========================
// Type Guards
// =========================

/**
 * Type guard for PaymentCreditMetadata
 */
export function isPaymentCreditMetadata(metadata: unknown): metadata is PaymentCreditMetadata {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "paymentIntentId" in metadata &&
    typeof (metadata as PaymentCreditMetadata).paymentIntentId === "string"
  );
}

/**
 * Type guard for SubscriptionCreditMetadata
 */
export function isSubscriptionCreditMetadata(metadata: unknown): metadata is SubscriptionCreditMetadata {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "subscriptionId" in metadata &&
    typeof (metadata as SubscriptionCreditMetadata).subscriptionId === "string"
  );
}

/**
 * Type guard for AiUsageCreditMetadata
 */
export function isAiUsageCreditMetadata(metadata: unknown): metadata is AiUsageCreditMetadata {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "sessionId" in metadata &&
    typeof (metadata as AiUsageCreditMetadata).sessionId === "string"
  );
}

/**
 * Type guard for SessionMetadata
 */
export function isSessionMetadata(metadata: unknown): metadata is SessionMetadata {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "messageCount" in metadata &&
    typeof (metadata as SessionMetadata).messageCount === "number" &&
    "creditsUsed" in metadata &&
    typeof (metadata as SessionMetadata).creditsUsed === "number"
  );
}

// =========================
// Utility Types
// =========================

/**
 * Helper to safely parse JSON metadata with type checking
 */
export function parseMetadata<T>(
  metadata: Prisma.JsonValue | null | undefined,
  guard: (value: unknown) => value is T
): T | null {
  if (!metadata) return null;

  // Prisma JsonValue can be object, array, string, number, boolean, or null
  if (typeof metadata === "object" && metadata !== null && !Array.isArray(metadata)) {
    return guard(metadata) ? metadata : null;
  }

  return null;
}

/**
 * Helper to safely cast metadata with fallback
 */
export function castMetadata<T extends Record<string, unknown>>(
  metadata: Prisma.JsonValue | null | undefined,
  defaultValue: T
): T {
  if (!metadata) return defaultValue;

  if (typeof metadata === "object" && metadata !== null && !Array.isArray(metadata)) {
    return metadata as T;
  }

  return defaultValue;
}
