/**
 * Tests for billing types to ensure type safety
 */

import { describe, expect, it } from "vitest";

import type {
  CreatePaymentIntentResult,
  PaymentStatusResult,
  ProcessPaymentResult,
  PurchaseHistoryResult,
  RefundPaymentResult,
} from "../billing-types";

describe("Billing Types", () => {
  describe("CreatePaymentIntentResult", () => {
    it("should accept valid success result", () => {
      const result: CreatePaymentIntentResult = {
        success: true,
        clientSecret: "pi_test_client_secret",
        paymentIntentId: "pi_test_123",
      };

      expect(result.success).toBe(true);
      expect(result.clientSecret).toBe("pi_test_client_secret");
      expect(result.paymentIntentId).toBe("pi_test_123");
    });

    it("should accept valid error result", () => {
      const result: CreatePaymentIntentResult = {
        success: false,
        error: "Invalid product selected",
        errorCode: "INVALID_PRODUCT",
      };

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid product selected");
      expect(result.errorCode).toBe("INVALID_PRODUCT");
    });
  });

  describe("ProcessPaymentResult", () => {
    it("should accept valid payment processing result", () => {
      const result: ProcessPaymentResult = {
        success: true,
        creditsAdded: 120,
        newBalance: 220,
        transactionId: "tx_123",
      };

      expect(result.success).toBe(true);
      expect(result.creditsAdded).toBe(120);
      expect(result.newBalance).toBe(220);
      expect(result.transactionId).toBe("tx_123");
    });
  });

  describe("RefundPaymentResult", () => {
    it("should accept valid refund result", () => {
      const result: RefundPaymentResult = {
        success: true,
        refundId: "re_123",
        creditsDeducted: 50,
      };

      expect(result.success).toBe(true);
      expect(result.refundId).toBe("re_123");
      expect(result.creditsDeducted).toBe(50);
    });
  });

  describe("PaymentStatusResult", () => {
    it("should accept valid payment status", () => {
      const result: PaymentStatusResult = {
        success: true,
        status: "succeeded",
        amount: 1500,
        currency: "usd",
        metadata: {
          userId: "user_123",
          productKey: "starter",
        },
      };

      expect(result.success).toBe(true);
      expect(result.status).toBe("succeeded");
      expect(result.amount).toBe(1500);
      expect(result.currency).toBe("usd");
      expect(result.metadata).toEqual({
        userId: "user_123",
        productKey: "starter",
      });
    });
  });

  describe("PurchaseHistoryResult", () => {
    it("should accept valid purchase history", () => {
      const result: PurchaseHistoryResult = {
        success: true,
        purchases: [
          {
            id: "purchase_1",
            amount: 1500,
            credits: 120,
            status: "completed",
            createdAt: new Date("2024-01-15"),
            metadata: {
              productKey: "starter",
            },
          },
        ],
      };

      expect(result.success).toBe(true);
      expect(result.purchases).toHaveLength(1);
      expect(result.purchases![0].id).toBe("purchase_1");
      expect(result.purchases![0].amount).toBe(1500);
      expect(result.purchases![0].credits).toBe(120);
    });

    it("should accept empty purchase history", () => {
      const result: PurchaseHistoryResult = {
        success: true,
        purchases: [],
      };

      expect(result.success).toBe(true);
      expect(result.purchases).toEqual([]);
    });
  });
});
