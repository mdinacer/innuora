"use server";

import {
  AI_MODEL_PRICING_USD,
  calculateCreditsFromTokens,
  estimateCreditsFromContent,
} from "@/lib/credits/credits-utils";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";

// =========================
// Types and Constants
// =========================

// Local types to avoid Prisma client dependency issues during build
enum CreditTransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

interface CreditTransaction {
  id: string;
  userId: string;
  type: CreditTransactionType;
  amount: number;
  reason: string;
  sessionId?: string;
  metadata?: any;
  createdAt: Date;
}

interface CreditOperationResult {
  success: boolean;
  newBalance: number;
  transactionId: string;
}

// =========================
// Core Credit Operations
// =========================

/**
 * Get user's current credits balance
 */
export async function getUserCreditsBalance(userId: string): Promise<number> {
  return await logger.wrapOperation(
    async () => {
      // This will fail until Prisma client is regenerated with new schema
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { creditsBalance: true } as any, // Temporary fix for build
      });

      if (!user) {
        logger.logErrorAndThrow(ERROR_CODES.USER_NOT_FOUND, new Error(`User not found: ${userId}`), {
          operation: "get_user_credits_balance",
          userId,
        });
      }

      return (user as any).creditsBalance || 0;
    },
    ERROR_CODES.USER_NOT_FOUND,
    {
      operation: "get_user_credits_balance",
      userId,
    }
  );
}

/**
 * Add credits to user account (purchases, bonuses, refunds)
 */
export async function addCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, any>
): Promise<CreditOperationResult> {
  return await logger.wrapOperation(
    async () => {
      if (amount <= 0) {
        logger.logErrorAndThrow(ERROR_CODES.VALIDATION_FAILED, new Error("Credit amount must be positive"), {
          operation: "add_credits",
          userId,
          metadata: { amount, reason },
        });
      }

      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Update user balance (this will fail until Prisma client is regenerated)
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            creditsBalance: {
              increment: amount,
            },
          } as any, // Temporary fix for build
          select: { creditsBalance: true } as any,
        });

        // Create transaction record (this will fail until Prisma client is regenerated)
        const transaction = await (tx as any).creditTransaction.create({
          data: {
            userId,
            type: "CREDIT",
            amount,
            reason,
            metadata: metadata || null,
          },
        });

        return {
          success: true,
          newBalance: (updatedUser as any).creditsBalance,
          transactionId: transaction.id,
        };
      });

      return result;
    },
    ERROR_CODES.USER_UPDATE_FAILED,
    {
      operation: "add_credits",
      userId,
      metadata: { amount, reason, metadata },
    },
    `Added ${amount} credits to user account`
  );
}

/**
 * Deduct credits from user account (AI usage, purchases)
 */
export async function deductCredits(
  userId: string,
  amount: number,
  reason: string,
  sessionId?: string,
  metadata?: Record<string, any>
): Promise<CreditOperationResult> {
  return await logger.wrapOperation(
    async () => {
      if (amount <= 0) {
        logger.logErrorAndThrow(ERROR_CODES.VALIDATION_FAILED, new Error("Credit amount must be positive"), {
          operation: "deduct_credits",
          userId,
          metadata: { amount, reason },
        });
      }

      // Check sufficient balance first
      const currentBalance = await getUserCreditsBalance(userId);
      if (currentBalance < amount) {
        logger.logErrorAndThrow(
          ERROR_CODES.VALIDATION_FAILED,
          new Error(`Insufficient credits. Required: ${amount}, Available: ${currentBalance}`),
          {
            operation: "deduct_credits",
            userId,
            sessionId,
            metadata: { amount, reason, currentBalance },
          }
        );
      }

      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Update user balance (this will fail until Prisma client is regenerated)
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            creditsBalance: {
              decrement: amount,
            },
          } as any, // Temporary fix for build
          select: { creditsBalance: true } as any,
        });

        // Create transaction record (this will fail until Prisma client is regenerated)
        const transaction = await (tx as any).creditTransaction.create({
          data: {
            userId,
            type: "DEBIT",
            amount,
            reason,
            sessionId: sessionId || null,
            metadata: metadata || null,
          },
        });

        return {
          success: true,
          newBalance: (updatedUser as any).creditsBalance,
          transactionId: transaction.id,
        };
      });

      return result;
    },
    ERROR_CODES.USER_UPDATE_FAILED,
    {
      operation: "deduct_credits",
      userId,
      sessionId,
      metadata: { amount, reason, metadata },
    },
    `Deducted ${amount} credits from user account`
  );
}

/**
 * Get user's credit transaction history
 */
export async function getUserCreditHistory(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<CreditTransaction[]> {
  return await logger.wrapOperation(
    async () => {
      // This will fail until Prisma client is regenerated
      const transactions = await (prisma as any).creditTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          userId: true,
          type: true,
          amount: true,
          reason: true,
          sessionId: true,
          metadata: true,
          createdAt: true,
        },
      });

      return transactions;
    },
    ERROR_CODES.USER_NOT_FOUND,
    {
      operation: "get_user_credit_history",
      userId,
      metadata: { limit, offset },
    }
  );
}

