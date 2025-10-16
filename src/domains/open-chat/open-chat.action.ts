"use server";

import { Profile } from "@prisma/client";
import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { deductCreditsFromUser } from "@/app/actions/credit-actions";
import { getAuthenticatedUserContext } from "@/app/actions/user-context";
import { SecurityProtocolPrompt } from "@/domains/ai-conversation/prompts";
import { PERSONA_PROMPTS_LOCALIZED } from "@/domains/ai-conversation/prompts/prompt.persona";
import { REFLECTIVE_CATALYST_TONE, TONE_INSTRUCTIONS_LOCALIZED } from "@/domains/ai-conversation/prompts/prompt.tone";
import { buildUserProfileContext } from "@/domains/ai-conversation/prompts/prompt.user-context";
import { ModulesPromptBuilder } from "@/domains/cbt-modules/modules-prompt-builder";
import { ChatContextManager } from "@/domains/chat-context/chat-context.manager";
import { handleLightweightUserInput } from "@/domains/open-chat/open-chat-lightweight.action";
import { generateSessionMemoryFromCurrentSession } from "@/domains/session-memory/session-memory.action";
import { SESSION_MEMORY_REFERENCE_INSTRUCTIONS } from "@/domains/session-memory/session-memory.prompt";
import { analyzeUserInput } from "@/domains/therapeutic-analysis/therapeutic-analysis.action";
import {
  TherapeuticAnalysis,
  TherapeuticAnalysisWithMessageId,
} from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { logAiOperation } from "@/lib/ai-operations/ai-operation-logger";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
import { getSessionContext, updateSessionContext } from "@/lib/session/session-context-service";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface HandleUserInputResult {
  response: string;
  creditsUsed: number; // Credits deducted
}

/**
 * Builds the conversation prompts based on analysis and context
 */
async function buildConversationPrompts(
  userInput: string,
  analysis: TherapeuticAnalysis,
  messages: OpenChatMessage[],
  profile: Profile | null,
  prevMemory: string | null,
  locale: AppLocales,
  userId: string,
  sessionId?: string
): Promise<ChatCompletionMessageParam[]> {
  // Initialize services - can be done in parallel
  const [modulesPromptBuilder, messagesManager] = await Promise.all([
    Promise.resolve(new ModulesPromptBuilder(locale)),
    Promise.resolve(new ChatContextManager(locale)),
  ]);

  // Build prompts - some can be done in parallel
  const [modulesPrompt, chatHistoryPrompt] = await Promise.all([
    modulesPromptBuilder.buildModulesPrompt(analysis),
    Promise.resolve(messagesManager.buildChatHistoryPrompt(messages)),
  ]);

  const toneInstruction =
    analysis.process_module === "reflective_catalyst"
      ? REFLECTIVE_CATALYST_TONE[locale]
      : TONE_INSTRUCTIONS_LOCALIZED[locale][analysis.intensity];
  if (!toneInstruction) {
    logger.logErrorAndThrow(
      ERROR_CODES.CHAT_UNSUPPORTED_INTENSITY,
      new Error(`Unsupported intensity: ${analysis.intensity}`),
      {
        operation: "open_chat_build_conversation_prompts",
        userId,
        sessionId,
        metadata: { intensity: analysis.intensity },
      }
    );
  }

  // Build profile context (localized) - will be merged into persona prompt for efficiency
  const profileContext = profile ? `\n\n${buildUserProfileContext(profile, locale)}` : "";

  let memoryPrompt: ChatCompletionMessageParam | null = null;

  if (analysis.recall_memory && prevMemory) {
    const instructions = SESSION_MEMORY_REFERENCE_INSTRUCTIONS.replace("{{session_memory}}", prevMemory);
    memoryPrompt = {
      role: "assistant",
      content: instructions,
    } as ChatCompletionMessageParam;
  }

  // Merge profile context into persona system prompt for token efficiency
  const fullPersonaPrompt: ChatCompletionMessageParam = {
    role: "system",
    content: PERSONA_PROMPTS_LOCALIZED[locale].replace("{{TONE_DESCRIPTION}}", toneInstruction || "") + profileContext,
  };

  // Compose prompts efficiently
  return [
    SecurityProtocolPrompt,
    fullPersonaPrompt,
    modulesPrompt,
    ...(chatHistoryPrompt ? [chatHistoryPrompt] : []),
    ...(memoryPrompt ? [memoryPrompt] : []),
    { role: "user", content: userInput.trim() },
  ];
}

