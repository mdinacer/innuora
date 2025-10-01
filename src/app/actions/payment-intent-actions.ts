"use server";

import { requireCurrentUser } from "@/app/actions/auth-actions";
import { BILLING_ERROR_CODES, BillingProductKey, BillingUtils, TRANSACTION_CONFIG } from "@/lib/billing/billing-config";
import { CreatePaymentIntentResult } from "@/lib/billing/billing-types";
import {
  createOrGetCustomer,
  createPaymentIntent,
  getStripeErrorMessage,
  isStripeError,
} from "@/lib/billing/stripe-client";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types/action-result";

/**
 * Create a Stripe payment intent for credit purchase
 */
export async function createCreditPurchaseIntent(
  productKey: BillingProductKey,
  userEmail?: string,
  userName?: string
): Promise<ActionResult<CreatePaymentIntentResult>> {
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
