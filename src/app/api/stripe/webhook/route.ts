/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for payment processing, refunds,
 * and subscription management.
 */

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { processSuccessfulPayment } from "@/app/actions/billing-actions";
import {
  allocateSubscriptionCredits,
  cancelSubscription,
  createSubscription,
  updateSubscriptionStatus,
} from "@/app/actions/subscription-actions";
import { STRIPE_CONFIG, WEBHOOK_CONFIG } from "@/lib/billing/billing-config";
import { getStripeServer } from "@/lib/billing/stripe-client";
import {
  InvoiceEvent,
  PaymentIntentEvent,
  SubscriptionEvent,
  // StripeWebhookEvent, // TODO: Add support for additional webhook event types
} from "@/lib/billing/stripe-webhook-types";
import { findPurchaseTransactionsByPaymentIntents } from "@/lib/billing/transaction-queries";
import { logger } from "@/lib/logging/unified-logger";
import {
  notifyPaymentFailure,
  notifyPaymentSuccess,
  notifySubscriptionCreated,
} from "@/lib/notifications/email-service";
import { rateLimiter } from "@/lib/rate-limiting/rate-limiter";
import { PaymentCreditMetadataSchema, validateMetadataWithDefault } from "@/lib/zod/metadata.schema";

// =========================
// Payment Event Handlers
// =========================

