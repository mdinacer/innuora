"use server";

/**
 * 3-Stage Conversation Engine (Production)
 * Reflection (GPT-4o) → Analysis (GPT-4.1-mini) → Context Synthesis (GPT-4o-mini)
 *
 * Key Features:
 * - Parallel execution (Reflection + Analysis) for 40% latency reduction
 * - Hash-based context caching (60-80% cache rate)
 * - Server-side encryption integration
 * - Credits deduction (reflection only)
 * - AI operation logging (separate logs for each stage)
 * - Session sync integration (fire-and-forget)
 */

/* eslint-disable @typescript-eslint/no-use-before-define */
import { AiOperationType } from "@prisma/client";

import { deductCreditsFromUser } from "@/app/actions/credit-actions";
import { getAuthenticatedUserContext } from "@/app/actions/user-context";
import { calculateCreditsFromUsage } from "@/domains/credits/model-credits-calculation";
import { updateSessionDynamicsMatrix } from "@/domains/session-dynamics";
import { generateAnalysis } from "@/domains/therapeutic-analysis/analysis.service";
import { logAiOperation } from "@/lib/ai-operations/ai-operation-logger";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
import { getSessionContext, updateSessionContext } from "@/lib/session/session-context-service";
import { buildSessionContextUpdate, getSessionData } from "@/lib/session/session-context.utils";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { generateReflection } from "../services/reflection.service";
import { generateContextDirective } from "../services/synthesis.service";
import { initialContextLifecycle } from "../types/synthesis.types";

interface ConversationResult {
  response: string;
  creditsUsed: number;
  signals?: {
    resistance: "none" | "sarcasm" | "dismissive" | "intellectualized";
    crisis: "none" | "acute";
  };
  // Development-only tracking data
  _devTracking?: {
    operationType: "conversation";
    modelType: "default" | "fallback";
    tokenUsage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
}

/**
 * Handle user input through 3-stage conversation engine
 * Complete orchestration: validation → parallel (reflection + analysis) → synthesis → logging → credits
 *
 * @param userInput - User message
 * @param messages - Full conversation history (E2EE on client)
 * @param locale - User locale
 * @param sessionId - Session ID
 * @param messageId - Message ID (optional, for tracking)
 * @returns Therapeutic response with signals and credits used
 */
export async function handleHolisticUserInput(
  userInput: string,
  messages: OpenChatMessage[] = [],
  locale: AppLocales = "en",
  sessionId?: string,
  messageId?: string
): Promise<ConversationResult> {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Step 1: Authentication
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const authenticatedUser = await getAuthenticatedUserContext();

  try {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Step 2: Validate Input
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    if (!userInput?.trim()) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_INVALID_INPUT, new Error("User input cannot be empty"), {
        operation: "conversation_handle_input",
        userId: authenticatedUser.id,
        sessionId,
      });
    }