// REMOVED: No longer needed - we get authenticated user from session

/**
 * Processes therapeutic analysis for user input
 */
async function processTherapeuticAnalysis(
  userInput: string,
  prevAnalysis: TherapeuticAnalysis[],
  messages: OpenChatMessage[],
  userId?: string,
  sessionId?: string
) {
  const sessionMetadata = {
    messageCount: messages.length,
    activeDurationMs: 0, // Will be properly calculated in store
  };

  // Extract recent USER messages only (not assistant responses) for lightweight context
  // Cost: ~50-100 tokens instead of ~200-400 for full conversation
  // Sufficient to understand follow-up references ("it", "that", etc.) without bloating analysis cost
  const recentMessages = messages
    .filter((msg) => msg.role === "user")
    .slice(-2) // Last 2 user messages
    .map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

  const analysisResult = await analyzeUserInput(
    userInput,
    prevAnalysis,
    userId,
    sessionId,
    sessionMetadata,
    recentMessages
  );

  if (analysisResult.error) {
    logger.logErrorAndThrow(ERROR_CODES.CHAT_ANALYSIS_FAILED, new Error(analysisResult.error.message), {
      operation: "open_chat_process_therapeutic_analysis",
      userId,
      sessionId,
    });
  }

  const analysisData = analysisResult.data;
  if (!analysisData) {
    throw new Error("Analysis result is null");
  }

  return analysisData;
}

/**
 * Handles lightweight response for low-value inputs
 */
async function handleLowValueInput(
  userInput: string,
  analysis: TherapeuticAnalysis,
  analysisUsage: ModelTokenUsage | null,
  analysisCredits: number,
  messages: OpenChatMessage[],
  profile: Profile | null,
  prevMemory: string | null,
  locale: AppLocales,
  userId?: string,
  sessionId?: string
): Promise<HandleUserInputResult & { tokenUsage: ModelTokenUsage | null }> {
  const lightweightResult = await handleLightweightUserInput(
    userInput,
    analysis,
    messages,
    profile,
    prevMemory,
    locale,
    userId,
    sessionId
  );

  const totalCreditsUsed = (analysisCredits || 0) + lightweightResult.creditsUsed;

  return {
    response: lightweightResult.response,
    creditsUsed: totalCreditsUsed,
    tokenUsage: lightweightResult.tokenUsage,
    //analysis,
    // cost: (analysisUsage?.costUSD || 0) + (lightweightResult.tokenUsage?.costUSD || 0),
  };
}

/**
 * Generates full AI response for medium/high value inputs
 */
async function generateFullResponse(
  userInput: string,
  analysis: TherapeuticAnalysis,
  messages: OpenChatMessage[],
  profile: Profile | null,
  prevMemory: string | null,
  locale: AppLocales,
  userId: string,
  sessionId?: string
) {
  const conversationPrompts = await buildConversationPrompts(
    userInput,
    analysis,
    messages,
    profile,
    prevMemory,
    locale,
    userId,
    sessionId
  );

  const responseResult = await processAiPromptsWithRetry(conversationPrompts);

  if (responseResult.error) {
    logger.logErrorAndThrow(ERROR_CODES.CHAT_RESPONSE_FAILED, new Error(responseResult.error.message), {
      operation: "open_chat_generate_full_response",
      userId,
      sessionId,
    });
  }

  const aiResponse = responseResult.data;
  if (!aiResponse) {
    throw new Error("AI response is null");
  }

  console.log(
    JSON.stringify(
      {
        prompts: conversationPrompts,
        analysis,
        response: aiResponse,
      },
      null,
      2
    )
  );

  return aiResponse;
}

