"use server";

/* eslint-disable @typescript-eslint/no-use-before-define */
import { deductCreditsFromUser } from "@/app/actions/credit-actions";
import { getAuthenticatedUserContext } from "@/app/actions/user-context";
import { generateSessionMemoryFromCurrentSession } from "@/domains/session-memory/session-memory.action";
import { analyzeUserInput } from "@/domains/therapeutic-analysis/therapeutic-analysis.action";
import { logAiOperation } from "@/lib/ai-operations/ai-operation-logger";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { getSessionContext, SessionContext, updateSessionContext } from "@/lib/session/session-context-service";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { generateHolisticResponse } from "../services/conversation-engine.service";
import { DEFAULT_RELATIONAL_TRACE } from "../types/relational-trace.types";

interface HandleHolisticInputResult {
  response: string;
  creditsUsed: number;
  signals?: {
    resistance: "none" | "sarcasm" | "dismissive" | "intellectualized";
    crisis: "none" | "acute";
  };
}

/**
 * Handles user input through holistic conversation engine.
 * Complete orchestration: validation → context → AI → logging → credits
 *
 * Following open-chat.action.ts pattern:
 * - Server action receives messages from client (E2EE)
 * - Gets session context (server-encrypted relationalTrace)
 * - Security protocol included
 * - AI operation logging
 * - Credit deduction
 */
