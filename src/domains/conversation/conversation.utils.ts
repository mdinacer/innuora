import { AiOperationType } from "@prisma/client";

import { AIModelCategory } from "@/domains/ai-conversation/ai-models";
import { logAiOperation } from "@/lib/ai-operations/ai-operation-logger";

export async function logOperation(
  userId: string,
  sessionId: string,
  operation: AiOperationType,
  aiModel: AIModelCategory,
  tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number; cachedTokens?: number } | null,
  creditsCharged: number,
  elapsedMs: number
): Promise<void> {
  if (!tokenUsage) return;

  await logAiOperation({
    userId,
    sessionId,
    aiModel,
    operation,
    tokenUsage: {
      promptTokens: tokenUsage.promptTokens,
      completionTokens: tokenUsage.completionTokens,
      totalTokens: tokenUsage.totalTokens,
      cachedTokens: tokenUsage.cachedTokens ?? 0,
      timestamp: new Date().toISOString(),
      responseLength: 0,
    },
    creditsCharged,
    metadata: {
      modelCode: aiModel,
      success: true,
      latencyMs: elapsedMs,
    },
  });
}
