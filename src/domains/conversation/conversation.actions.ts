"use server";

import { AiOperationType } from "@prisma/client";

import { deductCreditsFromUser } from "@/app/actions/credit-actions";
import { getAuthenticatedUserContext } from "@/app/actions/user-context";
import { AIModelCategory } from "@/domains/ai-conversation/ai-models";
import { calculateCreditsFromUsage } from "@/domains/credits/model-credits-calculation";
import { extractMemoryCues, MemoryAnalysisResult } from "@/domains/memory-analysis/memory-analysis.actions";
import { generateReflectionDirective } from "@/domains/reflection-directive/reflection-directive.actions";
import { ModelTokenUsage } from "@/domains/shared-types";
import { ERROR_CODES } from "@/lib/errors";
import { logger } from "@/lib/logging/logger.server";
import { getSessionContext, updateSessionContext } from "@/lib/session/session-context-service";
import { FactualMemory } from "../memory-analysis/memory-analysis.types";
import { recallMemoriesFromCues } from "../memory-analysis/memory-analysis.utils";
import { composeContextualReflection } from "../reflection/reflection.actions";
import { SAFE_FALLBACK_TRACE } from "../reflection/reflection.types";
import { SessionDataUpdate } from "../session-persistence/session-persistence.types";
import { ChatMessage, InputProcessResults } from "./conversation.types";
import { logOperation } from "./conversation.utils";

const MESSAGES_WINDOW_SIZE = 8;

async function processCreditsDeduction(
  authId: string,
  action: AiOperationType,
  model: AIModelCategory,
  tokenUsage: ModelTokenUsage | null,
  sessionId: string,
  messageId?: string
): Promise<number> {
  if (!tokenUsage) return 0;

  // Calculate credits based on actual model pricing and token breakdown
  const creditResult = calculateCreditsFromUsage(model, tokenUsage);

  const result = await deductCreditsFromUser(authId, creditResult.credits, action, sessionId, {
    messageId,
    operationType: action,
    modelCode: model,
    promptTokens: tokenUsage.promptTokens,
    completionTokens: tokenUsage.completionTokens,
    cachedTokens: tokenUsage.cachedTokens,
    // Include cost breakdown for transparency
    rawCostUsd: creditResult.rawCostUsd,
    adjustedCostUsd: creditResult.adjustedCostUsd,
  });

  return result.data?.creditsDeducted || 0;
}

export async function processUserInput(
  sessionId: string,
  userInput: string,
  messages: ChatMessage[] = []
): Promise<InputProcessResults> {
  const authenticatedUser = await getAuthenticatedUserContext();

  const creditResult = {
    directive: 0,
    memoryAnalysis: 0,
    reflection: 0,
  };

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

    console.log("Session Context: ", sessionContext);

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

    if (directiveResults.tokenUsage) {
      creditResult.directive = calculateCreditsFromUsage("background", directiveResults.tokenUsage).credits;
      processCreditsDeduction(
        authenticatedUser.authId,
        "DIRECTIVE",
        "background",
        directiveResults.tokenUsage,
        sessionId
      ).catch((e) => {
        logger.logError(e, {
          operation: "REFLECTION_DIRECTIVE",
          userId: authenticatedUser.id,
          sessionId,
        });
      });
    }

    const memoryAnalysisResults =
      memorySettled?.status === "fulfilled" && memorySettled.value
        ? memorySettled.value
        : { data: null, elapsedMs: 0, tokenUsage: null };

    if (memoryAnalysisResults.tokenUsage) {
      creditResult.memoryAnalysis = calculateCreditsFromUsage("background", memoryAnalysisResults.tokenUsage).credits;
      processCreditsDeduction(
        authenticatedUser.authId,
        "MEMORY_ANALYSIS",
        "background",
        memoryAnalysisResults.tokenUsage,
        sessionId
      ).catch((e) => {
        logger.logError(e, {
          operation: "MEMORY_ANALYSIS",
          userId: authenticatedUser.id,
          sessionId,
        });
      });
    }

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

    if (reflectionResults.tokenUsage) {
      creditResult.reflection = calculateCreditsFromUsage("reflection", reflectionResults.tokenUsage).credits;
      processCreditsDeduction(
        authenticatedUser.authId,
        "REFLECTION",
        "reflection",
        reflectionResults.tokenUsage,
        sessionId
      ).catch((e) => {
        logger.logError(e, {
          operation: "REFLECTION",
          userId: authenticatedUser.id,
          sessionId,
        });
      });
    }

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
        creditResult.directive,
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
              creditResult.memoryAnalysis,
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
        creditResult.reflection,
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
      consumedCredits: creditResult.directive + creditResult.memoryAnalysis + creditResult.reflection,
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