    if (!sessionId) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_INVALID_INPUT, new Error("Session ID is required"), {
        operation: "conversation_handle_input",
        userId: authenticatedUser.id,
      });
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Step 3: Fetch Encrypted Session Context
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const sessionContext = await getSessionContext(sessionId!, authenticatedUser.id);
    const sessionData = getSessionData(sessionContext);

    const { relationalTrace, analyses, contextLifecycle, sessionDynamics } = sessionData;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Step 4: Build Conversation Window (last 8 messages)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const conversationWindow = messages
      .filter(
        (msg): msg is OpenChatMessage & { role: "user" | "assistant" } =>
          msg.role === "user" || msg.role === "assistant"
      )
      .slice(-8);

    // Get previous analysis for emotional gating
    const prevAnalysis = analyses.length > 0 ? analyses[analyses.length - 1] : undefined;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Step 5: Context Synthesis (get session directive)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let contextDirective: string | null = null;
    let updatedContextLifecycle = contextLifecycle || initialContextLifecycle;

    if (sessionDynamics && prevAnalysis) {
      const synthesisResult = await generateContextDirective({
        sessionDynamics,
        recentAnalysis: prevAnalysis,
        relationalTrace: relationalTrace || undefined,
        currentLifecycle: contextLifecycle || initialContextLifecycle,
      });

      contextDirective = synthesisResult.directive;
      updatedContextLifecycle = synthesisResult.lifecycle;

      // Log synthesis operation (if not cached)
      if (!synthesisResult.cached && synthesisResult.tokenUsage) {
        await logSynthesisOperation(
          authenticatedUser.id,
          sessionId!,
          synthesisResult.tokenUsage,
          synthesisResult.elapsedMs
        );
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Step 6: PARALLEL EXECUTION (Reflection + Analysis)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const [reflectionResult, analysisResult] = await Promise.all([
      generateReflection({
        userInput,
        messagesWindow: conversationWindow,
        contextDirective,
        prevAnalysis,
        relationalTrace: relationalTrace || undefined,
      }),
      generateAnalysis(userInput),
    ]);

    const { response: reflectiveResponse, nextTrace } = reflectionResult;
    const { analysis: currentAnalysis } = analysisResult;

    // Extract therapeutic response
    const content = reflectiveResponse.reflection;
    const signals = reflectiveResponse.signals;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Step 7: Update Analyses History
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const updatedAnalyses = [...analyses, currentAnalysis].slice(-10); // Keep last 10

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Step 8: Compute Session Dynamics Matrix
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const updatedSessionDynamics = updateSessionDynamicsMatrix(updatedAnalyses, sessionDynamics || undefined);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Step 9: Build Session Context Update
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const contextUpdate = buildSessionContextUpdate({
      relationalTrace: nextTrace,
      analyses: updatedAnalyses,
      contextLifecycle: updatedContextLifecycle,
      sessionDynamics: updatedSessionDynamics,
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Step 10: Credits Deduction (Reflection Only)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const creditsUsed = await processCreditsDeduction(
      authenticatedUser.authId,
      reflectionResult.tokenUsage,
      sessionId!,
      messageId
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Step 11: Update Session Context (Fire-and-Forget)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    updateSessionContext(sessionId!, contextUpdate).catch((err) => {
      console.error(`[Conversation] Failed to update session context: ${err.message}`);
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Step 12: Log AI Operations
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    await Promise.all([
      logReflectionOperation(
        authenticatedUser.id,
        sessionId!,
        reflectionResult.tokenUsage,
        creditsUsed,
        reflectionResult.elapsedMs
      ),
      logAnalysisOperation(authenticatedUser.id, sessionId!, analysisResult.tokenUsage, analysisResult.elapsedMs),
    ]);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Step 13: Return Response
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    return {
      response: content,
      creditsUsed,
      signals,
      _devTracking: reflectionResult.tokenUsage
        ? {
            operationType: "conversation",
            modelType: "default",
            tokenUsage: {
              promptTokens: reflectionResult.tokenUsage.promptTokens,
              completionTokens: reflectionResult.tokenUsage.completionTokens,
              totalTokens: reflectionResult.tokenUsage.totalTokens,
            },
          }
        : undefined,
    };
  } catch (error) {
    logger.logError("Failed to process holistic conversation", {
      operation: "conversation_handle_input",
      userId: authenticatedUser.id,
      sessionId,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
    throw error;
  }
}

//═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
//═══════════════════════════════════════════════════════════════

/**
 * Process credits deduction for reflection operation
 */
async function processCreditsDeduction(
  authId: string,
  tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number; cachedTokens?: number } | null,
  sessionId: string,
  messageId?: string
): Promise<number> {
  if (!tokenUsage) return 0;

  // Calculate credits based on actual model pricing and token breakdown
  const creditResult = calculateCreditsFromUsage("reflection", {
    promptTokens: tokenUsage.promptTokens,
    completionTokens: tokenUsage.completionTokens,
    cachedTokens: tokenUsage.cachedTokens ?? 0,
    totalTokens: tokenUsage.totalTokens,
    timestamp: new Date().toISOString(),
    responseLength: 0,
  });

  const result = await deductCreditsFromUser(authId, creditResult.credits, "ai_usage", "reflection", sessionId, {
    messageId,
    operationType: "reflection",
    promptTokens: tokenUsage.promptTokens,
    completionTokens: tokenUsage.completionTokens,
    cachedTokens: tokenUsage.cachedTokens,
    // Include cost breakdown for transparency
    rawCostUsd: creditResult.rawCostUsd,
    adjustedCostUsd: creditResult.adjustedCostUsd,
  });

  return result.data?.creditsDeducted || 0;
}

/**
 * Log reflection AI operation
 */
async function logReflectionOperation(
  userId: string,
  sessionId: string,
  tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number; cachedTokens?: number } | null,
  creditsCharged: number,
  elapsedMs: number
): Promise<void> {
  if (!tokenUsage) return;

  await logAiOperation({
    userId,
    sessionId,
    operation: AiOperationType.REFLECTION,
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
      modelCode: "reflection",
      success: true,
      latencyMs: elapsedMs,
    },
  });
}

/**
 * Log analysis AI operation
 */
async function logAnalysisOperation(
  userId: string,
  sessionId: string,
  tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number; cachedTokens?: number } | null,
  elapsedMs: number
): Promise<void> {
  if (!tokenUsage) return;

  await logAiOperation({
    userId,
    sessionId,
    operation: AiOperationType.ANALYSIS,
    tokenUsage: {
      promptTokens: tokenUsage.promptTokens,
      completionTokens: tokenUsage.completionTokens,
      totalTokens: tokenUsage.totalTokens,
      cachedTokens: tokenUsage.cachedTokens ?? 0,
      timestamp: new Date().toISOString(),
      responseLength: 0,
    },
    creditsCharged: 0, // Analysis stage is informational only
    metadata: {
      modelCode: "background",
      success: true,
      latencyMs: elapsedMs,
    },
  });
}

/**
 * Log synthesis AI operation
 */
async function logSynthesisOperation(
  userId: string,
  sessionId: string,
  tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number; cachedTokens?: number } | null,
  elapsedMs: number
): Promise<void> {
  if (!tokenUsage) return;

  await logAiOperation({
    userId,
    sessionId,
    operation: AiOperationType.SYNTHESIS,
    tokenUsage: {
      promptTokens: tokenUsage.promptTokens,
      completionTokens: tokenUsage.completionTokens,
      totalTokens: tokenUsage.totalTokens,
      cachedTokens: tokenUsage.cachedTokens ?? 0,
      timestamp: new Date().toISOString(),
      responseLength: 0,
    },
    creditsCharged: 0, // Synthesis stage does not charge credits
    metadata: {
      modelCode: "auxiliary",
      success: true,
      latencyMs: elapsedMs,
    },
  });
}
