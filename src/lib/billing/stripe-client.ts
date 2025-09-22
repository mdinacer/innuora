/**
 * Stripe Client Configuration
 *
 * Handles Stripe initialization and provides type-safe client instances
 * for both server-side and client-side operations.
 */

import { type StripeError } from "@stripe/stripe-js";
import Stripe from "stripe";

import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { STRIPE_CONFIG } from "./billing-config";

// =========================
// Server-side Stripe Client
// =========================

let stripeServerInstance: Stripe | null = null;

/**
 * Get server-side Stripe instance (singleton pattern)
 */
export function getStripeServer(): Stripe {
  if (!stripeServerInstance) {
    if (!STRIPE_CONFIG.secretKey) {
      logger.logErrorAndThrow(
        ERROR_CODES.BILLING_CONFIG_INVALID,
        new Error("Stripe secret key is not configured. Please set STRIPE_SECRET_KEY environment variable."),
        {
          operation: "stripe_server_init",
          metadata: { configKey: "STRIPE_SECRET_KEY" },
        }
      );
    }

    stripeServerInstance = new Stripe(STRIPE_CONFIG.secretKey, {
      apiVersion: STRIPE_CONFIG.apiVersion,
      typescript: true,
    });
  }

  return stripeServerInstance;
}

// =========================
// Client-side Stripe Configuration
// =========================

/**
 * Get Stripe publishable key for client-side use
 */
export function getStripePublishableKey(): string {
  if (!STRIPE_CONFIG.publishableKey) {
    logger.logErrorAndThrow(
      ERROR_CODES.BILLING_CONFIG_INVALID,
      new Error(
        "Stripe publishable key is not configured. Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable."
      ),
      {
        operation: "stripe_get_publishable_key",
        metadata: { configKey: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" },
      }
    );
  }

  return STRIPE_CONFIG.publishableKey;
}

// =========================
// Stripe Configuration Validation
// =========================

/**
 * Validate that all required Stripe configuration is present
 */
export function validateStripeConfig(): {
  isValid: boolean;
  missingKeys: string[];
  errors: string[];
} {
  const missingKeys: string[] = [];
  const errors: string[] = [];

  // Check server-side keys
  if (!STRIPE_CONFIG.secretKey) {
    missingKeys.push("STRIPE_SECRET_KEY");
  }

  // Check client-side keys
  if (!STRIPE_CONFIG.publishableKey) {
    missingKeys.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  }

  // Check webhook configuration
  if (!STRIPE_CONFIG.webhookSecret) {
    missingKeys.push("STRIPE_WEBHOOK_SECRET");
  }

  // Validate key formats
  if (STRIPE_CONFIG.secretKey && !STRIPE_CONFIG.secretKey.startsWith("sk_")) {
    errors.push("STRIPE_SECRET_KEY must start with 'sk_'");
  }

  if (STRIPE_CONFIG.publishableKey && !STRIPE_CONFIG.publishableKey.startsWith("pk_")) {
    errors.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with 'pk_'");
  }

  if (STRIPE_CONFIG.webhookSecret && !STRIPE_CONFIG.webhookSecret.startsWith("whsec_")) {
    errors.push("STRIPE_WEBHOOK_SECRET must start with 'whsec_'");
  }

  return {
    isValid: missingKeys.length === 0 && errors.length === 0,
    missingKeys,
    errors,
  };
}

// =========================
// Common Stripe Operations
// =========================

/**
 * Create a payment intent with Mirael-specific configuration
 */
export async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  userId: string;
  productKey: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeServer();

  return await stripe.paymentIntents.create({
    amount: params.amount,
    currency: params.currency,
    payment_method_types: [...STRIPE_CONFIG.paymentMethods],
    metadata: {
      userId: params.userId,
      productKey: params.productKey,
      app: "mirael",
      timestamp: new Date().toISOString(),
      ...params.metadata,
    },
    description: `Mirael Credit Purchase - ${params.productKey}`,
  });
}

/**
 * Retrieve a payment intent
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeServer();
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Create or retrieve a Stripe customer
 */
export async function createOrGetCustomer(params: {
  userId: string;
  email?: string;
  name?: string;
}): Promise<Stripe.Customer> {
  const stripe = getStripeServer();

  // First, try to find existing customer
  const existingCustomers = await stripe.customers.list({
    email: params.email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      userId: params.userId,
      app: "mirael",
    },
  });
}

/**
 * Refund a payment
 */
export async function refundPayment(params: {
  paymentIntentId: string;
  amount?: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
  metadata?: Record<string, string>;
}): Promise<Stripe.Refund> {
  const stripe = getStripeServer();

  return await stripe.refunds.create({
    payment_intent: params.paymentIntentId,
    amount: params.amount,
    reason: params.reason,
    metadata: {
      app: "mirael",
      timestamp: new Date().toISOString(),
      ...params.metadata,
    },
  });
}

// =========================
// Error Handling
// =========================

/**
 * Check if error is a Stripe error and extract relevant information
 */
export function isStripeError(error: unknown): error is StripeError {
  return error instanceof Error && "type" in error && "code" in error;
}

/**
 * Get user-friendly error message from Stripe error
 */
export function getStripeErrorMessage(error: StripeError): string {
  switch (error.code) {
    case "card_declined":
      return "Your card was declined. Please try a different payment method.";
    case "insufficient_funds":
      return "Insufficient funds. Please try a different payment method.";
    case "expired_card":
      return "Your card has expired. Please try a different payment method.";
    case "incorrect_cvc":
      return "The security code is incorrect. Please check and try again.";
    case "processing_error":
      return "A processing error occurred. Please try again.";
    case "rate_limit":
      return "Too many requests. Please wait a moment and try again.";
    default:
      return error.message || "An unexpected payment error occurred.";
  }
}

// =========================
// Type Exports
// =========================

export type { Stripe };
export type PaymentIntent = Stripe.PaymentIntent;
export type Customer = Stripe.Customer;
export type Refund = Stripe.Refund;
