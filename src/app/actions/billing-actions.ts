"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/app/actions/auth-actions";
import { addCredits } from "@/app/actions/credit-actions";
import { BILLING_ERROR_CODES, BillingProductKey, BillingUtils, TRANSACTION_CONFIG } from "@/lib/billing/billing-config";
import {
  createOrGetCustomer,
  createPaymentIntent,
  getPaymentIntent,
  getStripeErrorMessage,
  isStripeError,
  refundPayment,
} from "@/lib/billing/stripe-client";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";

// =========================
// Types and Interfaces
// =========================

interface CreatePaymentIntentResult {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
  errorCode?: string;
}

interface ProcessPaymentResult {
  success: boolean;
  creditsAdded?: number;
  newBalance?: number;
  transactionId?: string;
  error?: string;
  errorCode?: string;
}

interface RefundPaymentResult {
  success: boolean;
  refundId?: string;
  creditsDeducted?: number;
  error?: string;
  errorCode?: string;
}

// =========================
// Payment Intent Creation
// =========================

/**
 * Create a Stripe payment intent for credit purchase
 */
export async function createCreditPurchaseIntent(
  productKey: BillingProductKey,
  userEmail?: string,
  userName?: string
): Promise<CreatePaymentIntentResult> {
  return await logger.wrapOperation(
    async () => {
      // Get current authenticated user
      const authUser = await requireCurrentUser();
      const authId = authUser.id;
      // Validate product
      const product = BillingUtils.getProduct(productKey);
      if (!product) {
        return {
          success: false,
          error: "Invalid product selected",
          errorCode: BILLING_ERROR_CODES.INVALID_PRODUCT,
        };
      }

      // Validate amount
      const amountCents = BillingUtils.dollarsToCents(product.price);
      if (!BillingUtils.isValidPurchaseAmount(amountCents)) {
        return {
          success: false,
          error: "Invalid purchase amount",
          errorCode: BILLING_ERROR_CODES.INVALID_AMOUNT,
        };
      }

      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { authId: authId },
        select: { id: true, creditsBalance: true },
      });

      if (!user) {
        return {
          success: false,
          error: "User not found",
          errorCode: BILLING_ERROR_CODES.USER_NOT_FOUND,
        };
      }

      // Check credit limits
      const totalCreditsAfterPurchase = user.creditsBalance + product.credits;
      if (totalCreditsAfterPurchase > TRANSACTION_CONFIG.limits.maxCreditsPerPurchase) {
        return {
          success: false,
          error: "Credit purchase would exceed maximum balance",
          errorCode: BILLING_ERROR_CODES.CREDIT_LIMIT_EXCEEDED,
        };
      }

      // Create or get Stripe customer
      let customer;
      try {
        customer = await createOrGetCustomer({
          userId: authId,
          email: userEmail,
          name: userName,
        });
      } catch (error) {
        logger.logErrorAndThrow(ERROR_CODES.BILLING_STRIPE_CUSTOMER_FAILED, error, {
          operation: "create_stripe_customer",
          userId: authId,
        });
        return {
          success: false,
          error: "Failed to create payment customer",
          errorCode: BILLING_ERROR_CODES.PAYMENT_FAILED,
        };
      }

      // Create payment intent
      try {
        const paymentIntent = await createPaymentIntent({
          amount: amountCents,
          currency: "usd",
          userId: authId,
          productKey,
          metadata: {
            credits: product.credits.toString(),
            customerId: customer.id,
          },
        });

        // Store payment intent in database for tracking
        await prisma.$transaction(async (tx) => {
          // Create a pending transaction record
          await tx.creditTransaction.create({
            data: {
              userId: user.id,
              type: "CREDIT",
              amount: product.credits,
              reason: TRANSACTION_CONFIG.reasons.PURCHASE,
              metadata: {
                paymentIntentId: paymentIntent.id,
                stripeCustomerId: customer.id,
                productKey,
                amountUSD: product.price,
                status: "pending",
              },
            },
          });
        });

        return {
          success: true,
          clientSecret: paymentIntent.client_secret!,
          paymentIntentId: paymentIntent.id,
        };
      } catch (error) {
        if (isStripeError(error)) {
          const message = getStripeErrorMessage(error);
          return {
            success: false,
            error: message,
            errorCode: BILLING_ERROR_CODES.PAYMENT_FAILED,
          };
        }

        await logger.logWarning("Failed to create payment intent", {
          operation: "create_payment_intent",
          userId: authId,
          metadata: { productKey },
        });

        return {
          success: false,
          error: "Failed to initialize payment",
          errorCode: BILLING_ERROR_CODES.PAYMENT_FAILED,
        };
      }
    },
    ERROR_CODES.BILLING_OPERATION_FAILED,
    {
      operation: "create_credit_purchase_intent",
      metadata: { productKey },
    },
    "Payment intent created successfully"
  );
}

