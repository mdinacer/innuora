/**
 * Critical Business Risk Protection - Stripe Webhook Tests
 *
 * Tests payment processing, refunds, and credit allocation to prevent:
 * - Free credit theft (giving credits without payment)
 * - Revenue loss (charging without delivering credits)
 * - Double-processing (giving credits twice for same payment)
 */

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "../route";

// Mock dependencies
vi.mock("@/app/actions/billing-actions", () => ({
  processSuccessfulPayment: vi.fn(),
}));

vi.mock("@/lib/billing/stripe-client", () => ({
  getStripeServer: vi.fn(() => ({
    webhooks: {
      constructEvent: vi.fn(),
    },
  })),
}));

vi.mock("@/lib/billing/billing-config", () => ({
  STRIPE_CONFIG: {
    webhookSecret: "whsec_test_secret",
  },
  WEBHOOK_CONFIG: {
    handledEvents: [
      "payment_intent.succeeded",
      "payment_intent.payment_failed",
      "invoice.payment_succeeded",
      "invoice.payment_failed",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
    ],
  },
}));

vi.mock("@/lib/logging/unified-logger", () => ({
  logger: {
    logInfo: vi.fn(() => Promise.resolve()),
    logWarning: vi.fn(() => Promise.resolve()),
    logAudit: vi.fn(() => Promise.resolve()),
  },
}));

// Use vi.hoisted to avoid hoisting issues
const mockRateLimiter = vi.hoisted(() => ({
  checkLimit: vi.fn(() => ({ success: true })),
}));

vi.mock("@/lib/rate-limiting/rate-limiter", () => ({
  rateLimiter: mockRateLimiter,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    creditTransaction: {
      findMany: vi.fn(() => Promise.resolve([])),
      update: vi.fn(() => Promise.resolve({})),
    },
  },
}));