// =========================
// AI Usage Cost Calculations
// =========================

/**
 * Calculate credits cost for AI message based on model and token usage
 */
export async function calculateAIMessageCost(
  modelCode: keyof typeof AI_MODEL_PRICING_USD,
  inputTokens: number,
  outputTokens: number
): Promise<number> {
  return await logger.wrapOperation(
    async () => {
      try {
        return calculateCreditsFromTokens(modelCode, inputTokens, outputTokens);
      } catch (error) {
        logger.logErrorAndThrow(ERROR_CODES.CHAT_UNSUPPORTED_MODEL, error, {
          operation: "calculate_ai_message_cost",
          metadata: { modelCode },
        });
        return 0; // Never reached but satisfies TypeScript
      }
    },
    ERROR_CODES.CHAT_UNSUPPORTED_MODEL,
    {
      operation: "calculate_ai_message_cost",
      metadata: { modelCode, inputTokens, outputTokens },
    }
  );
}

/**
 * Estimate credits cost for AI message (rough estimate before processing)
 */
export async function estimateAIMessageCost(
  content: string,
  modelCode: keyof typeof AI_MODEL_PRICING_USD
): Promise<number> {
  return await logger.wrapOperation(
    async () => {
      try {
        return estimateCreditsFromContent(content, modelCode);
      } catch (error) {
        logger.logErrorAndThrow(ERROR_CODES.CHAT_UNSUPPORTED_MODEL, error, {
          operation: "estimate_ai_message_cost",
          metadata: { modelCode, contentLength: content.length },
        });
        return 0; // Never reached but satisfies TypeScript
      }
    },
    ERROR_CODES.CHAT_UNSUPPORTED_MODEL,
    {
      operation: "estimate_ai_message_cost",
      metadata: { modelCode, contentLength: content.length },
    }
  );
}

// =========================
// Admin Operations
// =========================

/**
 * Admin function to adjust user credits (support, refunds, bonuses)
 */
export async function adminAdjustCredits(
  adminUserId: string,
  targetUserId: string,
  amount: number, // Can be positive (add) or negative (deduct)
  reason: string
): Promise<CreditOperationResult> {
  return await logger.wrapOperation(
    async () => {
      // Verify admin permissions (this would need to be expanded based on your auth system)
      const admin = await prisma.user.findUnique({
        where: { id: adminUserId },
        select: { role: true },
      });

      if (!admin || admin.role !== "admin") {
        logger.logErrorAndThrow(ERROR_CODES.AUTH_UNAUTHORIZED, new Error("Admin access required"), {
          operation: "admin_adjust_credits",
          userId: adminUserId,
          metadata: { targetUserId, amount, reason },
        });
      }

      if (amount === 0) {
        logger.logErrorAndThrow(ERROR_CODES.VALIDATION_FAILED, new Error("Adjustment amount cannot be zero"), {
          operation: "admin_adjust_credits",
          userId: adminUserId,
          metadata: { targetUserId, amount, reason },
        });
      }

      // For negative adjustments, check sufficient balance
      if (amount < 0) {
        const currentBalance = await getUserCreditsBalance(targetUserId);
        if (currentBalance < Math.abs(amount)) {
          logger.logErrorAndThrow(
            ERROR_CODES.VALIDATION_FAILED,
            new Error(
              `Insufficient credits for deduction. Required: ${Math.abs(amount)}, Available: ${currentBalance}`
            ),
            {
              operation: "admin_adjust_credits",
              userId: adminUserId,
              metadata: { targetUserId, amount, reason, currentBalance },
            }
          );
        }
      }

      const result = await prisma.$transaction(async (tx) => {
        // Update user balance
        const updatedUser = await tx.user.update({
          where: { id: targetUserId },
          data: {
            creditsBalance: {
              increment: amount, // Can be positive or negative
            },
          } as any, // Temporary fix for build
          select: { creditsBalance: true } as any,
        });

        // Create transaction record
        const transaction = await (tx as any).creditTransaction.create({
          data: {
            userId: targetUserId,
            type: amount > 0 ? "CREDIT" : "DEBIT",
            amount: Math.abs(amount),
            reason: `admin_adjustment: ${reason}`,
            metadata: {
              adminUserId,
              originalAmount: amount,
              adjustmentType: amount > 0 ? "bonus" : "deduction",
            },
          },
        });

        return {
          success: true,
          newBalance: (updatedUser as any).creditsBalance,
          transactionId: transaction.id,
        };
      });

      return result;
    },
    ERROR_CODES.USER_UPDATE_FAILED,
    {
      operation: "admin_adjust_credits",
      userId: adminUserId,
      metadata: { targetUserId, amount, reason },
    },
    `Admin adjusted credits: ${amount > 0 ? "+" : ""}${amount} for user ${targetUserId}`
  );
}

// =========================
// Utility Functions
// =========================

/**
 * Check if user has sufficient credits for an operation
 */
export async function checkSufficientCredits(userId: string, requiredCredits: number): Promise<boolean> {
  const balance = await getUserCreditsBalance(userId);
  return balance >= requiredCredits;
}