// =========================
// Payment Processing
// =========================

/**
 * Process a successful payment and add credits to user account
 */
export async function processSuccessfulPayment(paymentIntentId: string): Promise<ProcessPaymentResult> {
  return await logger.wrapOperation(
    async () => {
      try {
        // Retrieve payment intent from Stripe
        const paymentIntent = await getPaymentIntent(paymentIntentId);

        if (paymentIntent.status !== "succeeded") {
          return {
            success: false,
            error: "Payment has not succeeded",
            errorCode: BILLING_ERROR_CODES.PAYMENT_FAILED,
          };
        }

        const userId = paymentIntent.metadata.userId;
        const productKey = paymentIntent.metadata.productKey as BillingProductKey;
        const credits = parseInt(paymentIntent.metadata.credits || "0");

        if (!userId || !productKey || !credits) {
          return {
            success: false,
            error: "Invalid payment metadata",
            errorCode: BILLING_ERROR_CODES.PAYMENT_FAILED,
          };
        }

        // Check if payment was already processed
        // Note: Simplified approach - check all purchase transactions and filter in memory
        // This is less efficient but more reliable than JSON queries
        const purchaseTransactions = await prisma.creditTransaction.findMany({
          where: {
            reason: TRANSACTION_CONFIG.reasons.PURCHASE,
          },
        });

        const existingTransaction = purchaseTransactions.find(
          (tx) => (tx.metadata as any)?.paymentIntentId === paymentIntentId
        );
        if (existingTransaction && (existingTransaction.metadata as any)?.status === "completed") {
          return {
            success: false,
            error: "Payment has already been processed",
            errorCode: BILLING_ERROR_CODES.PAYMENT_FAILED,
          };
        }

        // Process the payment in a transaction
        const result = await prisma.$transaction(async (tx) => {
          // Add credits to user account (userId here is already authId from payment metadata)
          const creditResult = await addCredits(userId, credits, TRANSACTION_CONFIG.reasons.PURCHASE, {
            paymentIntentId,
            productKey,
            stripeCustomerId: paymentIntent.customer as string,
            amountUSD: BillingUtils.centsToDollars(paymentIntent.amount),
            status: "completed",
          });

          // Update the pending transaction to completed
          if (existingTransaction) {
            await tx.creditTransaction.update({
              where: { id: existingTransaction.id },
              data: {
                metadata: {
                  ...(existingTransaction.metadata as any),
                  status: "completed",
                  processedAt: new Date().toISOString(),
                },
              },
            });
          }

          return creditResult;
        });

        // Revalidate user data
        revalidatePath("/[locale]/sessions", "layout");

        return {
          success: true,
          creditsAdded: credits,
          newBalance: result.newBalance,
          transactionId: result.transactionId,
        };
      } catch (error) {
        if (isStripeError(error)) {
          const message = getStripeErrorMessage(error);
          return {
            success: false,
            error: message,
            errorCode: BILLING_ERROR_CODES.PAYMENT_FAILED,
          };
        }

        await logger.logWarning("Failed to process successful payment", {
          operation: "process_successful_payment",
          metadata: { paymentIntentId },
        });

        return {
          success: false,
          error: "Failed to process payment",
          errorCode: BILLING_ERROR_CODES.PAYMENT_FAILED,
        };
      }
    },
    ERROR_CODES.BILLING_OPERATION_FAILED,
    {
      operation: "process_successful_payment",
      metadata: { paymentIntentId },
    },
    "Payment processed successfully"
  );
}

// =========================
// Refund Processing
// =========================

/**
 * Process a refund and deduct credits from user account
 */
