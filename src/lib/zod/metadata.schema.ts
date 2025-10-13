/**
 * Zod Schemas for Metadata Validation
 * Provides runtime validation for JSON metadata fields
 * Complements TypeScript types in src/types/metadata.types.ts
 */

import { z } from "zod";

// =========================
// Credit Transaction Metadata Schemas
// =========================

/**
 * Schema for payment credit transaction metadata
 */
export const PaymentCreditMetadataSchema = z
  .object({
    paymentIntentId: z.string().min(1),
    customerId: z.string().optional(),
    status: z.enum(["pending", "completed", "failed", "refunded"]),
    refundedAt: z.string().datetime().optional(),
    refundReason: z.string().optional(),
  })
  .catchall(z.unknown()); // Allow additional flexible fields

export type PaymentCreditMetadata = z.infer<typeof PaymentCreditMetadataSchema>;

/**
 * Schema for subscription credit transaction metadata
 */
export const SubscriptionCreditMetadataSchema = z.object({
  subscriptionId: z.string().min(1),
  invoiceId: z.string().optional(),
  paymentIntentId: z.string().optional(),
  status: z.enum(["pending", "completed", "failed"]),
});

export type SubscriptionCreditMetadata = z.infer<typeof SubscriptionCreditMetadataSchema>;

/**
 * Schema for AI usage credit transaction metadata
 */
export const AiUsageCreditMetadataSchema = z.object({
  sessionId: z.string().min(1),
  messageId: z.string().optional(),
  modelCode: z.string().optional(),
  tokensUsed: z.number().int().nonnegative().optional(),
  requestTimestamp: z.string().datetime().optional(),
});

export type AiUsageCreditMetadata = z.infer<typeof AiUsageCreditMetadataSchema>;

/**
 * Schema for purchase metadata (used in billing-actions.ts)
 */
export const PurchaseMetadataSchema = z.object({
  paymentIntentId: z.string().min(1),
  customerId: z.string().optional(),
  packageType: z.enum(["starter", "regular", "premium"]).optional(),
  creditsAmount: z.number().int().positive().optional(),
  priceUSD: z.number().positive().optional(),
  currency: z.string().default("usd"),
  timestamp: z.string().datetime().optional(),
});

export type PurchaseMetadata = z.infer<typeof PurchaseMetadataSchema>;

/**
 * Schema for refund metadata
 */
export const RefundMetadataSchema = z.object({
  paymentIntentId: z.string().min(1),
  refundId: z.string().min(1),
  reason: z.string().optional(),
  refundedAt: z.string().datetime(),
  originalTransactionId: z.string().optional(),
});

export type RefundMetadata = z.infer<typeof RefundMetadataSchema>;

/**
 * Union schema for all credit transaction metadata types
 */
export const CreditTransactionMetadataSchema = z.union([
  PaymentCreditMetadataSchema,
  SubscriptionCreditMetadataSchema,
  AiUsageCreditMetadataSchema,
  PurchaseMetadataSchema,
  RefundMetadataSchema,
  z.record(z.string(), z.unknown()), // Fallback for custom metadata
]);

export type CreditTransactionMetadata = z.infer<typeof CreditTransactionMetadataSchema>;

// =========================
// Session Metadata Schemas
// =========================

/**
 * Schema for token usage tracking in sessions
 */
export const TokenUsageSchema = z.object({
  type: z.literal("completion"),
  model: z.string(),
  mode: z.enum(["paid", "free"]),
  usage: z.object({
    prompt_tokens: z.number().int().nonnegative(),
    completion_tokens: z.number().int().nonnegative(),
    total_tokens: z.number().int().nonnegative(),
  }),
  timestamp: z.string().datetime(),
  version: z.string(),
  costUSD: z.number().nonnegative(),
});

export type TokenUsage = z.infer<typeof TokenUsageSchema>;

/**
 * Schema for session metadata (non-sensitive)
 */