async function handlePaymentSucceeded(event: PaymentIntentEvent): Promise<void> {
  try {
    const paymentIntent = event.data.object;

    await logger.logInfo("Processing successful payment", {
      operation: "handle_payment_succeeded",
      userId: paymentIntent.metadata?.userId,
      metadata: {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
      },
    });

    // Process the payment and add credits
    const result = await processSuccessfulPayment(paymentIntent.id);

    if (result.error) {
      await logger.logWarning("Failed to process successful payment from webhook", {
        operation: "handle_payment_succeeded",
        metadata: {
          paymentIntentId: paymentIntent.id,
          errorCode: result.error.code,
          error: result.error.message,
        },
      });
      return;
    }

    const data = result.data;

    await logger.logInfo("Payment processed successfully from webhook", {
      operation: "handle_payment_succeeded",
      metadata: {
        paymentIntentId: paymentIntent.id,
        creditsAdded: data.creditsAdded,
        newBalance: data.newBalance,
      },
    });

    // Send success notification email
    const customerEmail = (paymentIntent.customer as any)?.email || paymentIntent.metadata?.userEmail;
    if (customerEmail) {
      const userName = (paymentIntent.customer as any)?.name || "Valued Customer";

      await notifyPaymentSuccess(
        customerEmail,
        userName,
        data.creditsAdded || 0,
        paymentIntent.amount,
        paymentIntent.metadata?.userId
      );
    }
  } catch (error) {
    await logger.logWarning("Error handling payment succeeded webhook", {
      operation: "handle_payment_succeeded",
      metadata: {
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}

async function handlePaymentFailed(event: PaymentIntentEvent): Promise<void> {
  try {
    const paymentIntent = event.data.object;

    await logger.logWarning("Payment failed", {
      operation: "handle_payment_failed",
      userId: paymentIntent.metadata?.userId,
      metadata: {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        lastPaymentError: paymentIntent.last_payment_error?.message,
      },
    });

    // Update transaction status to failed using optimized query
    const { prisma } = await import("@/lib/prisma");

    // Find relevant transactions using optimized query
    const relevantTransactions = await findPurchaseTransactionsByPaymentIntents([paymentIntent.id]);

    for (const transaction of relevantTransactions) {
      // Validate existing metadata or use default
      const existingMetadata = validateMetadataWithDefault(PaymentCreditMetadataSchema, transaction.metadata, {
        paymentIntentId: paymentIntent.id,
        status: "pending",
      });

      // Create updated metadata with validation
      const updatedMetadata = validateMetadataWithDefault(
        PaymentCreditMetadataSchema,
        {
          ...existingMetadata,
          status: "failed" as const,
          refundReason: paymentIntent.last_payment_error?.message || "Unknown error",
          refundedAt: new Date().toISOString(),
        },
        {
          paymentIntentId: paymentIntent.id,
          status: "failed",
        }
      );

      await prisma.creditTransaction.update({
        where: { id: transaction.id },
        data: { metadata: updatedMetadata as any },
      });
    }

    // Send failure notification email
    const customerEmail = (paymentIntent.customer as any)?.email || paymentIntent.metadata?.userEmail;
    if (customerEmail) {
      const userName = (paymentIntent.customer as any)?.name || "Valued Customer";
      const failureReason = paymentIntent.last_payment_error?.message || "Payment could not be processed";

      await notifyPaymentFailure(customerEmail, userName, failureReason, paymentIntent.metadata?.userId);
    }
  } catch (error) {
    await logger.logWarning("Error handling payment failed webhook", {
      operation: "handle_payment_failed",
      metadata: {
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}

// =========================
// Invoice Event Handlers
// =========================

async function handleInvoicePaymentSucceeded(event: InvoiceEvent): Promise<void> {
  try {
    const invoice = event.data.object;

    await logger.logInfo("Invoice payment succeeded", {
      operation: "handle_invoice_payment_succeeded",
      metadata: {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        amount: invoice.amount_paid,
      },
    });

    // Handle subscription renewals - allocate credits
    if (invoice.subscription) {
      const { prisma } = await import("@/lib/prisma");
      const subscription = await prisma.subscription.findUnique({
        where: { stripeId: invoice.subscription as string },
      });

      if (subscription) {
        await allocateSubscriptionCredits(
          subscription.id,
          subscription.userId,
          subscription.creditsPerPeriod,
          invoice.id,
          invoice.payment_intent as string
        );
      }
    }
  } catch (error) {
    await logger.logWarning("Error handling invoice payment succeeded webhook", {
      operation: "handle_invoice_payment_succeeded",
      metadata: {
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}

async function handleInvoicePaymentFailed(event: InvoiceEvent): Promise<void> {
  try {
    const invoice = event.data.object;

    await logger.logWarning("Invoice payment failed", {
      operation: "handle_invoice_payment_failed",
      metadata: {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        amount: invoice.amount_due,
      },
    });

    // Handle subscription payment failures - suspend subscription
    if (invoice.subscription) {
      await updateSubscriptionStatus(invoice.subscription as string, "past_due");
    }
  } catch (error) {
    await logger.logWarning("Error handling invoice payment failed webhook", {
      operation: "handle_invoice_payment_failed",
      metadata: {
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}

// =========================
// Subscription Event Handlers
// =========================

async function handleSubscriptionCreated(event: SubscriptionEvent): Promise<void> {
  try {
    const subscription = event.data.object;

    await logger.logInfo("Subscription created", {
      operation: "handle_subscription_created",
      metadata: {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status,
      },
    });

    // Create subscription record in database
    const metadata = subscription.metadata || {};
    const userId = metadata.userId;

    if (userId && subscription.items.data[0]) {
      const priceItem = subscription.items.data[0];
      const creditsPerPeriod = parseInt(metadata.creditsPerPeriod || "0");

      await createSubscription(
        subscription.id,
        subscription.customer as string,
        userId,
        priceItem.price.id,
        creditsPerPeriod,
        priceItem.price.unit_amount || 0,
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000)
      );

      // Send welcome email
      const userEmail = (subscription.customer as any)?.email || metadata.userEmail;
      const userName = (subscription.customer as any)?.name || "Valued Customer";
      if (userEmail) {
        await notifySubscriptionCreated(
          userEmail,
          userName,
          priceItem.price.nickname || "Subscription",
          creditsPerPeriod,
          userId
        );
      }
    }
  } catch (error) {
    await logger.logWarning("Error handling subscription created webhook", {
      operation: "handle_subscription_created",
      metadata: {
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}

async function handleSubscriptionUpdated(event: SubscriptionEvent): Promise<void> {
  try {
    const subscription = event.data.object;

    await logger.logInfo("Subscription updated", {
      operation: "handle_subscription_updated",
      metadata: {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        status: subscription.status,
      },
    });

    // Update subscription status and period
    await updateSubscriptionStatus(
      subscription.id,
      subscription.status as any,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000)
    );
  } catch (error) {
    await logger.logWarning("Error handling subscription updated webhook", {
      operation: "handle_subscription_updated",
      metadata: {
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}

async function handleSubscriptionDeleted(event: SubscriptionEvent): Promise<void> {
  try {
    const subscription = event.data.object;

    await logger.logInfo("Subscription deleted", {
      operation: "handle_subscription_deleted",
      metadata: {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
      },
    });

    // Handle subscription cancellation
    await cancelSubscription(subscription.id, true);
  } catch (error) {
    await logger.logWarning("Error handling subscription deleted webhook", {
      operation: "handle_subscription_deleted",
      metadata: {
        eventId: event.id,
        error: error instanceof Error ? error.message : String(error),
      },
    });
    throw error;
  }
}

// =========================
// Configuration
// =========================

// Required for Next.js API routes to handle raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

// =========================
// Event Processing
// =========================

async function processWebhookEvent(event: PaymentIntentEvent | InvoiceEvent | SubscriptionEvent): Promise<void> {
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSucceeded(event as PaymentIntentEvent);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentFailed(event as PaymentIntentEvent);
      break;

    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event as InvoiceEvent);
      break;

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event as InvoiceEvent);
      break;

    case "customer.subscription.created":
      await handleSubscriptionCreated(event as SubscriptionEvent);
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event as SubscriptionEvent);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event as SubscriptionEvent);
      break;

    default:
      // This should never happen since we filter events before processing
      // But if it does, silently ignore
      break;
  }
}

// =========================
// Webhook Handler
// =========================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: Check webhook request rate to prevent DoS
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "stripe-webhook";
    const rateLimit = rateLimiter.checkLimit(ip, "WEBHOOK_REQUESTS");

    if (!rateLimit.success) {
      await logger.logWarning("Stripe webhook rate limit exceeded", {
        operation: "stripe_webhook_rate_limit",
        metadata: { ip, resetTime: rateLimit.resetTime },
      });
      return NextResponse.json({ error: "Rate limit exceeded", resetTime: rateLimit.resetTime }, { status: 429 });
    }

    // Get request body and signature
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      await logger.logWarning("Missing Stripe signature", {
        operation: "stripe_webhook_handler",
      });
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const stripe = getStripeServer();
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret);
    } catch {
      await logger.logWarning("Stripe webhook signature verification failed", {
        operation: "stripe_webhook_verification",
        metadata: {
          signature: signature.substring(0, 20) + "...", // Log partial signature for debugging
        },
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Check if we handle this event type
    if (!WEBHOOK_CONFIG.handledEvents.includes(event.type as any)) {
      // Silently ignore unhandled event types (expected behavior)
      // Common unhandled events: payment_intent.created, charge.succeeded, charge.updated
      return NextResponse.json({ received: true, handled: false });
    }

    await logger.logInfo(`Processing Stripe webhook: ${event.type}`, {
      operation: "stripe_webhook_handler",
      metadata: {
        eventType: event.type,
        eventId: event.id,
      },
    });

    // Process the event
    await processWebhookEvent(event as PaymentIntentEvent | InvoiceEvent | SubscriptionEvent);

    return NextResponse.json({ received: true, handled: true });
  } catch (error) {
    await logger.logWarning("Stripe webhook handler failed", {
      operation: "stripe_webhook_handler",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
