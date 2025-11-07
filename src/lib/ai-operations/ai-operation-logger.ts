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

import { AIModelCategory } from "@/domains/ai-conversation/ai-models";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { ModelTokenUsage } from "@/types/ai-model.types";

const OPERATION_MODEL_MAPPING: Record<AiOperationType, AIModelCategory> = {
  ANALYSIS: "background",
  DIAGNOSTIC: "diagnostic",
  MEMORY_RECALL: "background",
  MEMORY_UPDATE: "background",
  REFLECTION: "reflection",
  RESPONSE: "reflection",
  SESSION_SUMMARY: "auxiliary",
  SESSION_WELLNESS: "background",
  SYNTHESIS: "auxiliary",
  TITLE_UPDATE: "background",
};

function calculateAiCostUSD(usage: ModelTokenUsage): number {
  // Parse environment variables safely
  const inputRate = parseFloat(process.env.AI_MODEL_PRICE_INPUT_PER_1K || "0.0003");
  const outputRate = parseFloat(process.env.AI_MODEL_PRICE_OUTPUT_PER_1K || "0.0006");

  if (isNaN(inputRate) || isNaN(outputRate)) {
    throw new Error("Invalid AI model pricing environment variables.");
  }

  // Compute USD cost
  const inputCost = (usage.promptTokens / 1000) * inputRate;
  const outputCost = (usage.completionTokens / 1000) * outputRate;
  const totalCost = inputCost + outputCost;

  // Round to 6 decimal places for precision
  return Number(totalCost.toFixed(6));
}

/**
 * Context for logging an AI operation
 */
export interface AiOperationContext {
  userId: string;
  sessionId: string;
  messageId?: string;
  operation: AiOperationType;
  tokenUsage: ModelTokenUsage;
  creditsCharged: number;
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
  try {
    await prisma.aiOperationLog.create({
      data: {
        userId: context.userId,
        sessionId: context.sessionId,
        messageId: context.messageId,
        operation: context.operation,
        model: OPERATION_MODEL_MAPPING[context.operation],
        inputTokens: context.tokenUsage.promptTokens || 0,
        outputTokens: context.tokenUsage.completionTokens || 0,
        totalTokens: context.tokenUsage.totalTokens || 0,
        creditsCharged: context.creditsCharged,
        rawCostUSD: calculateAiCostUSD(context.tokenUsage),
        metadata: context.metadata || {},
        timestamp: new Date(),
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    await logger.logError("AI operation log failed", {
      operation: "ai_operation_log",
      userId: context.userId,
      sessionId: context.sessionId,
      metadata: {
        operationType: context.operation,
        model: OPERATION_MODEL_MAPPING[context.operation],
        totalTokens: context.tokenUsage.totalTokens,
        creditsCharged: context.creditsCharged,
      },
    });
    throw err;
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
