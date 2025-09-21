"use server";

import { Profile } from "@prisma/client";
import { ChatCompletionMessageParam } from "openai/resources";

import { SendPromptsToAiWithRetry } from "@/app/actions/ai-client-actions";
import { calculateAIMessageCost, checkAndDeductCredits } from "@/app/actions/credit-actions";
import { ModelCode, MODELS_CODES, MODELS_CODES_MAP } from "@/domains/ai-conversation/ai-models";
import { LanguagePrompt, SecurityProtocolPrompt, TonePrompt } from "@/domains/ai-conversation/prompts";
import { MIRAEL_PERSONA_PROMPT_INSTRUCTIONS } from "@/domains/ai-conversation/prompts/prompt.persona";
import { buildUserProfilePrompt } from "@/domains/ai-conversation/prompts/prompt.user-context";
import { ModulesPromptBuilder } from "@/domains/cbt-modules/modules-prompt-builder";
import { ChatContextManager } from "@/domains/chat-context/chat-context.manager";
import { SESSION_MEMORY_REFERENCE_INSTRUCTIONS } from "@/domains/session-memory/session-memory.prompt";
import { analyzeUserInput } from "@/domains/therapeutic-analysis/therapeutic-analysis.action";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { AiModel, ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { registerRoundTracker, unregisterRoundTracker } from "./round-cost-extensions";
import { RoundCostSummary, RoundCostTracker } from "./round-cost-tracker";

interface HandleUserInputResult {
  analysis: TherapeuticAnalysis | null;
  response: string;
  tokenUsage: {
    analysisUsage: ModelTokenUsage | null;
    responseUsage: ModelTokenUsage | null;
  };
  cost: number; // USD cost (for backward compatibility)
  creditsUsed: number; // Credits deducted
  roundCostSummary?: RoundCostSummary; // Complete round cost breakdown
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
    Promise.resolve(new ModulesPromptBuilder()),
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

  const toneInstruction = TonePrompt["friendly"][analysis.intensity];
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
    content: MIRAEL_PERSONA_PROMPT_INSTRUCTIONS.replace("{{TONE_DESCRIPTION}}", toneInstruction || "").replace(
      "{{LANGUAGE_RULES}}",
      (languagePrompt?.content as string | undefined) ?? ""
    ),
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
  return await logger.wrapOperation(
    async () => {
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

      // Estimate credits needed (defer actual check until after AI calls for accuracy)
      // TODO: Check why CLAUDE added this part
      // let estimatedCredits = 0;
      // if (userId) {
      //   const baseEstimate = await estimateAIMessageCost(userInput, modelCode);
      //   estimatedCredits = Math.ceil(baseEstimate * 2); // 2x buffer for multiple AI calls
      // }

      // Initialize round cost tracker
      let roundTracker: RoundCostTracker | null = null;
      if (userId && sessionId) {
        roundTracker = new RoundCostTracker(userId, sessionId, modelCode);
        // Register globally so background processes can track their AI calls
        registerRoundTracker(roundTracker.getRoundId(), roundTracker);
      }

      // Step 1: Analyze user input
      const sessionMetadata = {
        messageCount: messages.length,
        activeDurationMs: 0, // Will be properly calculated in store
      };
      const analysisResult = await analyzeUserInput(
        userInput,
        prevAnalysis,
        aiModel,
        userId,
        sessionId,
        sessionMetadata
      );
      const { analysis, modelTokenUsage: analysisUsage } = analysisResult;

      // Track analysis AI call
      if (roundTracker && analysisUsage) {
        roundTracker.trackAICall(
          "analysis",
          analysisUsage.usage?.prompt_tokens ?? 0,
          analysisUsage.usage?.completion_tokens ?? 0,
          analysisUsage.model ?? "unknown"
        );
      }

      // Step 2: Build conversation prompts
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
      const miraelResponse = await SendPromptsToAiWithRetry(conversationPrompts, aiModel);

      // Track response AI call
      if (roundTracker && miraelResponse.modelTokenUsage) {
        roundTracker.trackAICall(
          "response",
          miraelResponse.modelTokenUsage.usage?.prompt_tokens ?? 0,
          miraelResponse.modelTokenUsage.usage?.completion_tokens ?? 0,
          miraelResponse.modelTokenUsage.model ?? "unknown"
        );
      }

      // Step 4: Finalize round cost tracking and deduct credits
      let creditsUsed = 0;
      let roundCostSummary: RoundCostSummary | undefined;
      const totalCost = (analysisUsage?.costUSD || 0) + (miraelResponse.modelTokenUsage?.costUSD || 0);

      if (userId && roundTracker) {
        // Finalize round tracking (this calculates total cost from all tracked AI calls)
        roundCostSummary = await roundTracker.finalizeRound();

        // Unregister round tracker
        unregisterRoundTracker(roundCostSummary.roundId);

        // Deduct credits based on complete round cost
        if (!authId) {
          throw new Error("User authentication required for credit operations");
        }
        await checkAndDeductCredits(authId, roundCostSummary.totalCredits, "ai_usage", sessionId, {
          modelCode,
          roundId: roundCostSummary.roundId,
          totalInputTokens: roundCostSummary.totalInputTokens,
          totalOutputTokens: roundCostSummary.totalOutputTokens,
          totalTokens: roundCostSummary.totalTokens,
          breakdown: roundCostSummary.breakdown,
          aiCallsCount: roundCostSummary.aiCalls.length,
          durationMs: roundCostSummary.durationMs,
          messageLength: userInput.length,
          responseLength: miraelResponse.message.length,
        });

        creditsUsed = roundCostSummary.totalCredits;
      } else if (userId) {
        // Fallback to old calculation if no round tracker
        const totalInputTokens =
          (analysisUsage?.usage?.prompt_tokens ?? 0) + (miraelResponse.modelTokenUsage?.usage?.prompt_tokens ?? 0);
        const totalOutputTokens =
          (analysisUsage?.usage?.completion_tokens ?? 0) +
          (miraelResponse.modelTokenUsage?.usage?.completion_tokens ?? 0);
        const actualCreditsNeeded = await calculateAIMessageCost(modelCode, totalInputTokens, totalOutputTokens);

        if (!authId) {
          throw new Error("User authentication required for credit operations");
        }
        await checkAndDeductCredits(authId, actualCreditsNeeded, "ai_usage", sessionId, {
          modelCode,
          totalInputTokens,
          totalOutputTokens,
          messageLength: userInput.length,
          responseLength: miraelResponse.message.length,
        });

        creditsUsed = actualCreditsNeeded;
      }

      return {
        analysis,
        response: miraelResponse.message,
        tokenUsage: {
          analysisUsage,
          responseUsage: miraelResponse.modelTokenUsage,
        },
        cost: totalCost,
        creditsUsed,
        roundCostSummary,
      };
    },
    ERROR_CODES.CHAT_RESPONSE_FAILED,
    {
      operation: "open_chat_handle_user_input",
      userId,
      sessionId,
      metadata: {
        modelCode,
        locale,
        messageCount: messages.length,
        inputLength: userInput?.length || 0,
      },
    },
    "Open chat conversation processed successfully"
  );
}
