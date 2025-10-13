/**
 * Critical Business Risk Protection - Billing Actions Tests
 *
 * Tests payment processing and credit allocation to prevent:
 * - Free credit theft (giving credits without valid payment)
 * - Revenue loss (charging users without delivering credits)
 * - Double-processing (giving credits twice for same payment)
 */

import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { processRefund, processSuccessfulPayment } from "../billing-actions";

// Mock dependencies
vi.mock("@/lib/billing/stripe-client", () => ({
  getPaymentIntent: vi.fn(),
  refundPayment: vi.fn(),
  isStripeError: vi.fn(() => false), // Add missing export
  getStripeErrorMessage: vi.fn(() => "Stripe error"),
}));

vi.mock("@/app/actions/credit-actions", () => ({
  addCreditsToUser: vi.fn(),
  deductCreditsFromUser: vi.fn(),
}));

vi.mock("@/lib/logging/unified-logger", () => ({
  logger: {
    wrapOperation: vi.fn(async (fn, errorCode) => {
      try {
        const result = await fn();
        return { data: result, error: null };
      } catch (error) {
        // Catch errors thrown by logErrorAndThrow and return them as error result
        return {
          data: null,
          error: {
            message: error instanceof Error ? error.message : String(error),
            code: errorCode || "OPERATION_FAILED",
          },
        };
      }
    }),
    logErrorAndThrow: vi.fn((errorCode, error) => {
      // Throw the error so wrapOperation can catch it
      throw error;
    }),
    logWarning: vi.fn(),
    logInfo: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    creditTransaction: {
      findMany: vi.fn(() => Promise.resolve([])),
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Billing Actions - Critical Payment Processing", () => {
  const mockPaymentIntent: Partial<Stripe.PaymentIntent> = {
    id: "pi_test_123",
    status: "succeeded",
    amount: 3500, // $35.00
    customer: "cus_test_123",
    metadata: {
      userId: "user_auth_123",
      productKey: "STARTER",
      credits: "700",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("processSuccessfulPayment - Revenue Protection", () => {
    it("should successfully process payment and add credits", async () => {
      // Arrange
      const { getPaymentIntent } = await import("@/lib/billing/stripe-client");
      const { addCreditsToUser } = await import("@/app/actions/credit-actions");
      const { prisma } = await import("@/lib/prisma");

      vi.mocked(getPaymentIntent).mockResolvedValue(mockPaymentIntent as Stripe.PaymentIntent);
      vi.mocked(prisma.creditTransaction.findMany).mockResolvedValue([]);
      vi.mocked(addCreditsToUser).mockResolvedValue({
        data: {
          newBalance: 1200,
          transactionId: "tx_123",
        },
        error: null,
      });

      // Act
      const result = await processSuccessfulPayment("pi_test_123");

      // Assert
      expect(result.error).toBeNull();
      expect(result.data?.success).toBe(true);
      expect(result.data?.creditsAdded).toBe(700);
      expect(result.data?.newBalance).toBe(1200);

      // Verify credits were added with correct parameters
      expect(addCreditsToUser).toHaveBeenCalledWith(
        "user_auth_123",
        700,
        "credit_purchase",
        expect.objectContaining({
          paymentIntentId: "pi_test_123",
          productKey: "STARTER",
          status: "completed",
        })
      );
    });

    it("should prevent double-processing of payments (idempotency)", async () => {
      // Arrange
      const { getPaymentIntent } = await import("@/lib/billing/stripe-client");
      const { addCreditsToUser } = await import("@/app/actions/credit-actions");
      const { prisma } = await import("@/lib/prisma");

      const existingTransaction = {
        id: "tx_existing",
        amount: 700,
        metadata: { paymentIntentId: "pi_test_123" },
      };

      vi.mocked(getPaymentIntent).mockResolvedValue(mockPaymentIntent as Stripe.PaymentIntent);
      vi.mocked(prisma.creditTransaction.findMany).mockResolvedValue([existingTransaction as any]);

      // Act
      const result = await processSuccessfulPayment("pi_test_123");

      // Assert
      expect(result.error).toBeNull();
      expect(result.data?.success).toBe(true);
      expect(result.data?.creditsAdded).toBe(700);
      expect(result.data?.transactionId).toBe("tx_existing"); // Returns existing transaction

      // CRITICAL: Should NOT add credits again
      expect(addCreditsToUser).not.toHaveBeenCalled();
    });

    it("should reject payment that has not succeeded", async () => {
      // Arrange
      const { getPaymentIntent } = await import("@/lib/billing/stripe-client");

      const pendingPayment = {
        ...mockPaymentIntent,
        status: "processing" as const,
      };

      vi.mocked(getPaymentIntent).mockResolvedValue(pendingPayment as Stripe.PaymentIntent);

      // Act
      const result = await processSuccessfulPayment("pi_test_456");

      // Assert
      expect(result.error).toBeNull();
      expect(result.data?.success).toBe(false);
      expect(result.data?.error).toContain("Payment has not succeeded");
      expect(result.data?.errorCode).toBe("PAYMENT_FAILED"); // Check actual error code from billing-config
    });

    it("should reject payment with missing metadata", async () => {
      // Arrange
      const { getPaymentIntent } = await import("@/lib/billing/stripe-client");

      const invalidPayment = {
        ...mockPaymentIntent,
        metadata: {}, // Missing required fields
      };

      vi.mocked(getPaymentIntent).mockResolvedValue(invalidPayment as Stripe.PaymentIntent);

      // Act
      const result = await processSuccessfulPayment("pi_test_invalid");

      // Assert
      expect(result.error).toBeNull();
      expect(result.data?.success).toBe(false);
      expect(result.data?.error).toContain("Invalid payment metadata");
    });

    it("should handle credit addition failures gracefully", async () => {
      // Arrange
      const { getPaymentIntent } = await import("@/lib/billing/stripe-client");
      const { addCreditsToUser } = await import("@/app/actions/credit-actions");
      const { prisma } = await import("@/lib/prisma");

      vi.mocked(getPaymentIntent).mockResolvedValue(mockPaymentIntent as Stripe.PaymentIntent);
      vi.mocked(prisma.creditTransaction.findMany).mockResolvedValue([]);
      vi.mocked(addCreditsToUser).mockResolvedValue({
        data: null,
        error: {
          message: "Database error",
          code: "DB_ERROR",
        },
      });

      // Act & Assert
      // The function wraps operations, so it returns error in data rather than throwing
      const result = await processSuccessfulPayment("pi_test_123");
      expect(result.error).not.toBeNull();
    });

    it("should extract correct amounts and metadata", async () => {
      // Arrange
      const { getPaymentIntent } = await import("@/lib/billing/stripe-client");
      const { addCreditsToUser } = await import("@/app/actions/credit-actions");
      const { prisma } = await import("@/lib/prisma");

      const premiumPayment = {
        ...mockPaymentIntent,
        amount: 15000, // $150.00
        metadata: {
          userId: "user_premium",
          productKey: "PREMIUM",
          credits: "3000",
        },
      };

      vi.mocked(getPaymentIntent).mockResolvedValue(premiumPayment as Stripe.PaymentIntent);
      vi.mocked(prisma.creditTransaction.findMany).mockResolvedValue([]);
      vi.mocked(addCreditsToUser).mockResolvedValue({
        data: { newBalance: 5000, transactionId: "tx_premium" },
        error: null,
      });

      // Act
      await processSuccessfulPayment("pi_premium");

      // Assert
      expect(addCreditsToUser).toHaveBeenCalledWith(
        "user_premium",
        3000,
        "credit_purchase",
        expect.objectContaining({
          paymentIntentId: "pi_premium",
          productKey: "PREMIUM",
          amountUSD: 150, // Should convert cents to dollars
          stripeCustomerId: "cus_test_123",
        })
      );
    });
  });

  describe("processRefund - Revenue Loss Prevention", () => {
    it("should successfully process refund and deduct credits", async () => {
      // Arrange
      const { refundPayment } = await import("@/lib/billing/stripe-client");
      const { deductCreditsFromUser } = await import("@/app/actions/credit-actions");
      const { prisma } = await import("@/lib/prisma");

      const originalTransaction = {
        id: "tx_original",
        userId: "db_user_123",
        amount: 700,
        metadata: { paymentIntentId: "pi_test_123" },
      };

      vi.mocked(prisma.creditTransaction.findMany).mockResolvedValue([originalTransaction as any]);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "db_user_123",
        authId: "user_auth_123",
      } as any);
      vi.mocked(refundPayment).mockResolvedValue({ id: "re_test_123" } as any);
      vi.mocked(deductCreditsFromUser).mockResolvedValue({
        data: { newBalance: 500 },
        error: null,
      });

      // Act
      const result = await processRefund("pi_test_123", "requested_by_customer");

      // Assert
      expect(result.error).toBeNull();
      expect(result.data?.success).toBe(true);
      expect(result.data?.refundId).toBe("re_test_123");
      expect(result.data?.creditsDeducted).toBe(700);

      // Verify credits were deducted
      expect(deductCreditsFromUser).toHaveBeenCalledWith(
        "user_auth_123",
        700,
        "refund",
        undefined,
        expect.objectContaining({
          refundId: "re_test_123",
          paymentIntentId: "pi_test_123",
          reason: "requested_by_customer",
        })
      );
    });

    it("should fail if original transaction not found", async () => {
      // Arrange
      const { prisma } = await import("@/lib/prisma");

      vi.mocked(prisma.creditTransaction.findMany).mockResolvedValue([]);

      // Act
      const result = await processRefund("pi_nonexistent");

      // Assert
      expect(result.error).toBeNull();
      expect(result.data?.success).toBe(false);
      expect(result.data?.error).toContain("Original transaction not found");
    });

    it("should fail if user not found during refund", async () => {
      // Arrange
      const { prisma } = await import("@/lib/prisma");

      const originalTransaction = {
        id: "tx_original",
        userId: "db_user_missing",
        amount: 700,
        metadata: { paymentIntentId: "pi_test_123" },
      };

      vi.mocked(prisma.creditTransaction.findMany).mockResolvedValue([originalTransaction as any]);
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      // Act & Assert
      // The function wraps operations, so it returns error in data rather than throwing
      const result = await processRefund("pi_test_123");
      expect(result.error).not.toBeNull();
    });

    it("should handle credit deduction failures", async () => {
      // Arrange
      const { refundPayment } = await import("@/lib/billing/stripe-client");
      const { deductCreditsFromUser } = await import("@/app/actions/credit-actions");
      const { prisma } = await import("@/lib/prisma");

      const originalTransaction = {
        id: "tx_original",
        userId: "db_user_123",
        amount: 700,
        metadata: { paymentIntentId: "pi_test_123" },
      };

      vi.mocked(prisma.creditTransaction.findMany).mockResolvedValue([originalTransaction as any]);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "db_user_123",
        authId: "user_auth_123",
      } as any);
      vi.mocked(refundPayment).mockResolvedValue({ id: "re_test_123" } as any);
      vi.mocked(deductCreditsFromUser).mockResolvedValue({
        data: null,
        error: {
          message: "Insufficient credits",
          code: "INSUFFICIENT_CREDITS",
        },
      });

      // Act & Assert
      // The function wraps operations, so it returns error in data rather than throwing
      const result = await processRefund("pi_test_123");
      expect(result.error).not.toBeNull();
    });

    it("should support different refund reasons", async () => {
      // Arrange
      const { refundPayment } = await import("@/lib/billing/stripe-client");
      const { deductCreditsFromUser } = await import("@/app/actions/credit-actions");
      const { prisma } = await import("@/lib/prisma");

      const originalTransaction = {
        id: "tx_original",
        userId: "db_user_123",
        amount: 700,
        metadata: { paymentIntentId: "pi_fraud" },
      };

      vi.mocked(prisma.creditTransaction.findMany).mockResolvedValue([originalTransaction as any]);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "db_user_123",
        authId: "user_auth_123",
      } as any);
      vi.mocked(refundPayment).mockResolvedValue({ id: "re_fraud" } as any);
      vi.mocked(deductCreditsFromUser).mockResolvedValue({
        data: { newBalance: 0 },
        error: null,
      });

      // Act
      await processRefund("pi_fraud", "fraudulent", "admin_123");

      // Assert
      expect(refundPayment).toHaveBeenCalledWith({
        paymentIntentId: "pi_fraud",
        reason: "fraudulent",
        metadata: {
          adminUserId: "admin_123",
          originalTransactionId: "tx_original",
        },
      });
    });
  });
});