export async function processRefund(
  paymentIntentId: string,
  reason: "duplicate" | "fraudulent" | "requested_by_customer" = "requested_by_customer",
  adminUserId?: string
): Promise<RefundPaymentResult> {
  return await logger.wrapOperation(
    async () => {
      try {
        // Find the original transaction
        const purchaseTransactions = await prisma.creditTransaction.findMany({
          where: {
            reason: TRANSACTION_CONFIG.reasons.PURCHASE,
            type: "CREDIT",
          },
        });

        const originalTransaction = purchaseTransactions.find(
          (tx) => (tx.metadata as any)?.paymentIntentId === paymentIntentId
        );

        if (!originalTransaction) {
          return {
            success: false,
            error: "Original transaction not found",
            errorCode: BILLING_ERROR_CODES.PAYMENT_FAILED,
          };
        }

        // Process refund with Stripe
        const refund = await refundPayment({
          paymentIntentId,
          reason,
          metadata: {
            adminUserId: adminUserId || "",
            originalTransactionId: originalTransaction.id,
          },
        });

        // Deduct credits from user account
        const { deductCredits } = await import("@/app/actions/credit-actions");

        // Get user's authId for credit operations
        const user = await prisma.user.findUnique({
          where: { id: originalTransaction.userId },
          select: { authId: true },
        });

        if (!user?.authId) {
          throw new Error(`User authId not found for transaction user: ${originalTransaction.userId}`);
        }

        await deductCredits(user.authId, originalTransaction.amount, TRANSACTION_CONFIG.reasons.REFUND, undefined, {
          refundId: refund.id,
          paymentIntentId,
          originalTransactionId: originalTransaction.id,
          reason,
        });

        return {
          success: true,
          refundId: refund.id,
          creditsDeducted: originalTransaction.amount,
        };
      } catch (error) {
        if (isStripeError(error)) {
          const message = getStripeErrorMessage(error);
          return {
            success: false,
            error: message,
            errorCode: BILLING_ERROR_CODES.PAYMENT_FAILED,
          };
        }

        await logger.logWarning("Failed to process refund", {
          operation: "process_refund",
          metadata: { paymentIntentId },
        });

        return {
          success: false,
          error: "Failed to process refund",
          errorCode: BILLING_ERROR_CODES.PAYMENT_FAILED,
        };
      }
    },
    ERROR_CODES.BILLING_OPERATION_FAILED,
    {
      operation: "process_refund",
      metadata: { paymentIntentId },
    },
    "Refund processed successfully"
  );
}

// =========================
// Payment Status Queries
// =========================

/**
 * Get payment status for a payment intent
 */
export async function getPaymentStatus(paymentIntentId: string): Promise<{
  success: boolean;
  status?: string;
  amount?: number;
  currency?: string;
  error?: string;
}> {
  return await logger.wrapOperation(
    async () => {
      try {
        const paymentIntent = await getPaymentIntent(paymentIntentId);

        return {
          success: true,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        };
      } catch {
        await logger.logWarning("Failed to get payment status", {
          operation: "get_payment_status",
          metadata: { paymentIntentId },
        });

        return {
          success: false,
          error: "Failed to retrieve payment status",
        };
      }
    },
    ERROR_CODES.BILLING_OPERATION_FAILED,
    {
      operation: "get_payment_status",
      metadata: { paymentIntentId },
    }
  );
}

/**
 * Get user's purchase history
 */
export async function getUserPurchaseHistory(limit: number = 10): Promise<{
  success: boolean;
  purchases?: Array<{
    id: string;
    amount: number;
    credits: number;
    date: Date;
    status: string;
    paymentIntentId?: string;
  }>;
  error?: string;
}> {
  return await logger.wrapOperation(
    async () => {
      try {
        // Get current authenticated user
        const authUser = await requireCurrentUser();

        // Get the database user record to get the internal user ID
        const dbUser = await prisma.user.findUnique({
          where: { authId: authUser.id },
          select: { id: true },
        });

        if (!dbUser) {
          return {
            success: false,
            error: "User not found",
          };
        }

        const transactions = await prisma.creditTransaction.findMany({
          where: {
            userId: dbUser.id,
            reason: TRANSACTION_CONFIG.reasons.PURCHASE,
            type: "CREDIT",
          },
          orderBy: { createdAt: "desc" },
          take: limit,
        });

        const purchases = transactions.map((tx: any) => ({
          id: tx.id,
          amount: tx.metadata?.amountUSD || 0,
          credits: tx.amount,
          date: tx.createdAt,
          status: tx.metadata?.status || "unknown",
          paymentIntentId: tx.metadata?.paymentIntentId,
        }));

        return {
          success: true,
          purchases,
        };
      } catch {
        await logger.logWarning("Failed to get purchase history", {
          operation: "get_user_purchase_history",
        });

        return {
          success: false,
          error: "Failed to retrieve purchase history",
        };
      }
    },
    ERROR_CODES.BILLING_OPERATION_FAILED,
    {
      operation: "get_user_purchase_history",
    }
  );
}