export const SessionMetadataSchema = z.object({
  messageCount: z.number().int().nonnegative().default(0),
  creditsUsed: z.number().int().nonnegative().default(0),
  tokenCount: z.number().int().nonnegative().default(0),
  costUSD: z.number().nonnegative().default(0),
  lastActiveAt: z.string().datetime().optional(),
  activeDurationMs: z.number().int().nonnegative().optional(),
  tokenUsage: z.array(TokenUsageSchema).default([]),
});

export type SessionMetadata = z.infer<typeof SessionMetadataSchema>;

// =========================
// User Metadata Schemas
// =========================

/**
 * Schema for notification preferences
 */
export const NotificationPreferencesSchema = z.object({
  email: z.boolean().optional(),
  push: z.boolean().optional(),
  sms: z.boolean().optional(),
});

/**
 * Schema for user profile metadata
 */
export const UserProfileMetadataSchema = z.object({
  onboardingCompletedAt: z.string().datetime().optional(),
  preferredTheme: z.enum(["light", "dark", "auto"]).optional(),
  notificationPreferences: NotificationPreferencesSchema.optional(),
  lastSeenAt: z.string().datetime().optional(),
  timezone: z.string().optional(),
});

export type UserProfileMetadata = z.infer<typeof UserProfileMetadataSchema>;

// =========================
// Data Export Metadata Schemas
// =========================

/**
 * Schema for data export request metadata
 */
export const DataExportMetadataSchema = z.object({
  format: z.enum(["json", "csv", "pdf"]).default("json"),
  includeMessages: z.boolean().default(true),
  includeSessions: z.boolean().default(true),
  includeProfile: z.boolean().default(true),
  includeTransactions: z.boolean().default(true),
  dateRange: z
    .object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    })
    .optional(),
  requestedAt: z.string().datetime(),
  requestedBy: z.string().min(1),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type DataExportMetadata = z.infer<typeof DataExportMetadataSchema>;

// =========================
// Audit Log Metadata Schemas
// =========================

/**
 * Schema for audit log metadata
 */
export const AuditLogMetadataSchema = z
  .object({
    endpoint: z.string().optional(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    role: z.string().optional(),
    model: z.string().optional(),
    vendor: z.string().optional(),
    promptTokens: z.number().int().nonnegative().optional(),
    completionTokens: z.number().int().nonnegative().optional(),
    totalTokens: z.number().int().nonnegative().optional(),
    responseLength: z.number().int().nonnegative().optional(),
    errorCode: z.string().optional(),
    promptIndex: z.number().int().nonnegative().optional(),
    attempts: z.number().int().positive().optional(),
    maxRetries: z.number().int().positive().optional(),
    reason: z.string().optional(),
  })
  .catchall(z.unknown()); // Allow additional flexible fields

export type AuditLogMetadata = z.infer<typeof AuditLogMetadataSchema>;

// =========================
// Notification Metadata Schemas
// =========================

/**
 * Schema for notification metadata
 */
export const NotificationMetadataSchema = z.object({
  actionUrl: z.string().url().optional(),
  actionLabel: z.string().optional(),
  relatedEntityId: z.string().optional(),
  relatedEntityType: z.enum(["session", "transaction", "subscription", "user"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  expiresAt: z.string().datetime().optional(),
});

export type NotificationMetadata = z.infer<typeof NotificationMetadataSchema>;

// =========================
// Validation Helpers
// =========================

/**
 * Safely parse and validate metadata with Zod schema
 * Returns validated data or null if validation fails
 */
export function validateMetadata<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  options?: { throwOnError?: boolean }
): T | null {
  const result = schema.safeParse(data);

  if (result.success) {
    return result.data;
  }

  if (options?.throwOnError) {
    throw new Error(`Metadata validation failed: ${result.error.message}`);
  }

  return null;
}

/**
 * Validate metadata with default fallback
 * Always returns valid data (either validated or default)
 */
export function validateMetadataWithDefault<T>(schema: z.ZodSchema<T>, data: unknown, defaultValue: T): T {
  const result = schema.safeParse(data);
  return result.success ? result.data : defaultValue;
}

/**
 * Partial validation - validates only provided fields
 * Useful for partial updates
 */
export function validatePartialMetadata<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  data: unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const partialSchema = schema.partial();
  const result = partialSchema.safeParse(data);
  return result.success ? result.data : null;
}