/**
 * Handles credit deduction for AI operations with detailed logging
 */
async function processCreditsDeduction(
  authId: string | undefined,
  userId: string | undefined,
  analysisCredits: number,
  responseCredits: number,
  userInput: string,
  responseMessage: string,
  sessionId?: string
): Promise<number> {
  if (!userId || !authId) {
    logger.logWarning("Credit deduction skipped - Missing userId or authId", {
      operation: "open_chat_credit_deduction_skipped",
      sessionId,
      metadata: {
        hasUserId: !!userId,
        hasAuthId: !!authId,
      },
    });
    return 0;
  }

  const totalCredits = (analysisCredits || 0) + (responseCredits || 0);

  logger.logInfo("Attempting credit deduction", {
    operation: "open_chat_credit_deduction_attempt",
    sessionId,
    userId,
    metadata: {
      authId,
      totalCredits,
      analysisCredits: analysisCredits || 0,
      responseCredits: responseCredits || 0,
    },
  });

  const deductResult = await deductCreditsFromUser(authId, totalCredits, "ai_usage", sessionId, {
    analysisCredits: analysisCredits || 0,
    responseCredits: responseCredits || 0,
    messageLength: userInput.length,
    responseLength: responseMessage.length,
  });

  if (deductResult.error) {
    logger.logWarning("Credit deduction failed", {
      operation: "open_chat_credit_deduction_failed",
      sessionId,
      userId,
      metadata: {
        error: deductResult.error.message,
        errorCode: deductResult.error.code,
        totalCredits,
      },
    });
  } else {
    logger.logInfo("Credit deduction successful", {
      operation: "open_chat_credit_deduction_success",
      sessionId,
      userId,
      metadata: {
        creditsDeducted: totalCredits,
        newBalance: deductResult.data?.newBalance,
      },
    });
  }

  return totalCredits;
}

/**
 * Handles complete user input processing including analysis and response generation
 * Orchestrates the entire chat flow: validation → analysis → response → credits
 *
 * NOTE: This function now fetches therapeutic context (analysis, memory) from SERVER-SIDE
 * encrypted storage. Client no longer passes this sensitive data.
 */
