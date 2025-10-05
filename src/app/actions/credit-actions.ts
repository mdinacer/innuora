"use server";

// =========================
// Types and Constants
// =========================
import type { CreditTransaction } from "@prisma/client";

import { getAuthenticatedUserContext } from "@/app/actions/user-context";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types/action-result";

interface CreditOperationResult {
  success: boolean;
  newBalance: number;
  transactionId: string;
}

// =========================
// Internal Helper Functions (NOT exported to client)
// =========================

/**
 * Internal: Get user credits balance by authId
 * Used by webhooks, admin functions, and other server-side code
 * NOT called directly from client
 */
async function _getUserCreditsBalanceInternal(authId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { authId },
    select: { creditsBalance: true },
  });

  if (!user) {
    throw new Error(`User not found: ${authId}`);
  }

  return user.creditsBalance || 0;
}

/**
 * Internal: Add credits by authId
 * Used by webhooks and admin functions
 * NOT called directly from client
 */
async function _addCreditsInternal(
  authId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, any>
): Promise<CreditOperationResult> {
  if (amount <= 0) {
    throw new Error("Credit amount must be positive");
  }

  // Use transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Update user balance
    const updatedUser = await tx.user.update({
      where: { authId },
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
        metadata,
      },
    });

    return {
      success: true,
      newBalance: updatedUser.creditsBalance,
      transactionId: transaction.id,
    };
  });

  return result;
}

/**
 * Internal: Deduct credits by authId
 * Used by webhooks and admin functions
 * NOT called directly from client
 */
async function _deductCreditsInternal(
  authId: string,
  amount: number,
  reason: string,
  sessionId?: string,
  metadata?: Record<string, any>
): Promise<CreditOperationResult> {
  if (amount <= 0) {
    throw new Error("Credit amount must be positive");
  }

  // Check sufficient balance first
  const currentBalance = await _getUserCreditsBalanceInternal(authId);
  if (currentBalance < amount) {
    throw new Error(`Insufficient credits. Required: ${amount}, Available: ${currentBalance}`);
  }

  // Use transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Update user balance
    const updatedUser = await tx.user.update({
      where: { authId },
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
        sessionId,
        metadata,
      },
    });

    return {
      success: true,
      newBalance: updatedUser.creditsBalance,
      transactionId: transaction.id,
    };
  });

  return result;
}

// =========================
// Public API Functions (Called from client)
// =========================

/**
 * Get current user's credits balance
 * Fetches from authenticated session - NO authId parameter needed
 */
export async function getUserCreditsBalance(): Promise<ActionResult<number>> {
  return await logger.wrapOperation(
    async () => {
      // Get authenticated user from session (single DB call)
      const userContext = await getAuthenticatedUserContext();

      // Return balance from context (no additional DB call needed)
      return userContext.creditsBalance;
    },
    ERROR_CODES.USER_NOT_FOUND,
    {
      operation: "get_user_credits_balance",
    }
  );
}

/**
 * Internal export for webhooks/admin: Get user credits balance by authId
 * Use this ONLY from other server actions, NOT from client code
 */
export async function getUserCreditsBalanceByAuthId(authId: string): Promise<ActionResult<number>> {
  return await logger.wrapOperation(
    async () => {
      return await _getUserCreditsBalanceInternal(authId);
    },
    ERROR_CODES.USER_NOT_FOUND,
    {
      operation: "get_user_credits_balance_by_auth_id",
      metadata: { authId },
    }
  );
}

/**
 * Internal: Add credits to user account by authId
 * Used ONLY by webhooks and server-side operations
 * NOT called directly from client
 */
export async function addCreditsToUser(
  authId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, any>
): Promise<ActionResult<CreditOperationResult>> {
  return await logger.wrapOperation(
    async () => {
      return await _addCreditsInternal(authId, amount, reason, metadata);
    },
    ERROR_CODES.USER_UPDATE_FAILED,
    {
      operation: "add_credits_to_user",
      metadata: { authId, amount, reason, ...metadata },
    },
    `Added ${amount} credits to user account`
  );
}

/**
 * Internal: Deduct credits from user account by authId
 * Used ONLY by server-side AI operations and internal processes
 * NOT called directly from client
 */
