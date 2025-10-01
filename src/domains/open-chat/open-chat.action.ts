"use server";

import { Profile } from "@prisma/client";
import { ChatCompletionMessageParam } from "openai/resources";

import { SendPromptsToAiWithRetry } from "@/app/actions/ai-client-actions";
import { deductCredits } from "@/app/actions/credit-actions";
import { ModelCode, MODELS_CODES, MODELS_CODES_MAP } from "@/domains/ai-conversation/ai-models";
import { LanguagePrompt, SecurityProtocolPrompt } from "@/domains/ai-conversation/prompts";
import { PERSONA_PROMPTS_LOCALIZED } from "@/domains/ai-conversation/prompts/prompt.persona";
import { buildUserProfilePrompt } from "@/domains/ai-conversation/prompts/prompt.user-context";
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
import { AiModel, ModelTokenUsage } from "@/types/ai-model.types";
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

  const profileContextPrompt = profile ? buildUserProfilePrompt(profile) : "";

  let memoryPrompt: ChatCompletionMessageParam | null = null;

  if (analysis.recall_memory && prevMemory) {
    const instructions = SESSION_MEMORY_REFERENCE_INSTRUCTIONS.replace("{{session_memory}}", prevMemory);
    memoryPrompt = {
      role: "assistant",
      content: instructions,
    } as ChatCompletionMessageParam;
  }

  const fullPersonaPrompt: ChatCompletionMessageParam = {
    role: "system",
    content: PERSONA_PROMPTS_LOCALIZED[locale].replace("{{TONE_DESCRIPTION}}", toneInstruction || ""),
  };

  // Compose prompts efficiently
  return [
    SecurityProtocolPrompt,
    fullPersonaPrompt,
    ...(profileContextPrompt ? [profileContextPrompt] : []),
    modulesPrompt,
    ...(chatHistoryPrompt ? [chatHistoryPrompt] : []),
    ...(memoryPrompt ? [memoryPrompt] : []),
    { role: "user", content: userInput.trim() },
  ];
}

/**
 * Handles complete user input processing including analysis and response generation
 */
export async function handleUserInput(
  userInput: string,
  prevAnalysis: TherapeuticAnalysis[] = [],
  messages: OpenChatMessage[] = [],
  profile: Profile | null,
  prevMemory: string | null,
  locale: AppLocales = "en",
  modelCode: ModelCode = MODELS_CODES.M1,
  userId?: string,
  sessionId?: string
): Promise<HandleUserInputResult> {
  // This function does NOT wrap with wrapOperation because it's a high-level orchestrator
  // that coordinates multiple operations, each with their own error handling
  try {
    // Early validation
    if (!userInput?.trim()) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_INVALID_INPUT, new Error("User input cannot be empty"), {
        operation: "open_chat_handle_user_input",
        userId,
        sessionId,
      });
    }

    const aiModel = MODELS_CODES_MAP[modelCode] as AiModel;

    // Resolve authId for credit operations (userId is database User.id, we need authId)
    let authId: string | undefined;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { authId: true },
      });
      authId = user?.authId;
    }
    if (!aiModel) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_UNSUPPORTED_MODEL, new Error(`Unsupported model code: ${modelCode}`), {
        operation: "open_chat_handle_user_input",
        userId,
        sessionId,
        metadata: { modelCode },
      });
    }

    // Step 1: Analyze user input
    const sessionMetadata = {
      messageCount: messages.length,
      activeDurationMs: 0, // Will be properly calculated in store
    };
    const analysisResult = await analyzeUserInput(userInput, prevAnalysis, aiModel, userId, sessionId, sessionMetadata);

    // Unwrap analyzeUserInput ActionResult
    if (analysisResult.error) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_ANALYSIS_FAILED, new Error(analysisResult.error.message), {
        operation: "open_chat_handle_user_input",
        userId,
        sessionId,
        metadata: { modelCode },
      });
    }

    const analysisData = analysisResult.data;
    if (!analysisData) {
      throw new Error("Analysis result is null");
    }
    const { analysis, modelTokenUsage: analysisUsage, consumedCredits: analysisCredits } = analysisData;

    // Smart Processing Decision: Use lightweight processing for low-value inputs
    if (analysis.analysis_value === "low") {
      const lightweightResult = await handleLightweightUserInput(
        userInput,
        analysis,
        messages,
        locale,
        modelCode,
        userId,
        sessionId
      );

      // Combine analysis credits with lightweight response credits
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

    // Step 2: Build conversation prompts (for medium/high value inputs)
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

    // Step 3: Generate AI response
    const responseResult = await SendPromptsToAiWithRetry(conversationPrompts, aiModel);

    // Unwrap SendPromptsToAiWithRetry ActionResult
    if (responseResult.error) {
      logger.logErrorAndThrow(ERROR_CODES.CHAT_RESPONSE_FAILED, new Error(responseResult.error.message), {
        operation: "open_chat_handle_user_input",
        userId,
        sessionId,
        metadata: { modelCode },
      });
    }

    const miraelResponse = responseResult.data;
    if (!miraelResponse) {
      throw new Error("AI response is null");
    }

    const { consumedCredits: responseCredits } = miraelResponse;

    // Step 4: Simple credit deduction - exact amounts!
    let creditsUsed = 0;
    if (userId && authId) {
      const totalCredits = (analysisCredits || 0) + (responseCredits || 0);

      await deductCredits(authId, totalCredits, "ai_usage", sessionId, {
        modelCode,
        analysisCredits: analysisCredits || 0,
        responseCredits: responseCredits || 0,
        messageLength: userInput.length,
        responseLength: miraelResponse.message.length,
      });

      creditsUsed = totalCredits;
    }

    return {
      analysis,
      response: miraelResponse.message,
      tokenUsage: {
        analysisUsage,
        responseUsage: miraelResponse.modelTokenUsage,
      },
      cost: (analysisUsage?.costUSD || 0) + (miraelResponse.modelTokenUsage?.costUSD || 0),
      creditsUsed,
    };
  } catch (error) {
    logger.logWarning("Open chat conversation processing failed", {
      operation: "open_chat_handle_user_input",
      userId,
      sessionId,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        modelCode,
        locale,
        messageCount: messages.length,
        inputLength: userInput?.length || 0,
      },
    });
    throw error;
  }
}