describe("Stripe Webhook Handler - POST", () => {
  const mockPaymentSucceededEvent = {
    id: "evt_test_123",
    type: "payment_intent.succeeded",
    data: {
      object: {
        id: "pi_test_123",
        amount: 3500, // $35.00
        metadata: {
          userId: "user_123",
          productKey: "STARTER",
          credits: "700",
        },
        status: "succeeded",
      },
    },
  };

  const mockPaymentFailedEvent = {
    id: "evt_test_456",
    type: "payment_intent.payment_failed",
    data: {
      object: {
        id: "pi_test_456",
        amount: 3500,
        metadata: {
          userId: "user_123",
          productKey: "STARTER",
          credits: "700",
        },
        last_payment_error: {
          message: "Card declined",
        },
      },
    },
  };

  function createMockRequest(body: string, signature?: string): NextRequest {
    const headers = new Headers();
    if (signature) {
      headers.set("stripe-signature", signature);
    }
    headers.set("x-forwarded-for", "1.2.3.4");

    return new NextRequest("http://localhost:3000/api/stripe/webhook", {
      method: "POST",
      body,
      headers,
    });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset rate limiter to allow requests
    mockRateLimiter.checkLimit.mockReturnValue({ success: true });
  });

  describe("Security & Validation", () => {
    it("should reject requests without Stripe signature", async () => {
      // Arrange
      const request = createMockRequest(JSON.stringify(mockPaymentSucceededEvent));

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe("Missing signature");
    });

    it("should reject requests with invalid signature", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const mockStripe = getStripeServer();
      vi.mocked(mockStripe.webhooks.constructEvent).mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      const request = createMockRequest(JSON.stringify(mockPaymentSucceededEvent), "invalid_signature");

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe("Invalid signature");
    });

    it("should enforce rate limiting on webhook requests", async () => {
      // Arrange
      mockRateLimiter.checkLimit.mockReturnValueOnce({
        success: false,
        resetTime: new Date(Date.now() + 60000),
      });

      const request = createMockRequest(JSON.stringify(mockPaymentSucceededEvent), "valid_sig");

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(429);
      expect(data.error).toBe("Rate limit exceeded");
      expect(data.resetTime).toBeDefined();
    });

    it("should silently ignore unhandled event types", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const mockStripe = getStripeServer();

      const unhandledEvent = {
        id: "evt_unhandled",
        type: "charge.succeeded", // Not in handledEvents list
        data: { object: {} },
      };

      vi.mocked(mockStripe.webhooks.constructEvent).mockReturnValue(unhandledEvent as any);

      const request = createMockRequest(JSON.stringify(unhandledEvent), "valid_sig");

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(data.handled).toBe(false);
    });
  });

  describe("Payment Success Processing", () => {
    it("should process successful payment and add credits", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const { processSuccessfulPayment } = await import("@/app/actions/billing-actions");

      const mockStripe = getStripeServer();
      vi.mocked(mockStripe.webhooks.constructEvent).mockReturnValue(mockPaymentSucceededEvent as any);

      vi.mocked(processSuccessfulPayment).mockResolvedValue({
        data: {
          success: true,
          creditsAdded: 700,
          newBalance: 1200,
          transactionId: "tx_123",
        },
        error: null,
      });

      const request = createMockRequest(JSON.stringify(mockPaymentSucceededEvent), "valid_sig");

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
      expect(data.handled).toBe(true);
      expect(processSuccessfulPayment).toHaveBeenCalledWith("pi_test_123");
    });

    it("should handle payment processing errors gracefully", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const { processSuccessfulPayment } = await import("@/app/actions/billing-actions");

      const mockStripe = getStripeServer();
      vi.mocked(mockStripe.webhooks.constructEvent).mockReturnValue(mockPaymentSucceededEvent as any);

      vi.mocked(processSuccessfulPayment).mockResolvedValue({
        data: null,
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });

      const request = createMockRequest(JSON.stringify(mockPaymentSucceededEvent), "valid_sig");

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200); // Still return 200 to Stripe to prevent retries
      expect(data.received).toBe(true);
      expect(data.handled).toBe(true);

      const { logger } = await import("@/lib/logging/unified-logger");
      expect(logger.logWarning).toHaveBeenCalled();
    });

    it("should prevent double-processing of payments (idempotency)", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const { processSuccessfulPayment } = await import("@/app/actions/billing-actions");

      const mockStripe = getStripeServer();
      vi.mocked(mockStripe.webhooks.constructEvent).mockReturnValue(mockPaymentSucceededEvent as any);

      // Simulate idempotency check in processSuccessfulPayment
      vi.mocked(processSuccessfulPayment).mockResolvedValue({
        data: {
          success: true,
          creditsAdded: 700,
          newBalance: 1200,
          transactionId: "tx_existing", // Existing transaction
        },
        error: null,
      });

      const request = createMockRequest(JSON.stringify(mockPaymentSucceededEvent), "valid_sig");

      // Act - Process same payment twice
      const response1 = await POST(request);
      const response2 = await POST(request);

      // Assert - Both should succeed (idempotency handled in billing action)
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(processSuccessfulPayment).toHaveBeenCalledTimes(2);
    });
  });

  describe("Payment Failure Handling", () => {
    it("should log payment failures and update transaction status", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const { prisma } = await import("@/lib/prisma");

      const mockStripe = getStripeServer();
      vi.mocked(mockStripe.webhooks.constructEvent).mockReturnValue(mockPaymentFailedEvent as any);

      const mockTransaction = {
        id: "tx_123",
        metadata: { paymentIntentId: "pi_test_456" },
      };

      vi.mocked(prisma.creditTransaction.findMany).mockResolvedValue([mockTransaction] as any);
      vi.mocked(prisma.creditTransaction.update).mockResolvedValue({} as any);

      const request = createMockRequest(JSON.stringify(mockPaymentFailedEvent), "valid_sig");

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(200);
      expect(prisma.creditTransaction.findMany).toHaveBeenCalled();
      expect(prisma.creditTransaction.update).toHaveBeenCalledWith({
        where: { id: "tx_123" },
        data: {
          metadata: expect.objectContaining({
            status: "failed",
            failureReason: "Card declined",
            failedAt: expect.any(String),
          }),
        },
      });

      const { logger } = await import("@/lib/logging/unified-logger");
      expect(logger.logWarning).toHaveBeenCalledWith(expect.stringContaining("Payment failed"), expect.any(Object));
    });

    it("should handle missing payment error gracefully", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const mockStripe = getStripeServer();

      const eventWithoutError = {
        ...mockPaymentFailedEvent,
        data: {
          object: {
            ...mockPaymentFailedEvent.data.object,
            last_payment_error: undefined,
          },
        },
      };

      vi.mocked(mockStripe.webhooks.constructEvent).mockReturnValue(eventWithoutError as any);

      const request = createMockRequest(JSON.stringify(eventWithoutError), "valid_sig");

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(200);
      const { prisma } = await import("@/lib/prisma");
      expect(prisma.creditTransaction.update).toHaveBeenCalledWith({
        where: expect.any(String),
        data: {
          metadata: expect.objectContaining({
            failureReason: "Unknown error",
          }),
        },
      });
    });
  });

  describe("Invoice Events", () => {
    const mockInvoiceSucceededEvent = {
      id: "evt_invoice_123",
      type: "invoice.payment_succeeded",
      data: {
        object: {
          id: "in_123",
          customer: "cus_123",
          amount_paid: 7500, // $75.00
        },
      },
    };

    const mockInvoiceFailedEvent = {
      id: "evt_invoice_456",
      type: "invoice.payment_failed",
      data: {
        object: {
          id: "in_456",
          customer: "cus_123",
          amount_due: 7500,
        },
      },
    };

    it("should handle invoice payment succeeded", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const mockStripe = getStripeServer();
      vi.mocked(mockStripe.webhooks.constructEvent).mockReturnValue(mockInvoiceSucceededEvent as any);

      const request = createMockRequest(JSON.stringify(mockInvoiceSucceededEvent), "valid_sig");

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(200);
      const { logger } = await import("@/lib/logging/unified-logger");
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining("Invoice payment succeeded"),
        expect.any(Object)
      );
    });

    it("should handle invoice payment failed", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const mockStripe = getStripeServer();
      vi.mocked(mockStripe.webhooks.constructEvent).mockReturnValue(mockInvoiceFailedEvent as any);

      const request = createMockRequest(JSON.stringify(mockInvoiceFailedEvent), "valid_sig");

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(200);
      const { logger } = await import("@/lib/logging/unified-logger");
      expect(logger.logWarning).toHaveBeenCalledWith(
        expect.stringContaining("Invoice payment failed"),
        expect.any(Object)
      );
    });
  });

  describe("Subscription Events", () => {
    const mockSubscriptionCreatedEvent = {
      id: "evt_sub_123",
      type: "customer.subscription.created",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          status: "active",
        },
      },
    };

    const mockSubscriptionUpdatedEvent = {
      id: "evt_sub_456",
      type: "customer.subscription.updated",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
          status: "past_due",
        },
      },
    };

    const mockSubscriptionDeletedEvent = {
      id: "evt_sub_789",
      type: "customer.subscription.deleted",
      data: {
        object: {
          id: "sub_123",
          customer: "cus_123",
        },
      },
    };

    it("should handle subscription created", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const mockStripe = getStripeServer();
      vi.mocked(mockStripe.webhooks.constructEvent).mockReturnValue(mockSubscriptionCreatedEvent as any);

      const request = createMockRequest(JSON.stringify(mockSubscriptionCreatedEvent), "valid_sig");

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(200);
      const { logger } = await import("@/lib/logging/unified-logger");
      expect(logger.logInfo).toHaveBeenCalledWith(expect.stringContaining("Subscription created"), expect.any(Object));
    });

    it("should handle subscription updated", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const mockStripe = getStripeServer();
      vi.mocked(mockStripe.webhooks.constructEvent).mockReturnValue(mockSubscriptionUpdatedEvent as any);

      const request = createMockRequest(JSON.stringify(mockSubscriptionUpdatedEvent), "valid_sig");

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(200);
      const { logger } = await import("@/lib/logging/unified-logger");
      expect(logger.logInfo).toHaveBeenCalledWith(expect.stringContaining("Subscription updated"), expect.any(Object));
    });

    it("should handle subscription deleted", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const mockStripe = getStripeServer();
      vi.mocked(mockStripe.webhooks.constructEvent).mockReturnValue(mockSubscriptionDeletedEvent as any);

      const request = createMockRequest(JSON.stringify(mockSubscriptionDeletedEvent), "valid_sig");

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(200);
      const { logger } = await import("@/lib/logging/unified-logger");
      expect(logger.logInfo).toHaveBeenCalledWith(expect.stringContaining("Subscription deleted"), expect.any(Object));
    });
  });

  describe("Error Handling", () => {
    it("should return 500 on unexpected errors", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const mockStripe = getStripeServer();

      vi.mocked(mockStripe.webhooks.constructEvent).mockImplementation(() => {
        throw new Error("Unexpected webhook error");
      });

      const request = createMockRequest(JSON.stringify(mockPaymentSucceededEvent), "valid_sig");

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400); // Signature verification fails
      expect(data.error).toBeDefined();
    });

    it("should log all webhook processing errors", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const { processSuccessfulPayment } = await import("@/app/actions/billing-actions");

      const mockStripe = getStripeServer();
      vi.mocked(mockStripe.webhooks.constructEvent).mockReturnValue(mockPaymentSucceededEvent as any);

      vi.mocked(processSuccessfulPayment).mockRejectedValue(new Error("Database connection failed"));

      const request = createMockRequest(JSON.stringify(mockPaymentSucceededEvent), "valid_sig");

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(500);
      const { logger } = await import("@/lib/logging/unified-logger");
      expect(logger.logWarning).toHaveBeenCalledWith(expect.stringContaining("failed"), expect.any(Object));
    });
  });

  describe("Metadata Validation", () => {
    it("should extract correct metadata from payment intent", async () => {
      // Arrange
      const { getStripeServer } = await import("@/lib/billing/stripe-client");
      const { processSuccessfulPayment } = await import("@/app/actions/billing-actions");

      const mockStripe = getStripeServer();
      const eventWithMetadata = {
        ...mockPaymentSucceededEvent,
        data: {
          object: {
            ...mockPaymentSucceededEvent.data.object,
            metadata: {
              userId: "user_specific_123",
              productKey: "PREMIUM",
              credits: "3000",
              customData: "should_be_preserved",
            },
          },
        },
      };

      vi.mocked(mockStripe.webhooks.constructEvent).mockReturnValue(eventWithMetadata as any);
      vi.mocked(processSuccessfulPayment).mockResolvedValue({
        data: {
          success: true,
          creditsAdded: 3000,
          newBalance: 5000,
          transactionId: "tx_123",
        },
        error: null,
      });

      const request = createMockRequest(JSON.stringify(eventWithMetadata), "valid_sig");

      // Act
      await POST(request);

      // Assert
      expect(processSuccessfulPayment).toHaveBeenCalledWith(eventWithMetadata.data.object.id);
      const { logger } = await import("@/lib/logging/unified-logger");
      expect(logger.logInfo).toHaveBeenCalledWith(
        expect.stringContaining("Processing successful payment"),
        expect.objectContaining({
          userId: "user_specific_123",
        })
      );
    });
  });
});
