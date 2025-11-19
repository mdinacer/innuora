"use server";

import { AiOperationType } from "@prisma/client";

import { getAuthenticatedUserContext } from "@/app/actions/user-context";
import { AIModelCategory } from "@/domains/ai-conversation/ai-models";
import { logAiOperation } from "@/lib/ai-operations/ai-operation-logger";
import { ERROR_CODES } from "@/lib/errors";
import { logger } from "@/lib/logging/logger.server";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { generateReflectionDirective } from "../domains/directive/actions";
import { extractMemoryCues, MemoryAnalysisResult } from "../domains/memory/actions";
import { FactualMemory } from "../domains/memory/types";
import { recallMemoriesFromCues } from "../domains/memory/utils";
import { composeContextualReflection } from "../domains/reflection/actions";
import { NextAction, Psychoeducation, SAFE_FALLBACK_TRACE } from "../domains/reflection/types";
import { SessionDataUpdate } from "../types/session-server";
import { getSessionContext, updateSessionContext } from "./session-context.actions";

const MESSAGES_WINDOW_SIZE = 8;

export type InputProcessResults = {
  reflection: string;
  psychoeducation: Psychoeducation | null;
  action: NextAction | null;
  followUpQuestion: string | null;
  crisis?: {
    level: "high" | "immediate" | "acute";
    notes?: string;
  };
};

async function logOperation(
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

export async function processUserInput(
  sessionId: string,
  userInput: string,
  messages: OpenChatMessage[] = []
): Promise<InputProcessResults> {
  const authenticatedUser = await getAuthenticatedUserContext();

  try {
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

    const { relationalTrace, factualMemory, sessionWellness } = sessionContext;

    let memoryAnalysisPromise: Promise<MemoryAnalysisResult> | null = null;

    if (messages.length > MESSAGES_WINDOW_SIZE) {
      const indexToAnalyze = messages.length - MESSAGES_WINDOW_SIZE - 2;
      const msgToAnalyze = messages[indexToAnalyze];

      if (msgToAnalyze?.role === "user") {
        memoryAnalysisPromise = extractMemoryCues(msgToAnalyze.content, factualMemory).catch((e: unknown) => {
          console.error("[Innuora] handleMemoryAnalysis error:", e);
          return { data: null, tokenUsage: null, elapsedMs: 0, error: e };
        });
      }
    }

    const [directiveSettled, memorySettled] = await Promise.allSettled([
      generateReflectionDirective(userInput, relationalTrace || SAFE_FALLBACK_TRACE),
      memoryAnalysisPromise,
    ]);

    const directiveResults =
      directiveSettled.status === "fulfilled"
        ? directiveSettled.value
        : { data: null, tokenUsage: null, elapsedMs: 0, error: directiveSettled.reason };

    if (!directiveResults?.data) throw new Error("No directive output");

    const memoryAnalysisResults =
      memorySettled?.status === "fulfilled" && memorySettled.value
        ? memorySettled.value
        : { data: null, elapsedMs: 0, tokenUsage: null };

    let memoryMatches: FactualMemory[] = [];
    if (memoryAnalysisResults?.data?.memory_cues?.length) {
      memoryMatches = recallMemoriesFromCues(memoryAnalysisResults.data.memory_cues, factualMemory);
    }

    const { data: directive } = directiveResults;
    const extractedMemories = memoryAnalysisResults.data?.extracted_memories;

    const reflectionResults = await composeContextualReflection(
      userInput,
      messages,
      relationalTrace,
      directive,
      sessionWellness,
      memoryMatches,
      MESSAGES_WINDOW_SIZE
    );

    const { reflection, psychoeducation, next_action, next_relational_trace, follow_up_question } =
      reflectionResults.data;

    const contextUpdate: SessionDataUpdate = {
      directive: directive,
      relationalTrace: next_relational_trace,
      factualMemory: extractedMemories,
    };

    updateSessionContext(sessionId!, contextUpdate).catch((err) => {
      logger.logError("Session context update failed - continuity at risk", {
        operation: "conversation_context_update_failure",
        userId: authenticatedUser.id,
        sessionId,
        metadata: {
          error: err instanceof Error ? err.message : String(err),
          hadDirective: !!contextUpdate.directive,
          hadMemory: !!contextUpdate.factualMemory,
        },
      });
      // Consider: Retry logic or user notification?
    });

    const logResults = await Promise.allSettled([
      logOperation(
        authenticatedUser.id,
        sessionId,
        "DIRECTIVE",
        "background",
        directiveResults.tokenUsage,
        0,
        directiveResults.elapsedMs
      ),
      ...(memoryAnalysisResults?.data
        ? [
            logOperation(
              authenticatedUser.id,
              sessionId,
              "MEMORY_ANALYSIS",
              "background",
              memoryAnalysisResults.tokenUsage,
              0,
              memoryAnalysisResults.elapsedMs
            ),
          ]
        : []),
      logOperation(
        authenticatedUser.id,
        sessionId,
        "REFLECTION",
        "reflection",
        reflectionResults.tokenUsage,
        0,
        reflectionResults.elapsedMs
      ),
    ]);

    logResults.forEach((result, i) => {
      if (result.status === "rejected") {
        console.error(`[Conversation] Log operation ${i} failed:`, result.reason);
      }
    });

    return {
      reflection,
      psychoeducation,
      action: next_action,
      followUpQuestion: follow_up_question,
      crisis: ["high", "immediate"].includes(directiveResults.data.crisis)
        ? {
            level: directiveResults.data.crisis as "high" | "immediate", // already "high" | "immediate"
            notes: directiveResults.data.rationale,
          }
        : reflectionResults.data.crisis === "acute"
          ? { level: "acute" }
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
