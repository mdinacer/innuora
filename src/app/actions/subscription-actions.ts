"use server";

import { addCreditsToUser } from "@/app/actions/credit-actions";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { notifySubscriptionCancelled } from "@/lib/notifications/email-service";
import { prisma } from "@/lib/prisma";
import { ActionResult } from "@/types/action-result";

/**
 * Create subscription record in database
 */
export async function createSubscription(
  stripeSubscriptionId: string,
  stripeCustomerId: string,
  userId: string,
  planId: string,
  creditsPerPeriod: number,
  priceAmountCents: number,
  currentPeriodStart: Date,
  currentPeriodEnd: Date
): Promise<ActionResult<{ subscriptionId: string }>> {
  return logger.wrapOperation(
    async () => {
      const subscription = await prisma.subscription.create({
        data: {
          stripeId: stripeSubscriptionId,
          customerId: stripeCustomerId,
          userId,
          planId,
          creditsPerPeriod,
          priceAmountCents,
          currentPeriodStart,
          currentPeriodEnd,
          status: "active",
        },
      });

      await logger.logInfo("Subscription created in database", {
        operation: "create_subscription",
        userId,
        metadata: {
          subscriptionId: subscription.id,
          stripeSubscriptionId,
          creditsPerPeriod,
        },
      });

      return { subscriptionId: subscription.id };
    },
    ERROR_CODES.SUBSCRIPTION_CREATE_FAILED,
    { operation: "create_subscription", userId }
  );
}

/**
 * Allocate credits for subscription renewal
 */
export async function allocateSubscriptionCredits(
  subscriptionId: string,
  userId: string,
  creditsToAllocate: number,
  invoiceId?: string,
  paymentIntentId?: string
): Promise<ActionResult<{ creditsAdded: number; newBalance: number }>> {
  return logger.wrapOperation(
    async () => {
      // Add credits to user
      const creditResult = await addCreditsToUser(userId, creditsToAllocate, "subscription_renewal", {
        subscriptionId,
        invoiceId,
        paymentIntentId,
        status: "completed",
      });

      if (creditResult.error) {
        throw new Error(creditResult.error.message);
      }

      // Record renewal in SubscriptionRenewal table
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (subscription) {
        await prisma.subscriptionRenewal.create({
          data: {
            subscriptionId,
            userId,
            periodStart: subscription.currentPeriodStart,
            periodEnd: subscription.currentPeriodEnd,
            creditsGranted: creditsToAllocate,
            amountPaidCents: subscription.priceAmountCents,
            invoiceId,
            paymentIntentId,
            status: "processed",
            processedAt: new Date(),
          },
        });
      }

      return {
        creditsAdded: creditsToAllocate,
        newBalance: creditResult.data?.newBalance || 0,
      };
    },
    ERROR_CODES.SUBSCRIPTION_CREDIT_ALLOCATION_FAILED,
    { operation: "allocate_subscription_credits", userId, metadata: { subscriptionId } }
  );
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  stripeSubscriptionId: string,
  status: "active" | "past_due" | "canceled" | "unpaid" | "paused" | "trialing" | "incomplete" | "incomplete_expired",
  currentPeriodStart?: Date,
  currentPeriodEnd?: Date
): Promise<ActionResult<{ updated: boolean }>> {
  return logger.wrapOperation(
    async () => {
      const subscription = await prisma.subscription.findUnique({
        where: { stripeId: stripeSubscriptionId },
      });

      if (!subscription) {
        throw new Error(`Subscription not found: ${stripeSubscriptionId}`);
      }

      await prisma.subscription.update({
        where: { stripeId: stripeSubscriptionId },
        data: {
          status,
          ...(currentPeriodStart && { currentPeriodStart }),
          ...(currentPeriodEnd && { currentPeriodEnd }),
        },
      });

      await logger.logInfo("Subscription status updated", {
        operation: "update_subscription_status",
        userId: subscription.userId,
        metadata: {
          subscriptionId: subscription.id,
          newStatus: status,
        },
      });

      return { updated: true };
    },
    ERROR_CODES.SUBSCRIPTION_UPDATE_FAILED,
    { operation: "update_subscription_status", metadata: { stripeSubscriptionId } }
  );
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  stripeSubscriptionId: string,
  cancelAtPeriodEnd: boolean = true
): Promise<ActionResult<{ cancelled: boolean }>> {
  return logger.wrapOperation(
    async () => {
      const subscription = await prisma.subscription.findUnique({
        where: { stripeId: stripeSubscriptionId },
        include: {
          user: {
            select: {
              authId: true,
              profile: {
                select: {
                  displayName: true,
                },
              },
            },
          },
        },
      });

      if (!subscription) {
        throw new Error(`Subscription not found: ${stripeSubscriptionId}`);
      }

      await prisma.subscription.update({
        where: { stripeId: stripeSubscriptionId },
        data: {
          status: "canceled",
          cancelAtPeriodEnd,
          canceledAt: new Date(),
        },
      });

      // Send cancellation notification
      const user = subscription.user;
      if (user) {
        // Get user email from auth system (placeholder - implement with your auth provider)
        const userEmail = "user@example.com"; // TODO: Get from auth provider
        const userName = user.profile?.displayName || "Valued Customer";

        await notifySubscriptionCancelled(userEmail, userName, subscription.planId, subscription.userId);
      }

      await logger.logInfo("Subscription cancelled", {
        operation: "cancel_subscription",
        userId: subscription.userId,
        metadata: {
          subscriptionId: subscription.id,
          cancelAtPeriodEnd,
        },
      });

      return { cancelled: true };
    },
    ERROR_CODES.SUBSCRIPTION_CANCEL_FAILED,
    { operation: "cancel_subscription", metadata: { stripeSubscriptionId } }
  );
}

/**
 * Get active subscription for user
 */
export async function getUserActiveSubscription(userId: string): Promise<ActionResult<any>> {
  return logger.wrapOperation(
    async () => {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: {
            in: ["active", "trialing"],
          },
        },
        include: {
          renewals: {
            orderBy: {
              createdAt: "desc",
            },
            take: 5,
          },
        },
      });

      return subscription;
    },
    ERROR_CODES.SUBSCRIPTION_FETCH_FAILED,
    { operation: "get_user_active_subscription", userId }
  );
}
