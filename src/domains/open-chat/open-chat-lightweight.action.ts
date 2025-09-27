"use server";

import { ChatCompletionMessageParam } from "openai/resources";

import { SendPromptsToAiWithRetry } from "@/app/actions/ai-client-actions";
import { deductCredits } from "@/app/actions/credit-actions";
import { ModelCode, MODELS_CODES_MAP } from "@/domains/ai-conversation/ai-models";
import { LanguagePrompt } from "@/domains/ai-conversation/prompts";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { AiModel, ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface LightweightResponseResult {
  response: string;
  tokenUsage: ModelTokenUsage | null;
  creditsUsed: number;
}

/**
 * Handles low-value user inputs with lightweight AI processing
 * Used for simple acknowledgments, brief confirmations, minimal content
 */
export async function handleLightweightUserInput(
  userInput: string,
  analysis: TherapeuticAnalysis,
  messages: OpenChatMessage[],
  locale: AppLocales = "en",
  modelCode: ModelCode,
  userId?: string,
  sessionId?: string
): Promise<LightweightResponseResult> {
  return await logger.wrapOperation(
    async () => {
      const aiModel = MODELS_CODES_MAP[modelCode] as AiModel;

      if (!aiModel) {
        logger.logErrorAndThrow(ERROR_CODES.CHAT_UNSUPPORTED_MODEL, new Error(`Unsupported model code: ${modelCode}`), {
          operation: "open_chat_lightweight_response",
          userId,
          sessionId,
          metadata: { modelCode },
        });
      }

      // Resolve authId for credit operations
      let authId: string | undefined;
      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { authId: true },
        });
        authId = user?.authId;
      }

      const languagePrompt = LanguagePrompt[locale];

      // Build lightweight conversation prompt
      const lightweightPrompts: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: `You are Innuora, a warm conversational companion.

The user just gave a brief acknowledgment or simple response. Provide a natural, contextually appropriate reply that:
- Acknowledges their input appropriately
- Continues the conversation thread naturally if there is one
- Keep it very brief (1 sentence maximum)
- Be warm and conversational, not clinical
- Show you're listening and ready to continue

${languagePrompt?.content || ""}`.trim(),
        },
        {
          role: "user",
          content: userInput.trim(),
        },
      ];

      // Generate lightweight AI response
      const result = await SendPromptsToAiWithRetry(lightweightPrompts, aiModel, {}, 2, 1000, authId);

      // Handle credit deduction
      let creditsUsed = 0;
      if (userId && authId && result.consumedCredits) {
        await deductCredits(authId, result.consumedCredits, "ai_usage", sessionId, {
          modelCode,
          messageLength: userInput.length,
          responseLength: result.message.length,
          processingType: "lightweight",
        });
        creditsUsed = result.consumedCredits;
      }

      return {
        response: result.message,
        tokenUsage: result.modelTokenUsage,
        creditsUsed,
      };
    },
    ERROR_CODES.CHAT_RESPONSE_FAILED,
    {
      operation: "open_chat_lightweight_response",
      userId,
      sessionId,
      metadata: {
        inputLength: userInput.length,
        analysisValue: analysis.analysis_value,
        modelCode,
      },
    },
    "Lightweight chat response generated"
  );
}
