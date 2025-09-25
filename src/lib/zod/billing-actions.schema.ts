import { z } from "zod";

/**
 * Schema for payment amounts (in cents)
 */
export const PaymentAmountSchema = z
  .number()
  .int()
  .min(100, "Minimum payment is $1.00")
  .max(100000, "Maximum payment is $1000.00");

/**
 * Schema for currency codes
 */
export const CurrencySchema = z.enum(["usd", "eur", "gbp", "cad"]).default("usd");

/**
 * Schema for payment methods
 */
export const PaymentMethodSchema = z.enum(["card", "bank_transfer", "paypal"]).default("card");

/**
 * Schema for Stripe payment intent creation
 */
export const CreatePaymentIntentSchema = z.object({
  authId: z.uuid("Invalid authentication ID format"),
  amount: PaymentAmountSchema,
  currency: CurrencySchema,
  credits: z.number().int().min(100, "Minimum 100 credits").max(50000, "Maximum 50000 credits"),
  paymentMethod: PaymentMethodSchema,
  description: z.string().min(1).max(200).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

/**
 * Schema for payment confirmation
 */
export const ConfirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  authId: z.uuid("Invalid authentication ID format"),
  expectedAmount: PaymentAmountSchema,
  expectedCredits: z.number().int().min(100).max(50000),
});

/**
 * Schema for Stripe webhook processing
 */
export const StripeWebhookSchema = z.object({
  type: z.string().min(1, "Webhook type is required"),
  data: z.object({
    object: z.record(z.string(), z.any()),
  }),
  id: z.string().min(1, "Webhook ID is required"),
  created: z.number().int().min(0),
  api_version: z.string().optional(),
});

/**
 * Schema for refund requests
 */
export const RefundRequestSchema = z.object({
  authId: z.uuid("Invalid authentication ID format"),
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  amount: PaymentAmountSchema.optional(), // Partial refund if specified
  reason: z.enum(["duplicate", "fraudulent", "requested_by_customer", "technical_issue"]),
  description: z.string().max(500).optional(),
});

/**
 * Schema for payment history queries
 */
export const PaymentHistoryQuerySchema = z.object({
  authId: z.uuid("Invalid authentication ID format"),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
  status: z.enum(["succeeded", "pending", "failed", "refunded"]).optional(),
});

/**
 * Schema for subscription management (future use)
 */
export const SubscriptionSchema = z.object({
  authId: z.uuid("Invalid authentication ID format"),
  planId: z.string().min(1, "Plan ID is required"),
  priceId: z.string().min(1, "Price ID is required"),
  paymentMethodId: z.string().min(1, "Payment method ID is required"),
});

export type PaymentAmountSchemaType = z.infer<typeof PaymentAmountSchema>;
export type CurrencySchemaType = z.infer<typeof CurrencySchema>;
export type PaymentMethodSchemaType = z.infer<typeof PaymentMethodSchema>;
export type CreatePaymentIntentSchemaType = z.infer<typeof CreatePaymentIntentSchema>;
export type ConfirmPaymentSchemaType = z.infer<typeof ConfirmPaymentSchema>;
export type StripeWebhookSchemaType = z.infer<typeof StripeWebhookSchema>;
export type RefundRequestSchemaType = z.infer<typeof RefundRequestSchema>;
export type PaymentHistoryQuerySchemaType = z.infer<typeof PaymentHistoryQuerySchema>;
export type SubscriptionSchemaType = z.infer<typeof SubscriptionSchema>;
