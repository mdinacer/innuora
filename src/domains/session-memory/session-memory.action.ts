"use server";

import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { deductCreditsFromUser } from "@/app/actions/credit-actions";
import { getAuthenticatedUserContext } from "@/app/actions/user-context";
import CHAT_MEMORY_BUILD_INSTRUCTIONS from "@/domains/session-memory/session-memory.prompt";
import { formatUserInputForMemory } from "@/domains/session-memory/session-memory.utils";
import { logAiOperation } from "@/lib/ai-operations/ai-operation-logger";
import { logger } from "@/lib/logging/unified-logger";
import { getSessionContext, SessionContext, updateSessionContext } from "@/lib/session/session-context-service";
import type { ActionResult } from "@/types/action-result";
import type { AiMessageResponse } from "@/types/ai-model.types";

interface SessionMemoryResult {
  memory: string;
  tokenUsage: AiMessageResponse["modelTokenUsage"];
  creditsUsed: number;
}

/**
 * Generates optimized session memory from user input
 *
 * NOTE: Now fetches existing memory from SERVER-SIDE encrypted storage
 * and saves new memory back to server. Client no longer manages memory.
 *
 * SECURITY: Validates authenticated user owns the session
 */
export async function generateSessionMemory(
  userInput: string,
  authId?: string,
  sessionId?: string
): Promise<ActionResult<SessionMemoryResult>> {
  // Get authenticated user for ownership validation
  const authenticatedUser = await getAuthenticatedUserContext();

  if (!userInput) {
    return {
      data: null,
      error: { code: "VALIDATION_FAILED", message: "User input is required" },
    };
  }

  if (!sessionId) {
    return {
      data: null,
      error: { code: "VALIDATION_FAILED", message: "Session ID is required" },
    };
  }

  // Fetch existing memory from server-side encrypted storage WITH ownership validation
  const sessionContext = await getSessionContext(sessionId, authenticatedUser.id);
  const existingMemory = sessionContext.memoryStore;

  const formattedUserMessage = formatUserInputForMemory(userInput);
  const memoryToInclude = existingMemory || "No existing memory.";

  const prompt = {
    role: "system",
    content: CHAT_MEMORY_BUILD_INSTRUCTIONS.replace("{{user_message}}", formattedUserMessage).replace(
      "{{existing_memory}}",
      memoryToInclude
    ),
  } as ChatCompletionMessageParam;

  // Use GPT-4.1-mini for cost optimization
  const result = await processAiPromptsWithRetry([prompt], {
    model: "mini", // GPT-4.1-mini for memory operations
  });

  if (result.error) {
    return { data: null, error: result.error };
  }

  const aiResponse = result.data!;

  // Deduct credits for memory operation (using authenticated user's authId)
  if (aiResponse.consumedCredits > 0) {
    const deductResult = await deductCreditsFromUser(
      authenticatedUser.authId,
      aiResponse.consumedCredits,
      "ai_memory_update",
      sessionId,
      {
        operation: "session_memory_generation",
        tokensUsed: aiResponse.modelTokenUsage?.totalTokens || 0,
      }
    );

    if (deductResult.error) {
      logger.logWarning("Credit deduction failed for memory update", {
        operation: "session_memory_credit_deduction_failed",
        sessionId,
        metadata: {
          authId: authenticatedUser.authId,
          creditsUsed: aiResponse.consumedCredits,
          error: deductResult.error.message,
        },
      });
    }
  }

  // Save new memory to server-side encrypted storage (non-blocking)
  updateSessionContext(sessionId, {
    memoryStore: aiResponse.message,
  }).catch((error) => {
    logger.logWarning("Failed to update server-side memory context", {
      operation: "session_memory_update_context_failed",
      sessionId,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  });

  return {
    data: {
      memory: aiResponse.message,
      tokenUsage: aiResponse.modelTokenUsage,
      creditsUsed: aiResponse.consumedCredits,
    },
    error: null,
  };
}
export async function generateSessionMemoryFromCurrentSession(
  sessionContext: SessionContext,
  userInput: string,
  authId: string
): Promise<ActionResult<SessionMemoryResult>> {
  if (!userInput) {
    return {
      data: null,
      error: { code: "VALIDATION_FAILED", message: "User input is required" },
    };
  }

  // Fetch existing memory from server-side encrypted storage
  const existingMemory = sessionContext.memoryStore;
  const sessionId = sessionContext.sessionId;

  const formattedUserMessage = formatUserInputForMemory(userInput);
  const memoryToInclude = existingMemory || "No existing memory.";

  const prompt = {
    role: "system",
    content: CHAT_MEMORY_BUILD_INSTRUCTIONS.replace("{{user_message}}", formattedUserMessage).replace(
      "{{existing_memory}}",
      memoryToInclude
    ),
  } as ChatCompletionMessageParam;

  // Use GPT-4.1-mini for cost optimization
  const result = await processAiPromptsWithRetry([prompt], {
    model: "mini", // GPT-4.1-mini for memory operations
  });

  if (result.error) {
    return { data: null, error: result.error };
  }

  const aiResponse = result.data!;

  // Deduct credits for memory operation
  if (authId && aiResponse.consumedCredits > 0) {
    const deductResult = await deductCreditsFromUser(
      authId,
      aiResponse.consumedCredits,
      "ai_memory_update",
      sessionId,
      {
        operation: "session_memory_generation",
        tokensUsed: aiResponse.modelTokenUsage?.totalTokens || 0,
      }
    );

    if (deductResult.error) {
      logger.logWarning("Credit deduction failed for memory update", {
        operation: "session_memory_credit_deduction_failed",
        sessionId,
        metadata: {
          authId,
          creditsUsed: aiResponse.consumedCredits,
          error: deductResult.error.message,
        },
      });
    }
  }

  // Save new memory to server-side encrypted storage (non-blocking)
  updateSessionContext(sessionId, {
    memoryStore: aiResponse.message,
  }).catch((error) => {
    logger.logWarning("Failed to update server-side memory context", {
      operation: "session_memory_update_context_failed",
      sessionId,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  });

  // Log AI operation (fire-and-forget)
  if (aiResponse.modelTokenUsage && sessionContext.userId) {
    logAiOperation({
      userId: sessionContext.userId,
      sessionId: sessionContext.sessionId,
      operation: "MEMORY_UPDATE",
      tokenUsage: aiResponse.modelTokenUsage,
      creditsCharged: aiResponse.consumedCredits || 0,
    }).catch((error) => {
      logger.logWarning("Failed to log AI operation", {
        operation: "session_memory_log_ai_operation_failed",
        sessionId: sessionContext.sessionId,
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });
    });
  }

  return {
    data: {
      memory: aiResponse.message,
      tokenUsage: aiResponse.modelTokenUsage,
      creditsUsed: aiResponse.consumedCredits,
    },
    error: null,
  };
}
