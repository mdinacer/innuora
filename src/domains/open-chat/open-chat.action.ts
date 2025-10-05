"use server";

import { Profile } from "@prisma/client";
import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { deductCreditsFromUser } from "@/app/actions/credit-actions";
import { LanguagePrompt, SecurityProtocolPrompt } from "@/domains/ai-conversation/prompts";
import { PERSONA_PROMPTS_LOCALIZED } from "@/domains/ai-conversation/prompts/prompt.persona";
import { buildUserProfileContext } from "@/domains/ai-conversation/prompts/prompt.user-context";
import { ModulesPromptBuilder } from "@/domains/cbt-modules/modules-prompt-builder";
import { ChatContextManager } from "@/domains/chat-context/chat-context.manager";
import { handleLightweightUserInput } from "@/domains/open-chat/open-chat-lightweight.action";
import { SESSION_MEMORY_REFERENCE_INSTRUCTIONS } from "@/domains/session-memory/session-memory.prompt";
import { analyzeUserInput } from "@/domains/therapeutic-analysis/therapeutic-analysis.action";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { TONE_INSTRUCTIONS_LOCALIZED } from "../ai-conversation/prompts/prompt.tone";

interface HandleUserInputResult {
  analysis: TherapeuticAnalysis | null;
  response: string;
  tokenUsage: {
    analysisUsage: ModelTokenUsage | null;
    responseUsage: ModelTokenUsage | null;
  };
  cost: number; // USD cost (for backward compatibility)
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
  userId?: string,
  sessionId?: string
): Promise<ChatCompletionMessageParam[]> {
  // Initialize services - can be done in parallel
  const [modulesPromptBuilder, messagesManager] = await Promise.all([
    Promise.resolve(new ModulesPromptBuilder(locale)),
    Promise.resolve(new ChatContextManager()),
  ]);

  // Build prompts - some can be done in parallel
  const [modulesPrompt, chatHistoryPrompt] = await Promise.all([
    modulesPromptBuilder.buildModulesPrompt(analysis),
    Promise.resolve(messagesManager.buildChatHistoryPrompt(messages)),
  ]);

  // Get language and tone prompts (synchronous lookups)
  const languagePrompt = LanguagePrompt[locale];
  if (!languagePrompt) {
    logger.logErrorAndThrow(ERROR_CODES.CHAT_UNSUPPORTED_LOCALE, new Error(`Unsupported locale: ${locale}`), {
      operation: "open_chat_build_conversation_prompts",
      userId,
      sessionId,
      metadata: { locale },
    });
  }

  const toneInstruction = TONE_INSTRUCTIONS_LOCALIZED[locale][analysis.intensity];
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

/**
 * Resolves database user ID to Supabase auth ID for credit operations
 */
async function resolveAuthId(userId?: string, sessionId?: string): Promise<string | undefined> {
  if (!userId) {
    logger.logWarning("Credit deduction skipped - No userId provided", {
      operation: "open_chat_auth_id_resolution",
      sessionId,
      metadata: { userIdProvided: false },
    });
    return undefined;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { authId: true },
  });

  logger.logInfo("AuthId resolution completed", {
    operation: "open_chat_auth_id_resolution",
    sessionId,
    metadata: {
      providedUserId: userId,
      foundAuthId: user?.authId,
      userFound: !!user,
    },
  });

  return user?.authId;
}

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

  const analysisResult = await analyzeUserInput(userInput, prevAnalysis, userId, sessionId, sessionMetadata);

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
): Promise<HandleUserInputResult> {
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
    analysis,
    response: lightweightResult.response,
    tokenUsage: {
      analysisUsage,
      responseUsage: lightweightResult.tokenUsage,
    },
    cost: (analysisUsage?.costUSD || 0) + (lightweightResult.tokenUsage?.costUSD || 0),
    creditsUsed: totalCreditsUsed,
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
  userId?: string,
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
 */
export async function handleUserInput(
  userInput: string,
  prevAnalysis: TherapeuticAnalysis[] = [],
  messages: OpenChatMessage[] = [],
  profile: Profile | null,
  prevMemory: string | null,
  locale: AppLocales = "en",
  userId?: string,
  sessionId?: string
): Promise<HandleUserInputResult> {
  try {
    // Step 1: Validate input
    if (!userInput?.trim()) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_INVALID_INPUT, new Error("User input cannot be empty"), {
        operation: "open_chat_handle_user_input",
        userId,
        sessionId,
      });
    }

    // Step 2: Resolve authId for credit operations
    const authId = await resolveAuthId(userId, sessionId);

    // Step 3: Analyze user input
    const {
      analysis,
      modelTokenUsage: analysisUsage,
      consumedCredits: analysisCredits,
    } = await processTherapeuticAnalysis(userInput, prevAnalysis, messages, userId, sessionId);

    // Step 4: Smart routing - lightweight vs full response
    if (analysis.analysis_value === "low") {
      return await handleLowValueInput(
        userInput,
        analysis,
        analysisUsage,
        analysisCredits || 0,
        messages,
        profile,
        prevMemory,
        locale,
        userId,
        sessionId
      );
    }

    // Step 5: Generate full AI response
    const aiResponse = await generateFullResponse(
      userInput,
      analysis,
      messages,
      profile,
      prevMemory,
      locale,
      userId,
      sessionId
    );

    // Step 6: Process credit deduction
    const creditsUsed = await processCreditsDeduction(
      authId,
      userId,
      analysisCredits || 0,
      aiResponse.consumedCredits || 0,
      userInput,
      aiResponse.message,
      sessionId
    );

    // Step 7: Return consolidated result
    return {
      analysis,
      response: aiResponse.message,
      tokenUsage: {
        analysisUsage,
        responseUsage: aiResponse.modelTokenUsage,
      },
      cost: (analysisUsage?.costUSD || 0) + (aiResponse.modelTokenUsage?.costUSD || 0),
      creditsUsed,
    };
  } catch (error) {
    logger.logWarning("Open chat conversation processing failed", {
      operation: "open_chat_handle_user_input",
      userId,
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