export async function deductCreditsFromUser(
  authId: string,
  amount: number,
  reason: string,
  sessionId?: string,
  metadata?: Record<string, any>
): Promise<ActionResult<CreditOperationResult>> {
  return await logger.wrapOperation(
    async () => {
      return await _deductCreditsInternal(authId, amount, reason, sessionId, metadata);
    },
    ERROR_CODES.USER_UPDATE_FAILED,
    {
      operation: "deduct_credits_from_user",
      sessionId,
      metadata: { authId, amount, reason, ...metadata },
    },
    `Deducted ${amount} credits from user account`
  );
}

/**
 * Get current user's credit transaction history
 * Fetches from authenticated session - NO authId parameter needed
 */
export async function getUserCreditHistory(
  limit: number = 50,
  offset: number = 0
): Promise<ActionResult<CreditTransaction[]>> {
  return await logger.wrapOperation(
    async () => {
      // Get authenticated user from session (single DB call)
      const userContext = await getAuthenticatedUserContext();

      // Get user credit transactions
      const transactions = await prisma.creditTransaction.findMany({
        where: { userId: userContext.id },
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
      metadata: { limit, offset },
    }
  );
}

/**
 * Internal export for admin: Get user credit history by authId
 * Use this ONLY from admin operations, NOT from client code
 */
export async function getUserCreditHistoryByAuthId(
  authId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ActionResult<CreditTransaction[]>> {
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
      operation: "get_user_credit_history_by_auth_id",
      metadata: { authId, limit, offset },
    }
  );
}

// =========================
// Admin Operations
// =========================

/**
 * Admin function to adjust user credits (support, refunds, bonuses)
 * Gets admin from authenticated session - NO adminUserId parameter needed
 */
export async function adminAdjustCredits(
  targetUserId: string,
  amount: number, // Can be positive (add) or negative (deduct)
  reason: string
): Promise<ActionResult<CreditOperationResult>> {
  return await logger.wrapOperation(
    async () => {
      // Get authenticated admin from session
      const adminContext = await getAuthenticatedUserContext();

      // Verify admin permissions
      if (adminContext.role !== "admin") {
        logger.logErrorAndThrow(ERROR_CODES.AUTH_UNAUTHORIZED, new Error("Admin access required"), {
          operation: "admin_adjust_credits",
          userId: adminContext.id,
          metadata: { targetUserId, amount, reason },
        });
      }

      if (amount === 0) {
        logger.logErrorAndThrow(ERROR_CODES.VALIDATION_FAILED, new Error("Adjustment amount cannot be zero"), {
          operation: "admin_adjust_credits",
          userId: adminContext.id,
          metadata: { targetUserId, amount, reason },
        });
      }

      // For negative adjustments, check sufficient balance
      if (amount < 0) {
        // targetUserId is database User.id, get balance directly
        const targetUser = await prisma.user.findUnique({
          where: { id: targetUserId },
          select: { creditsBalance: true },
        });
        if (!targetUser) {
          throw new Error(`Target user not found: ${targetUserId}`);
        }
        const currentBalance = targetUser.creditsBalance;
        if (currentBalance < Math.abs(amount)) {
          logger.logErrorAndThrow(
            ERROR_CODES.VALIDATION_FAILED,
            new Error(
              `Insufficient credits for deduction. Required: ${Math.abs(amount)}, Available: ${currentBalance}`
            ),
            {
              operation: "admin_adjust_credits",
              userId: adminContext.id,
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
              adminUserId: adminContext.id,
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
      metadata: { targetUserId, amount, reason },
    },
    `Admin adjusted credits: ${amount > 0 ? "+" : ""}${amount} for user ${targetUserId}`
  );
}

// =========================
// Utility Functions
// =========================

/**
 * Check if current user has sufficient credits for an operation
 * Fetches from authenticated session - NO authId parameter needed
 */
export async function checkSufficientCredits(requiredCredits: number): Promise<boolean> {
  const result = await getUserCreditsBalance();
  if (result.error) {
    return false;
  }
  return result.data >= requiredCredits;
}

/**
 * Internal export for server operations: Check if user has sufficient credits by authId
 * Use this ONLY from server-side operations, NOT from client code
 */
export async function checkSufficientCreditsForUser(authId: string, requiredCredits: number): Promise<boolean> {
  const result = await getUserCreditsBalanceByAuthId(authId);
  if (result.error) {
    return false;
  }
  return result.data >= requiredCredits;
}