export async function handleHolisticUserInput(
  userInput: string,
  messages: OpenChatMessage[] = [],
  locale: AppLocales = "en",
  sessionId?: string,
  messageId?: string
): Promise<HandleHolisticInputResult> {
  // Step 1: Get authenticated user
  const authenticatedUser = await getAuthenticatedUserContext();

  try {
    // Step 2: Validate input
    if (!userInput?.trim()) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_INVALID_INPUT, new Error("User input cannot be empty"), {
        operation: "holistic_conversation_handle_input",
        userId: authenticatedUser.id,
        sessionId,
      });
    }

    if (!sessionId) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_INVALID_INPUT, new Error("Session ID is required"), {
        operation: "holistic_conversation_handle_input",
        userId: authenticatedUser.id,
      });
    }

    // Step 3: Fetch server-side session context (NEVER sent to client)
    const sessionContext = await getSessionContext(sessionId as string, authenticatedUser.id);
    const contextData = sessionContext as any; // ServerDataContent includes relationalTrace, memoryStore
    const relationalTrace = contextData.relationalTrace || DEFAULT_RELATIONAL_TRACE;
    const memoryStore = contextData.memoryStore || null;

    // Step 4: Build conversation window (last 6-10 messages, exclude system messages)
    const conversation_window = messages
      .filter(
        (msg): msg is OpenChatMessage & { role: "user" | "assistant" } =>
          msg.role === "user" || msg.role === "assistant"
      )
      .slice(-8)
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Step 5: Build engine input (always include memory when available)
    const engineInput = {
      conversation_window,
      current_user_message: userInput,
      relational_trace: relationalTrace,
      session_memory: memoryStore || undefined, // Always inject when available
    };

    // Step 6: Fetch user profile for personalization (server-side)
    const userProfile = await prisma.profile.findUnique({
      where: { userId: authenticatedUser.id },
    });

    // Step 7: Generate holistic response (with profile for personalization)
    const { output, modelTokenUsage, consumedCredits } = await generateHolisticResponse(
      engineInput,
      locale,
      userProfile
    );

    // Step 8: Process credit deduction
    const creditsUsed = await processCreditsDeduction(
      authenticatedUser.authId,
      authenticatedUser.id,
      consumedCredits || 0,
      userInput,
      output.reflection,
      sessionId
    );

    // Step 9: Update server-side context with new relational trace (background)
    updateSessionContext(
      sessionId as string,
      {
        relationalTrace: output.next_relational_trace,
      } as any
    ).catch((error) => {
      logger.logWarning("Failed to update relational trace", {
        operation: "holistic_conversation_update_trace_failed",
        sessionId,
        userId: authenticatedUser.authId,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    });

    // Step 10: Log AI operation (fire-and-forget)
    if (modelTokenUsage && sessionContext.userId) {
      logAiOperation({
        userId: sessionContext.userId,
        sessionId: sessionContext.sessionId,
        messageId,
        operation: "RESPONSE", // Holistic conversation response
        tokenUsage: modelTokenUsage,
        creditsCharged: creditsUsed,
      }).catch((error) => {
        logger.logWarning("Failed to log AI operation", {
          operation: "holistic_conversation_log_ai_operation_failed",
          sessionId,
          metadata: { error: error instanceof Error ? error.message : String(error) },
        });
      });
    }

    // Step 11: Return response with signals
    const result = {
      response: output.reflection,
      creditsUsed,
      signals: output.signals,
    };

    // Step 12: Background therapeutic analysis (FIRE-AND-FORGET)
    // Runs after response sent to user - non-blocking
    handleBackgroundAnalysis(
      userInput,
      sessionContext,
      authenticatedUser.id,
      sessionId as string,
      conversation_window,
      messageId
    ).catch((error) => {
      logger.logWarning("Background therapeutic analysis failed", {
        operation: "holistic_conversation_background_analysis_failed",
        sessionId,
        userId: authenticatedUser.id,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
    });

    return result;
  } catch (error) {
    logger.logWarning("Holistic conversation processing failed", {
      operation: "holistic_conversation_handle_input",
      userId: authenticatedUser.id,
      sessionId,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    throw error;
  }
}

/**
 * Handles credit deduction with detailed logging.
 * Following open-chat.action.ts pattern.
 */
async function processCreditsDeduction(
  authId: string | undefined,
  userId: string | undefined,
  totalCredits: number,
  userInput: string,
  responseMessage: string,
  sessionId?: string
): Promise<number> {
  if (!userId || !authId) {
    logger.logWarning("Credit deduction skipped - Missing userId or authId", {
      operation: "holistic_conversation_credit_deduction_skipped",
      sessionId,
      metadata: {
        hasUserId: !!userId,
        hasAuthId: !!authId,
      },
    });
    return 0;
  }

  logger.logInfo("Attempting credit deduction", {
    operation: "holistic_conversation_credit_deduction_attempt",
    sessionId,
    userId,
    metadata: {
      authId,
      totalCredits,
    },
  });

  const deductResult = await deductCreditsFromUser(authId, totalCredits, "ai_usage", sessionId, {
    holisticConversation: true,
    messageLength: userInput.length,
    responseLength: responseMessage.length,
  });

  if (deductResult.error) {
    logger.logWarning("Credit deduction failed", {
      operation: "holistic_conversation_credit_deduction_failed",
      userId: authId,
      sessionId,
      metadata: {
        error: deductResult.error.message,
        totalCredits,
      },
    });
    return 0;
  }

  logger.logInfo("Credit deduction successful", {
    operation: "holistic_conversation_credit_deduction_success",
    userId: authId,
    sessionId,
    metadata: {
      creditsDeducted: totalCredits,
      newBalance: deductResult.data?.newBalance,
    },
  });

  return totalCredits;
}

/**
 * Handles background therapeutic analysis and memory updates.
 * Runs after response sent to user - completely non-blocking.
 *
 * Flow:
 * 1. Run therapeutic analysis with last 3 analyses for context
 * 2. Save analysis to analysisSnapshots array
 * 3. If analysis.update_memory = true, trigger memory update
 * 4. All operations server-side with server encryption
 */
async function handleBackgroundAnalysis(
  userInput: string,
  sessionContext: SessionContext,
  userId: string,
  sessionId: string,
  conversationWindow: { role: "user" | "assistant"; content: string }[],
  messageId?: string
): Promise<void> {
  try {
    // Get session metadata for analysis
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: {
        metadata: true,
      },
    });

    const messageCount = (session?.metadata as any)?.messageCount || 0;
    const activeDurationMs = (session?.metadata as any)?.activeDurationMs || 0;

    // Step 1: Run therapeutic analysis with last 3 analyses for context
    // Note: TherapeuticAnalysisWithMessageId = TherapeuticAnalysis & { messageId }
    // Remove messageId field to get clean TherapeuticAnalysis
    const lastThreeAnalyses = sessionContext.analysisSnapshots.slice(-3).map((snapshot) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { messageId, ...analysis } = snapshot;
      return analysis;
    });

    const analysisResult = await analyzeUserInput(
      userInput,
      lastThreeAnalyses,
      userId,
      sessionId,
      { messageCount, activeDurationMs },
      conversationWindow
    );

    if (analysisResult.error || !analysisResult.data) {
      logger.logWarning("Therapeutic analysis failed in background", {
        operation: "holistic_conversation_background_analysis_error",
        sessionId,
        userId,
        metadata: {
          error: analysisResult.error?.message || "Unknown error",
        },
      });
      return;
    }

    const { analysis } = analysisResult.data;

    // Step 2: Save analysis to analysisSnapshots
    await updateSessionContext(sessionId, {
      analysisSnapshots: [
        ...sessionContext.analysisSnapshots,
        {
          analysis,
          messageId: messageId || undefined,
          createdAt: new Date(),
        },
      ],
    });

    logger.logInfo("Therapeutic analysis saved to session context", {
      operation: "holistic_conversation_analysis_saved",
      sessionId,
      userId,
      metadata: {
        analysisValue: analysis.analysis_value,
        updateMemory: analysis.update_memory,
        snapshotCount: sessionContext.analysisSnapshots.length + 1,
      },
    });

    // Step 3: If analysis indicates memory update needed, trigger memory generation
    if (analysis.update_memory) {
      const memoryResult = await generateSessionMemoryFromCurrentSession(sessionContext, userInput, userId);

      if (memoryResult.error) {
        logger.logWarning("Memory update failed in background", {
          operation: "holistic_conversation_memory_update_failed",
          sessionId,
          userId,
          metadata: {
            error: memoryResult.error.message,
          },
        });
      } else {
        logger.logInfo("Session memory updated in background", {
          operation: "holistic_conversation_memory_updated",
          sessionId,
          userId,
          metadata: {
            memoryLength: memoryResult.data?.memory.length || 0,
            creditsUsed: memoryResult.data?.creditsUsed || 0,
          },
        });
      }
    }
  } catch (error) {
    logger.logWarning("Background analysis handler encountered error", {
      operation: "holistic_conversation_background_analysis_handler_error",
      sessionId,
      userId,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });
  }
}
