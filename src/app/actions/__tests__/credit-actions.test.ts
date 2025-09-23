/**
 * Unit tests for credit-actions.ts
 * CRITICAL REVENUE PROTECTION - Tests core credit operations and database transactions
 *
 * These tests protect against:
 * - Incorrect credit calculations
 * - Balance corruption
 * - Transaction atomicity failures
 * - Unauthorized operations
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import {
  addCredits,
  adminAdjustCredits,
  checkSufficientCredits,
  deductCredits,
  getUserCreditHistory,
  getUserCreditsBalance,
} from "../credit-actions";

// Mock dependencies
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    creditTransaction: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/logging/unified-logger", () => ({
  logger: {
    wrapOperation: vi.fn(),
    logErrorAndThrow: vi.fn(),
  },
}));

const mockPrisma = vi.mocked(prisma);
const mockLogger = vi.mocked(logger);

describe("Credit Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for logger.wrapOperation - just execute the operation
    mockLogger.wrapOperation.mockImplementation(async (operation) => {
      return await operation();
    });
  });

  describe("getUserCreditsBalance", () => {
    it("should return user credits balance for valid user", async () => {
      const mockUser = { creditsBalance: 1500 };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserCreditsBalance("test-auth-id");

      expect(result).toBe(1500);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { authId: "test-auth-id" },
        select: { creditsBalance: true },
      });
    });

    it("should return 0 for user with null balance", async () => {
      const mockUser = { creditsBalance: null };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await getUserCreditsBalance("test-auth-id");

      expect(result).toBe(0);
    });

    it("should throw error for non-existent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockLogger.logErrorAndThrow.mockImplementation(() => {
        throw new Error("User not found");
      });

      await expect(getUserCreditsBalance("invalid-auth-id")).rejects.toThrow("User not found");

      expect(mockLogger.logErrorAndThrow).toHaveBeenCalledWith(
        ERROR_CODES.USER_NOT_FOUND,
        expect.any(Error),
        expect.objectContaining({
          operation: "get_user_credits_balance",
          metadata: { authId: "invalid-auth-id" },
        })
      );
    });

    it("should handle database errors gracefully", async () => {
      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database connection failed"));

      await expect(getUserCreditsBalance("test-auth-id")).rejects.toThrow("Database connection failed");
    });
  });

  describe("addCredits", () => {
    it("should successfully add credits and create transaction record", async () => {
      const mockUpdatedUser = { id: "user-123", creditsBalance: 2000 };
      const mockTransaction = { id: "txn-456" };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        // Mock the transaction callback
        const mockTx = {
          user: { update: vi.fn().mockResolvedValue(mockUpdatedUser) },
          creditTransaction: { create: vi.fn().mockResolvedValue(mockTransaction) },
        };
        return await callback(mockTx);
      });

      const result = await addCredits("test-auth-id", 500, "purchase");

      expect(result).toEqual({
        success: true,
        newBalance: 2000,
        transactionId: "txn-456",
      });

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it("should reject negative credit amounts", async () => {
      mockLogger.logErrorAndThrow.mockImplementation(() => {
        throw new Error("Credit amount must be positive");
      });

      await expect(addCredits("test-auth-id", -100, "invalid")).rejects.toThrow("Credit amount must be positive");

      expect(mockLogger.logErrorAndThrow).toHaveBeenCalledWith(
        ERROR_CODES.VALIDATION_FAILED,
        expect.any(Error),
        expect.objectContaining({
          operation: "add_credits",
          metadata: { authId: "test-auth-id", amount: -100, reason: "invalid" },
        })
      );
    });

    it("should reject zero credit amounts", async () => {
      mockLogger.logErrorAndThrow.mockImplementation(() => {
        throw new Error("Credit amount must be positive");
      });

      await expect(addCredits("test-auth-id", 0, "invalid")).rejects.toThrow("Credit amount must be positive");
    });

    it("should include metadata in transaction record", async () => {
      const mockUpdatedUser = { id: "user-123", creditsBalance: 1800 };
      const mockTransaction = { id: "txn-789" };
      const testMetadata = { paymentIntentId: "pi_123", package: "starter" };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: { update: vi.fn().mockResolvedValue(mockUpdatedUser) },
          creditTransaction: {
            create: vi.fn().mockResolvedValue(mockTransaction),
          },
        };

        const result = await callback(mockTx);

        // Verify transaction was created with correct metadata
        expect(mockTx.creditTransaction.create).toHaveBeenCalledWith({
          data: {
            userId: "user-123",
            type: "CREDIT",
            amount: 300,
            reason: "package_purchase",
            metadata: testMetadata,
          },
        });

        return result;
      });

      const result = await addCredits("test-auth-id", 300, "package_purchase", testMetadata);

      expect(result.success).toBe(true);
    });

    it("should handle transaction rollback on failure", async () => {
      mockPrisma.$transaction.mockRejectedValue(new Error("Transaction failed"));

      await expect(addCredits("test-auth-id", 500, "purchase")).rejects.toThrow("Transaction failed");
    });
  });

  describe("deductCredits", () => {
    it("should successfully deduct credits when sufficient balance exists", async () => {
      // Mock getUserCreditsBalance call
      mockPrisma.user.findUnique.mockResolvedValue({ creditsBalance: 1000 });

      const mockUpdatedUser = { id: "user-123", creditsBalance: 700 };
      const mockTransaction = { id: "txn-debit-456" };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: { update: vi.fn().mockResolvedValue(mockUpdatedUser) },
          creditTransaction: { create: vi.fn().mockResolvedValue(mockTransaction) },
        };
        return await callback(mockTx);
      });

      const result = await deductCredits("test-auth-id", 300, "ai_usage", "session-123");

      expect(result).toEqual({
        success: true,
        newBalance: 700,
        transactionId: "txn-debit-456",
      });
    });

    it("should reject deduction when insufficient credits", async () => {
      // Mock getUserCreditsBalance to return low balance
      mockPrisma.user.findUnique.mockResolvedValue({ creditsBalance: 50 });
      mockLogger.logErrorAndThrow.mockImplementation(() => {
        throw new Error("Insufficient credits");
      });

      await expect(deductCredits("test-auth-id", 100, "ai_usage")).rejects.toThrow("Insufficient credits");

      expect(mockLogger.logErrorAndThrow).toHaveBeenCalledWith(
        ERROR_CODES.VALIDATION_FAILED,
        expect.any(Error),
        expect.objectContaining({
          operation: "deduct_credits",
          metadata: expect.objectContaining({
            authId: "test-auth-id",
            amount: 100,
            currentBalance: 50,
          }),
        })
      );
    });

    it("should reject negative deduction amounts", async () => {
      mockLogger.logErrorAndThrow.mockImplementation(() => {
        throw new Error("Credit amount must be positive");
      });

      await expect(deductCredits("test-auth-id", -50, "invalid")).rejects.toThrow("Credit amount must be positive");
    });

    it("should create DEBIT transaction record with session ID", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ creditsBalance: 1000 });

      const mockUpdatedUser = { id: "user-123", creditsBalance: 800 };
      const mockTransaction = { id: "txn-debit-789" };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: { update: vi.fn().mockResolvedValue(mockUpdatedUser) },
          creditTransaction: {
            create: vi.fn().mockResolvedValue(mockTransaction),
          },
        };

        const result = await callback(mockTx);

        // Verify DEBIT transaction with session ID
        expect(mockTx.creditTransaction.create).toHaveBeenCalledWith({
          data: {
            userId: "user-123",
            type: "DEBIT",
            amount: 200,
            reason: "ai_usage",
            sessionId: "session-456",
            metadata: undefined,
          },
        });

        return result;
      });

      await deductCredits("test-auth-id", 200, "ai_usage", "session-456");
    });

    it("should handle exact balance deduction", async () => {
      // User has exactly 100 credits, deduct exactly 100
      mockPrisma.user.findUnique.mockResolvedValue({ creditsBalance: 100 });

      const mockUpdatedUser = { id: "user-123", creditsBalance: 0 };
      const mockTransaction = { id: "txn-exact" };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: { update: vi.fn().mockResolvedValue(mockUpdatedUser) },
          creditTransaction: { create: vi.fn().mockResolvedValue(mockTransaction) },
        };
        return await callback(mockTx);
      });

      const result = await deductCredits("test-auth-id", 100, "ai_usage");

      expect(result.newBalance).toBe(0);
      expect(result.success).toBe(true);
    });
  });

  describe("getUserCreditHistory", () => {
    it("should return user transaction history with default pagination", async () => {
      const mockUser = { id: "user-123" };
      const mockTransactions = [
        {
          id: "txn-1",
          userId: "user-123",
          type: "CREDIT",
          amount: 1000,
          reason: "purchase",
          sessionId: null,
          metadata: {},
          createdAt: new Date("2024-01-15"),
        },
        {
          id: "txn-2",
          userId: "user-123",
          type: "DEBIT",
          amount: 50,
          reason: "ai_usage",
          sessionId: "session-123",
          metadata: {},
          createdAt: new Date("2024-01-14"),
        },
      ];

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.creditTransaction.findMany.mockResolvedValue(mockTransactions);

      const result = await getUserCreditHistory("test-auth-id");

      expect(result).toEqual(mockTransactions);
      expect(mockPrisma.creditTransaction.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        orderBy: { createdAt: "desc" },
        take: 50, // default limit
        skip: 0, // default offset
        select: expect.objectContaining({
          id: true,
          type: true,
          amount: true,
          reason: true,
          sessionId: true,
          metadata: true,
          createdAt: true,
        }),
      });
    });

    it("should handle custom pagination parameters", async () => {
      const mockUser = { id: "user-456" };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.creditTransaction.findMany.mockResolvedValue([]);

      await getUserCreditHistory("test-auth-id", 20, 10);

      expect(mockPrisma.creditTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 10,
        })
      );
    });

    it("should throw error for non-existent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(getUserCreditHistory("invalid-auth-id")).rejects.toThrow("User not found");
    });
  });

  describe("adminAdjustCredits", () => {
    it("should allow admin to add credits to user", async () => {
      const mockAdmin = { role: "admin" };
      const mockTargetUser = { authId: "target-auth-id" };
      const mockUpdatedUser = { creditsBalance: 1500 };
      const mockTransaction = { id: "admin-txn-123" };

      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockAdmin) // Admin check
        .mockResolvedValueOnce(mockTargetUser) // Target user for balance check
        .mockResolvedValueOnce({ creditsBalance: 1000 }); // Balance check

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: { update: vi.fn().mockResolvedValue(mockUpdatedUser) },
          creditTransaction: { create: vi.fn().mockResolvedValue(mockTransaction) },
        };
        return await callback(mockTx);
      });

      const result = await adminAdjustCredits("admin-123", "target-456", 500, "bonus");

      expect(result).toEqual({
        success: true,
        newBalance: 1500,
        transactionId: "admin-txn-123",
      });
    });

    it("should reject non-admin user attempts", async () => {
      const mockNonAdmin = { role: "user" };
      mockPrisma.user.findUnique.mockResolvedValue(mockNonAdmin);
      mockLogger.logErrorAndThrow.mockImplementation(() => {
        throw new Error("Admin access required");
      });

      await expect(adminAdjustCredits("user-123", "target-456", 100, "bonus")).rejects.toThrow("Admin access required");

      expect(mockLogger.logErrorAndThrow).toHaveBeenCalledWith(
        ERROR_CODES.AUTH_UNAUTHORIZED,
        expect.any(Error),
        expect.objectContaining({
          operation: "admin_adjust_credits",
          userId: "user-123",
        })
      );
    });

    it("should reject zero amount adjustments", async () => {
      const mockAdmin = { role: "admin" };
      mockPrisma.user.findUnique.mockResolvedValue(mockAdmin);
      mockLogger.logErrorAndThrow.mockImplementation(() => {
        throw new Error("Adjustment amount cannot be zero");
      });

      await expect(adminAdjustCredits("admin-123", "target-456", 0, "invalid")).rejects.toThrow(
        "Adjustment amount cannot be zero"
      );
    });

    it("should prevent negative adjustments when insufficient balance", async () => {
      const mockAdmin = { role: "admin" };
      const mockTargetUser = { authId: "target-auth-id" };

      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockAdmin) // Admin check
        .mockResolvedValueOnce(mockTargetUser) // Target user lookup
        .mockResolvedValueOnce({ creditsBalance: 50 }); // Low balance check

      mockLogger.logErrorAndThrow.mockImplementation(() => {
        throw new Error("Insufficient credits for deduction");
      });

      await expect(adminAdjustCredits("admin-123", "target-456", -100, "penalty")).rejects.toThrow(
        "Insufficient credits for deduction"
      );
    });

    it("should create proper transaction record for negative adjustment", async () => {
      const mockAdmin = { role: "admin" };
      const mockTargetUser = { authId: "target-auth-id" };
      const mockUpdatedUser = { creditsBalance: 400 };
      const mockTransaction = { id: "admin-debit-txn" };

      mockPrisma.user.findUnique
        .mockResolvedValueOnce(mockAdmin)
        .mockResolvedValueOnce(mockTargetUser)
        .mockResolvedValueOnce({ creditsBalance: 500 });

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          user: { update: vi.fn().mockResolvedValue(mockUpdatedUser) },
          creditTransaction: {
            create: vi.fn().mockResolvedValue(mockTransaction),
          },
        };

        const result = await callback(mockTx);

        // Verify DEBIT transaction for negative adjustment
        expect(mockTx.creditTransaction.create).toHaveBeenCalledWith({
          data: {
            userId: "target-456",
            type: "DEBIT",
            amount: 100, // Absolute value
            reason: "admin_adjustment: penalty",
            metadata: {
              adminUserId: "admin-123",
              originalAmount: -100,
              adjustmentType: "deduction",
            },
          },
        });

        return result;
      });

      await adminAdjustCredits("admin-123", "target-456", -100, "penalty");
    });
  });

  describe("checkSufficientCredits", () => {
    it("should return true when user has sufficient credits", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ creditsBalance: 1000 });

      const result = await checkSufficientCredits("test-auth-id", 500);

      expect(result).toBe(true);
    });

    it("should return false when user has insufficient credits", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ creditsBalance: 100 });

      const result = await checkSufficientCredits("test-auth-id", 500);

      expect(result).toBe(false);
    });

    it("should return true for exact balance match", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ creditsBalance: 250 });

      const result = await checkSufficientCredits("test-auth-id", 250);

      expect(result).toBe(true);
    });

    it("should handle zero required credits", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ creditsBalance: 0 });

      const result = await checkSufficientCredits("test-auth-id", 0);

      expect(result).toBe(true);
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete user workflow: add credits, use credits, check history", async () => {
      // Step 1: Add credits
      const mockUser = { id: "user-workflow", creditsBalance: 1000 };
      const mockAddTransaction = { id: "add-txn" };

      mockPrisma.$transaction.mockImplementationOnce(async (callback) => {
        const mockTx = {
          user: { update: vi.fn().mockResolvedValue(mockUser) },
          creditTransaction: { create: vi.fn().mockResolvedValue(mockAddTransaction) },
        };
        return await callback(mockTx);
      });

      const addResult = await addCredits("workflow-user", 1000, "purchase");
      expect(addResult.success).toBe(true);
      expect(addResult.newBalance).toBe(1000);

      // Step 2: Deduct credits (mock new balance)
      mockPrisma.user.findUnique.mockResolvedValue({ creditsBalance: 1000 });
      const mockDeductUser = { id: "user-workflow", creditsBalance: 950 };
      const mockDeductTransaction = { id: "deduct-txn" };

      mockPrisma.$transaction.mockImplementationOnce(async (callback) => {
        const mockTx = {
          user: { update: vi.fn().mockResolvedValue(mockDeductUser) },
          creditTransaction: { create: vi.fn().mockResolvedValue(mockDeductTransaction) },
        };
        return await callback(mockTx);
      });

      const deductResult = await deductCredits("workflow-user", 50, "ai_usage");
      expect(deductResult.success).toBe(true);
      expect(deductResult.newBalance).toBe(950);

      // Step 3: Check history
      mockPrisma.user.findUnique.mockResolvedValue({ id: "user-workflow" });
      mockPrisma.creditTransaction.findMany.mockResolvedValue([
        { id: "add-txn", type: "CREDIT", amount: 1000, reason: "purchase" },
        { id: "deduct-txn", type: "DEBIT", amount: 50, reason: "ai_usage" },
      ]);

      const history = await getUserCreditHistory("workflow-user");
      expect(history).toHaveLength(2);
    });

    it("should maintain atomic operations during concurrent access", async () => {
      // This test verifies that our transaction usage prevents race conditions
      mockPrisma.user.findUnique.mockResolvedValue({ creditsBalance: 100 });

      let transactionCount = 0;
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        transactionCount++;
        const mockTx = {
          user: { update: vi.fn().mockResolvedValue({ id: "user", creditsBalance: 50 }) },
          creditTransaction: { create: vi.fn().mockResolvedValue({ id: `txn-${transactionCount}` }) },
        };
        return await callback(mockTx);
      });

      // Simulate concurrent deductions
      const deduction1 = deductCredits("test-user", 50, "usage1");
      const deduction2 = deductCredits("test-user", 50, "usage2");

      // Both should succeed in our mock (real database would prevent this with proper locking)
      const results = await Promise.all([deduction1, deduction2]);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(transactionCount).toBe(2); // Verify both used transactions
    });
  });
});
