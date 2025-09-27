import { z } from "zod";

import { ERROR_CODES } from "@/lib/errors";

/**
 * Schema for credit transaction types
 */
export const CreditTransactionTypeSchema = z.enum(["CREDIT", "DEBIT"]);

/**
 * Schema for credit transaction reasons
 */
export const CreditTransactionReasonSchema = z.enum([
  "ai_usage",
  "purchase",
  "bonus",
  "refund",
  "adjustment",
  "trial_credits",
  "referral_bonus",
]);

/**
 * Schema for user authentication ID validation
 */
export const AuthIdSchema = z.string().uuid({ message: ERROR_CODES.VALIDATION_UUID_INVALID });

/**
 * Schema for credit amounts (always positive integers)
 */
export const CreditAmountSchema = z
  .number({ message: ERROR_CODES.VALIDATION_NUMBER_INVALID })
  .int()
  .min(1, { message: ERROR_CODES.VALIDATION_NUMBER_TOO_SMALL });

/**
 * Schema for session ID validation
 */
export const SessionIdSchema = z.string().uuid({ message: ERROR_CODES.VALIDATION_UUID_INVALID }).optional();

/**
 * Schema for adding credits
 */
export const AddCreditsSchema = z.object({
  authId: AuthIdSchema,
  amount: CreditAmountSchema,
  reason: CreditTransactionReasonSchema,
  sessionId: SessionIdSchema.nullish(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Schema for deducting credits
 */
export const DeductCreditsSchema = z.object({
  authId: AuthIdSchema,
  amount: CreditAmountSchema,
  reason: CreditTransactionReasonSchema,
  sessionId: SessionIdSchema.nullish(),
  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Schema for AI message cost calculation
 */
export const AiMessageCostSchema = z.object({
  modelCode: z.string().min(1, { message: ERROR_CODES.VALIDATION_STRING_TOO_SHORT }),
  usage: z.object({
    prompt_tokens: z
      .number({ message: ERROR_CODES.VALIDATION_NUMBER_INVALID })
      .int()
      .min(0, { message: ERROR_CODES.VALIDATION_NUMBER_TOO_SMALL }),
    completion_tokens: z
      .number({ message: ERROR_CODES.VALIDATION_NUMBER_INVALID })
      .int()
      .min(0, { message: ERROR_CODES.VALIDATION_NUMBER_TOO_SMALL }),
    total_tokens: z
      .number({ message: ERROR_CODES.VALIDATION_NUMBER_INVALID })
      .int()
      .min(0, { message: ERROR_CODES.VALIDATION_NUMBER_TOO_SMALL }),
  }),
});

/**
 * Schema for credit transaction query filters
 */
export const CreditTransactionFiltersSchema = z.object({
  authId: AuthIdSchema,
  type: CreditTransactionTypeSchema.optional(),
  reason: CreditTransactionReasonSchema.optional(),
  sessionId: SessionIdSchema.nullish(),
  limit: z
    .number({ message: ERROR_CODES.VALIDATION_NUMBER_INVALID })
    .int()
    .min(1, { message: ERROR_CODES.VALIDATION_NUMBER_TOO_SMALL })
    .max(1000, { message: ERROR_CODES.VALIDATION_NUMBER_TOO_LARGE })
    .optional()
    .default(100),
  offset: z
    .number({ message: ERROR_CODES.VALIDATION_NUMBER_INVALID })
    .int()
    .min(0, { message: ERROR_CODES.VALIDATION_NUMBER_TOO_SMALL })
    .optional()
    .default(0),
});

export type CreditTransactionTypeSchemaType = z.infer<typeof CreditTransactionTypeSchema>;
export type CreditTransactionReasonSchemaType = z.infer<typeof CreditTransactionReasonSchema>;
export type AuthIdSchemaType = z.infer<typeof AuthIdSchema>;
export type CreditAmountSchemaType = z.infer<typeof CreditAmountSchema>;
export type AddCreditsSchemaType = z.infer<typeof AddCreditsSchema>;
export type DeductCreditsSchemaType = z.infer<typeof DeductCreditsSchema>;
export type AiMessageCostSchemaType = z.infer<typeof AiMessageCostSchema>;
export type CreditTransactionFiltersSchemaType = z.infer<typeof CreditTransactionFiltersSchema>;
