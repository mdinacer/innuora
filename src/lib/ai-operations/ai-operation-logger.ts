/**
 * AI Operation Logger
 *
 * Logs all AI operations to database for:
 * - Billing reconciliation
 * - Cost analytics
 * - Usage tracking
 * - Performance monitoring
 *
 * This data is NEVER sent to client - server-only analytics
 */

import { AiOperationType } from "@prisma/client";

import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { ModelTokenUsage } from "@/types/ai-model.types";

/**
 * Context for logging an AI operation
 */
export interface AiOperationContext {
  userId: string;
  sessionId: string;
  messageId?: string;
  operation: AiOperationType;
  model: string;
  tokenUsage: ModelTokenUsage;
  creditsCharged: number;
  rawCostUSD?: number;
  metadata?: Record<string, any>;
}

/**
 * Logs an AI operation to the database
 *
 * @param context - Operation context with all relevant data
 *
 * @example
 * await logAiOperation({
 *   userId: "user123",
 *   sessionId: "session456",
 *   operation: "ANALYSIS",
 *   model: "gpt-4o-mini",
 *   tokenUsage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
 *   creditsCharged: 2,
 *   rawCostUSD: 0.0003
 * });
 */
export async function logAiOperation(context: AiOperationContext): Promise<void> {
  const result = await logger.wrapOperation(
    async () => {
      await prisma.aiOperationLog.create({
        data: {
          userId: context.userId,
          sessionId: context.sessionId,
          messageId: context.messageId,
          operation: context.operation,
          model: context.model,
          inputTokens: context.tokenUsage.usage?.prompt_tokens || 0,
          outputTokens: context.tokenUsage.usage?.completion_tokens || 0,
          totalTokens: context.tokenUsage.usage?.total_tokens || 0,
          creditsCharged: context.creditsCharged,
          rawCostUSD: context.rawCostUSD || 0,
          metadata: context.metadata || {},
          timestamp: new Date(),
        },
      });
    },
    ERROR_CODES.AI_OPERATION_LOG_FAILED,
    {
      operation: "ai_operation_log",
      userId: context.userId,
      sessionId: context.sessionId,
      metadata: {
        operationType: context.operation,
        model: context.model,
        totalTokens: context.tokenUsage.usage?.total_tokens,
        creditsCharged: context.creditsCharged,
      },
    },
    "AI operation logged successfully"
  );

  if (result.error) {
    throw new Error(result.error.message);
  }
}

/**
 * Gets total tokens used by a user in a time period
 *
 * @param userId - User ID
 * @param startDate - Start of period
 * @param endDate - End of period
 * @returns Total tokens consumed
 */
export async function getUserTokenUsage(userId: string, startDate: Date, endDate: Date): Promise<number> {
  const result = await prisma.aiOperationLog.aggregate({
    where: {
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      totalTokens: true,
    },
  });

  return result._sum.totalTokens || 0;
}

/**
 * Gets total credits charged to a user in a time period
 *
 * @param userId - User ID
 * @param startDate - Start of period
 * @param endDate - End of period
 * @returns Total credits charged
 */
export async function getUserCreditsUsage(userId: string, startDate: Date, endDate: Date): Promise<number> {
  const result = await prisma.aiOperationLog.aggregate({
    where: {
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      creditsCharged: true,
    },
  });

  return result._sum.creditsCharged || 0;
}

/**
 * Gets operation breakdown for a session
 *
 * @param sessionId - Session ID
 * @returns Array of operation logs
 */
export async function getSessionOperations(sessionId: string) {
  return await prisma.aiOperationLog.findMany({
    where: { sessionId },
    orderBy: { timestamp: "asc" },
    select: {
      operation: true,
      model: true,
      totalTokens: true,
      creditsCharged: true,
      rawCostUSD: true,
      timestamp: true,
    },
  });
}

/**
 * Gets cost breakdown by operation type for a user
 *
 * @param userId - User ID
 * @param startDate - Start of period
 * @param endDate - End of period
 * @returns Operation type breakdown
 */
export async function getUserOperationBreakdown(userId: string, startDate: Date, endDate: Date) {
  return await prisma.aiOperationLog.groupBy({
    by: ["operation"],
    where: {
      userId,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      totalTokens: true,
      creditsCharged: true,
      rawCostUSD: true,
    },
    _count: {
      operation: true,
    },
  });
}

/**
 * Gets total raw API costs for billing reconciliation
 *
 * @param startDate - Start of period
 * @param endDate - End of period
 * @returns Total raw costs
 */
export async function getTotalRawCosts(startDate: Date, endDate: Date): Promise<number> {
  const result = await prisma.aiOperationLog.aggregate({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      rawCostUSD: true,
    },
  });

  return result._sum.rawCostUSD || 0;
}

/**
 * Gets total credits charged for revenue calculation
 *
 * @param startDate - Start of period
 * @param endDate - End of period
 * @returns Total credits charged
 */
export async function getTotalCreditsCharged(startDate: Date, endDate: Date): Promise<number> {
  const result = await prisma.aiOperationLog.aggregate({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      creditsCharged: true,
    },
  });

  return result._sum.creditsCharged || 0;
}
