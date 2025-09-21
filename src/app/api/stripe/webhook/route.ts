/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for payment processing, refunds,
 * and subscription management.
 */

import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { processSuccessfulPayment } from "@/app/actions/billing-actions";
import { STRIPE_CONFIG, WEBHOOK_CONFIG } from "@/lib/billing/billing-config";
import { getStripeServer } from "@/lib/billing/stripe-client";
import { logger } from "@/lib/logging/unified-logger";

// =========================
// Payment Event Handlers
// =========================

async function handlePaymentSucceeded(event: any): Promise<void> {
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

    if (!result.success) {
      await logger.logWarning("Failed to process successful payment from webhook", {
        operation: "handle_payment_succeeded",
        metadata: {
          paymentIntentId: paymentIntent.id,
          errorCode: result.errorCode,
          error: result.error,
        },
      });
      return;
    }

    await logger.logInfo("Payment processed successfully from webhook", {
      operation: "handle_payment_succeeded",
      metadata: {
        paymentIntentId: paymentIntent.id,
        creditsAdded: result.creditsAdded,
        newBalance: result.newBalance,
      },
    });
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

async function handlePaymentFailed(event: any): Promise<void> {
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

    // Update transaction status to failed
    const { prisma } = await import("@/lib/prisma");

    // Find and update the relevant transaction
    const transactionsToUpdate = await prisma.creditTransaction.findMany({
      where: {
        reason: "credit_purchase",
      },
    });

    const relevantTransactions = transactionsToUpdate.filter(
      (tx) => (tx.metadata as any)?.paymentIntentId === paymentIntent.id
    );

    for (const transaction of relevantTransactions) {
      await prisma.creditTransaction.update({
        where: { id: transaction.id },
        data: {
          metadata: {
            ...(transaction.metadata as any),
            status: "failed",
            failureReason: paymentIntent.last_payment_error?.message || "Unknown error",
            failedAt: new Date().toISOString(),
          },
        },
      });
    }

    // TODO: Send notification to user about failed payment
    // TODO: Optionally retry payment or suggest alternative payment method
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

async function handleInvoicePaymentSucceeded(event: any): Promise<void> {
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

    // Handle subscription renewals here
    // TODO: Implement subscription credit allocation
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

async function handleInvoicePaymentFailed(event: any): Promise<void> {
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

    // Handle subscription payment failures
    // TODO: Implement subscription suspension logic
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

async function handleSubscriptionCreated(event: any): Promise<void> {
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

    // TODO: Implement subscription management
    // - Create subscription record in database
    // - Set up recurring credit allocation
    // - Send welcome email
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

async function handleSubscriptionUpdated(event: any): Promise<void> {
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

    // TODO: Handle subscription changes
    // - Update subscription record
    // - Adjust credit allocation
    // - Handle plan upgrades/downgrades
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

async function handleSubscriptionDeleted(event: any): Promise<void> {
  try {
    const subscription = event.data.object;

    await logger.logInfo("Subscription deleted", {
      operation: "handle_subscription_deleted",
      metadata: {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
      },
    });

    // TODO: Handle subscription cancellation
    // - Update subscription record
    // - Stop recurring credit allocation
    // - Send cancellation confirmation
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

async function processWebhookEvent(event: any): Promise<void> {
  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSucceeded(event);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentFailed(event);
      break;

    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event);
      break;

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event);
      break;

    case "customer.subscription.created":
      await handleSubscriptionCreated(event);
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event);
      break;

    default:
      await logger.logWarning(`Unhandled event type in processor: ${event.type}`, {
        operation: "stripe_webhook_processor",
        metadata: {
          eventType: event.type,
          eventId: event.id,
        },
      });
  }
}

// =========================
// Webhook Handler
// =========================

export async function POST(request: NextRequest) {
  try {
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
      await logger.logWarning(`Unhandled webhook event type: ${event.type}`, {
        operation: "stripe_webhook_handler",
        metadata: {
          eventType: event.type,
          eventId: event.id,
        },
      });
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
    await processWebhookEvent(event);

    return NextResponse.json({ received: true, handled: true });
  } catch (error) {
    await logger.logWarning("Stripe webhook handler failed", {
      operation: "stripe_webhook_handler",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