export async function handleUserInput(
  userInput: string,
  messages: OpenChatMessage[] = [],
  profile: Profile | null,
  locale: AppLocales = "en",
  sessionId?: string,
  messageId?: string
): Promise<HandleUserInputResult> {
  // Step 1: Get authenticated user from session (server-side, secure)
  // Moved outside try block so it's accessible in catch handler
  const authenticatedUser = await getAuthenticatedUserContext();

  try {
    // Step 2: Validate input
    if (!userInput?.trim()) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_INVALID_INPUT, new Error("User input cannot be empty"), {
        operation: "open_chat_handle_user_input",
        userId: authenticatedUser.id,
        sessionId,
      });
    }

    if (!sessionId) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_INVALID_INPUT, new Error("Session ID is required"), {
        operation: "open_chat_handle_user_input",
        userId: authenticatedUser.id,
      });
    }

    // Step 3: Fetch server-side session context (therapeutic data - NEVER sent to client)
    // TypeScript: sessionId is guaranteed to be string after validation above (logErrorAndThrow terminates execution)
    const sessionContext = await getSessionContext(sessionId as string, authenticatedUser.id);

    // analysisSnapshots is already TherapeuticAnalysisWithMessageId[], which extends TherapeuticAnalysis
    const prevAnalysis = sessionContext.analysisSnapshots.slice(-3); // Last 3 analyses
    const prevMemory = sessionContext.memoryStore;

    // Step 4: Analyze user input
    const {
      analysis,
      modelTokenUsage: analysisUsage,
      consumedCredits: analysisCredits,
    } = await processTherapeuticAnalysis(userInput, prevAnalysis, messages, authenticatedUser.id, sessionId);

    // Step 5: Smart routing - lightweight vs full response
    if (analysis.analysis_value === "low") {
      const lowValueResult = await handleLowValueInput(
        userInput,
        analysis,
        analysisUsage,
        analysisCredits || 0,
        messages,
        profile,
        prevMemory,
        locale,
        authenticatedUser.id,
        sessionId
      );

      // Log AI operation (fire-and-forget)
      if (lowValueResult.tokenUsage && sessionContext.userId) {
        logAiOperation({
          userId: sessionContext.userId,
          sessionId: sessionContext.sessionId,
          messageId,
          operation: "RESPONSE",
          tokenUsage: lowValueResult.tokenUsage,
          creditsCharged: lowValueResult.creditsUsed,
        }).catch((error) => {
          logger.logWarning("Failed to log AI operation", {
            operation: "open_chat_log_ai_operation_failed",
            sessionId,
            metadata: { error: error instanceof Error ? error.message : String(error) },
          });
        });
      }
      return lowValueResult;
    }

    // Step 6: Generate full AI response
    const aiResponse = await generateFullResponse(
      userInput,
      analysis,
      messages,
      profile,
      prevMemory,
      locale,
      authenticatedUser.id,
      sessionId
    );

    // Step 7: Process credit deduction
    const creditsUsed = await processCreditsDeduction(
      authenticatedUser.authId,
      authenticatedUser.id,
      analysisCredits || 0,
      aiResponse.consumedCredits || 0,
      userInput,
      aiResponse.message,
      sessionId
    );

    // Step 7: Save new analysis to server-side context (background operation)
    if (messageId) {
      // TherapeuticAnalysisWithMessageId = TherapeuticAnalysis & { messageId }
      // Spread all analysis fields and add messageId
      const newAnalysisSnapshot: TherapeuticAnalysisWithMessageId = {
        ...analysis,
        messageId,
      };

      // Update server-side context with new analysis (non-blocking)
      // TypeScript: sessionId is guaranteed to be string after validation check at line 360
      updateSessionContext(sessionId as string, {
        analysisSnapshots: [...sessionContext.analysisSnapshots, newAnalysisSnapshot],
      }).catch((error) => {
        // Log error but don't fail the request - analysis is still returned to client
        logger.logWarning("Failed to update server-side analysis context", {
          operation: "open_chat_update_context_failed",
          sessionId,
          userId: authenticatedUser.authId,
          metadata: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
      });
    }

    // Log AI operation (fire-and-forget)
    if (aiResponse.modelTokenUsage && sessionContext.userId) {
      logAiOperation({
        userId: sessionContext.userId,
        sessionId: sessionContext.sessionId,
        messageId,
        operation: "RESPONSE",
        tokenUsage: aiResponse.modelTokenUsage,
        creditsCharged: aiResponse.consumedCredits || 0,
      }).catch((error) => {
        logger.logWarning("Failed to log AI operation", {
          operation: "open_chat_log_ai_operation_failed",
          sessionId,
          metadata: { error: error instanceof Error ? error.message : String(error) },
        });
      });
    }

    if (analysis.update_memory) {
      generateSessionMemoryFromCurrentSession(sessionContext, userInput, authenticatedUser.authId).then((result) => {
        if (result.error) {
          logger.logWarning("Failed to update server-side memory context", {
            operation: "open_chat_update_memory_failed",
            sessionId,
            userId: authenticatedUser.id,
            metadata: {
              error: result.error.message,
            },
          });
        }
      });
    }

    // Step 8: Return consolidated result

    return {
      response: aiResponse.message,
      creditsUsed,
      //analysis,
      // tokenUsage: {
      //   analysisUsage,
      //   responseUsage: aiResponse.modelTokenUsage,
      // },
      // cost: (analysisUsage?.costUSD || 0) + (aiResponse.modelTokenUsage?.costUSD || 0),
    };
  } catch (error) {
    logger.logWarning("Open chat conversation processing failed", {
      operation: "open_chat_handle_user_input",
      userId: authenticatedUser.id,
      sessionId,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        locale,
        messageCount: messages.length,
        inputLength: userInput?.length || 0,
      },
    });
    throw error;
  }
}
