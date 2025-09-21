"use server";

// =========================
// Types and Constants
// =========================

// Import proper types from Prisma

// Use Prisma-generated type
import type { CreditTransaction } from "@prisma/client";

import {
  AI_MODEL_PRICING_USD,
  calculateCreditsFromTokens,
  estimateCreditsFromContent,
} from "@/lib/credits/credits-utils";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";

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
export async function getUserCreditsBalance(authId: string): Promise<number> {
  return await logger.wrapOperation(
    async () => {
      // Get user credits balance
      const user = await prisma.user.findUnique({
        where: { authId: authId },
        select: { creditsBalance: true },
      });

      if (!user) {
        logger.logErrorAndThrow(ERROR_CODES.USER_NOT_FOUND, new Error(`User not found: ${authId}`), {
          operation: "get_user_credits_balance",
          metadata: { authId },
        });
      }

      return user?.creditsBalance || 0;
    },
    ERROR_CODES.USER_NOT_FOUND,
    {
      operation: "get_user_credits_balance",
      metadata: { authId },
    }
  );
}

/**
 * Add credits to user account (purchases, bonuses, refunds)
 */
export async function addCredits(
  authId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, any>
): Promise<CreditOperationResult> {
  return await logger.wrapOperation(
    async () => {
      if (amount <= 0) {
        logger.logErrorAndThrow(ERROR_CODES.VALIDATION_FAILED, new Error("Credit amount must be positive"), {
          operation: "add_credits",
          metadata: { authId, amount, reason },
        });
      }

      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Update user balance
        const updatedUser = await tx.user.update({
          where: { authId: authId },
          data: {
            creditsBalance: {
              increment: amount,
            },
          },
          select: { id: true, creditsBalance: true },
        });

        // Create transaction record
        const transaction = await tx.creditTransaction.create({
          data: {
            userId: updatedUser.id,
            type: "CREDIT",
            amount,
            reason,
            metadata: metadata,
          },
        });

        return {
          success: true,
          newBalance: updatedUser.creditsBalance,
          transactionId: transaction.id,
        };
      });

      return result;
    },
    ERROR_CODES.USER_UPDATE_FAILED,
    {
      operation: "add_credits",
      metadata: { authId, amount, reason, ...metadata },
    },
    `Added ${amount} credits to user account`
  );
}

/**
 * Deduct credits from user account (AI usage, purchases)
 */
export async function deductCredits(
  authId: string,
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
          metadata: { authId, amount, reason },
        });
      }

      // Check sufficient balance first
      const currentBalance = await getUserCreditsBalance(authId);
      if (currentBalance < amount) {
        logger.logErrorAndThrow(
          ERROR_CODES.VALIDATION_FAILED,
          new Error(`Insufficient credits. Required: ${amount}, Available: ${currentBalance}`),
          {
            operation: "deduct_credits",
            sessionId,
            metadata: { authId, amount, reason, currentBalance },
          }
        );
      }

      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        // Update user balance
        const updatedUser = await tx.user.update({
          where: { authId: authId },
          data: {
            creditsBalance: {
              decrement: amount,
            },
          },
          select: { id: true, creditsBalance: true },
        });

        // Create transaction record
        const transaction = await tx.creditTransaction.create({
          data: {
            userId: updatedUser.id,
            type: "DEBIT",
            amount,
            reason,
            sessionId: sessionId || null,
            metadata: metadata,
          },
        });

        return {
          success: true,
          newBalance: updatedUser.creditsBalance,
          transactionId: transaction.id,
        };
      });

      return result;
    },
    ERROR_CODES.USER_UPDATE_FAILED,
    {
      operation: "deduct_credits",
      sessionId,
      metadata: { authId, amount, reason, ...metadata },
    },
    `Deducted ${amount} credits from user account`
  );
}

/**
 * Get user's credit transaction history
 */
export async function getUserCreditHistory(
  authId: string,
  limit: number = 50,
  offset: number = 0
): Promise<CreditTransaction[]> {
  return await logger.wrapOperation(
    async () => {
      // Get user first to resolve authId to userId
      const user = await prisma.user.findUnique({
        where: { authId },
        select: { id: true },
      });

      if (!user) {
        throw new Error(`User not found: ${authId}`);
      }

      // Get user credit transactions
      const transactions = await prisma.creditTransaction.findMany({
        where: { userId: user.id },
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
      metadata: { authId, limit, offset },
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
        // targetUserId is database User.id, convert to authId for getUserCreditsBalance
        const targetUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { authId: true },
        });
        if (!targetUser?.authId) {
          throw new Error(`Target user authId not found: ${targetUserId}`);
        }
        const currentBalance = await getUserCreditsBalance(targetUser.authId);
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
          },
          select: { creditsBalance: true },
        });

        // Create transaction record
        const transaction = await tx.creditTransaction.create({
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
          newBalance: updatedUser.creditsBalance,
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
export async function checkSufficientCredits(authId: string, requiredCredits: number): Promise<boolean> {
  const balance = await getUserCreditsBalance(authId);
  return balance >= requiredCredits;
}

/**
 * Optimized credit check and deduction in single transaction
 * Avoids double database calls during chat flow
 */
export async function checkAndDeductCredits(
  authId: string,
  amount: number,
  reason: string,
  sessionId?: string,
  metadata?: Record<string, any>
): Promise<CreditOperationResult> {
  return await logger.wrapOperation(
    async () => {
      if (amount <= 0) {
        logger.logErrorAndThrow(ERROR_CODES.VALIDATION_FAILED, new Error("Credit amount must be positive"), {
          operation: "check_and_deduct_credits",
          metadata: { authId, amount, reason },
        });
      }

      // Single transaction for check + deduct
      const result = await prisma.$transaction(async (tx) => {
        // Get current balance
        const user = await tx.user.findUnique({
          where: { authId: authId },
          select: { id: true, creditsBalance: true },
        });

        if (!user) {
          throw new Error(`User not found: ${authId}`);
        }

        // Check sufficient balance
        if (user.creditsBalance < amount) {
          throw new Error(`Insufficient credits. Required: ${amount}, Available: ${user.creditsBalance}`);
        }

        // Update user balance
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            creditsBalance: {
              decrement: amount,
            },
          },
          select: { creditsBalance: true },
        });

        // Create transaction record
        const transaction = await tx.creditTransaction.create({
          data: {
            userId: user.id,
            type: "DEBIT",
            amount,
            reason,
            sessionId,
            metadata: metadata,
          },
          select: { id: true },
        });

        return {
          success: true,
          newBalance: updatedUser.creditsBalance,
          transactionId: transaction.id,
        };
      });

      logger.logInfo("Credits deducted successfully", {
        operation: "check_and_deduct_credits",
        sessionId,
        metadata: { authId, amount, reason, newBalance: result.newBalance },
      });

      return result;
    },
    ERROR_CODES.VALIDATION_FAILED,
    {
      operation: "check_and_deduct_credits",
      metadata: { authId, amount, reason, sessionId },
    }
  );
}
