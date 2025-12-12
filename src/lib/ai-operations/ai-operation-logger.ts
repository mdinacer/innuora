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

import { AIModelCategory, calculateModelCostUsd } from "@/domains/ai-conversation/ai-models";
import { ModelTokenUsage } from "@/domains/shared-types";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";

const OPERATION_MODEL_MAPPING: Record<AiOperationType, AIModelCategory> = {
  DIRECTIVE: "background",
  MEMORY_ANALYSIS: "background",
  REFLECTION: "reflection",
  SESSION_WELLNESS: "background",
};

/**
 * Context for logging an AI operation
 */
export interface AiOperationContext {
  userId: string;
  sessionId: string;
  messageId?: string;
  aiModel: AIModelCategory;
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
        rawCostUSD: calculateModelCostUsd(context.aiModel, context.tokenUsage).total,
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
