"use server";

import { Profile } from "@prisma/client";
import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { deductCreditsFromUser } from "@/app/actions/credit-actions";
import { SecurityProtocolPrompt } from "@/domains/ai-conversation/prompts";
import { ChatContextManager } from "@/domains/chat-context/chat-context.manager";
import { SESSION_MEMORY_REFERENCE_INSTRUCTIONS } from "@/domains/session-memory/session-memory.prompt";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { logAiOperation } from "@/lib/ai-operations/ai-operation-logger";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface LightweightResponseResult {
  response: string;
  tokenUsage: ModelTokenUsage | null;
  creditsUsed: number;
}

/**
 * Handles low-value user inputs with lightweight AI processing
 * Used for simple acknowledgments, brief confirmations, minimal content
 *
 * NOTE: "Lightweight" refers to optimization strategy (simpler modules, fewer rounds),
 * NOT reduced quality. Full context, memory, and localization are maintained.
 */
export async function handleLightweightUserInput(
  userInput: string,
  analysis: TherapeuticAnalysis,
  messages: OpenChatMessage[],
  profile: Profile | null,
  prevMemory: string | null,
  locale: AppLocales = "en",
  userId?: string,
  sessionId?: string
): Promise<LightweightResponseResult> {
  // This function does NOT wrap with wrapOperation because it's called from within another wrapOperation
  // and we want to return LightweightResponseResult directly, not ActionResult
  try {
    // Resolve authId for credit operations
    let authId: string | undefined;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { authId: true },
      });
      authId = user?.authId;
    }

    // Get tone descriptor for lightweight response
    const toneDescriptor = {
      low: { en: "calm and warm", ar: "هادئة ودافئة", fr: "calme et chaleureuse" },
      moderate: { en: "grounded and empathetic", ar: "متوازنة ومتفهمة", fr: "ancrée et empathique" },
      high: { en: "gentle and contained", ar: "لطيفة ومتمالكة", fr: "douce et contenante" },
    }[analysis.intensity]?.[locale];

    // Build lightweight persona (simplified, brief, contextual)
    const lightweightPersona: Record<AppLocales, string> = {
      en: `You are Innuora, a warm conversational companion.

The user gave a brief acknowledgment or simple response. Reply naturally:
- Keep it very short (1-2 sentences max)
- Be ${toneDescriptor}, not clinical
- Continue the conversation thread naturally
- Show you're listening and present`,

      ar: `أنت Innuora، رفيقة محادثة دافئة.

المستخدم أعطى إقرارًا موجزًا أو ردًا بسيطًا. أجيبي بشكل طبيعي:
- اجعليه قصيرًا جدًا (جملة أو جملتان كحد أقصى)
- كوني ${toneDescriptor}، وليس سريريًا
- واصلي خط المحادثة بشكل طبيعي
- أظهري أنك تستمعين وحاضرة`,

      fr: `Vous êtes Innuora, une compagne de conversation chaleureuse.

L'utilisateur a donné un bref accusé de réception ou une réponse simple. Répondez naturellement:
- Restez très bref (1-2 phrases max)
- Soyez ${toneDescriptor}, pas clinique
- Continuez le fil de conversation naturellement
- Montrez que vous écoutez et êtes présente`,
    };

    const personaPrompt: ChatCompletionMessageParam = {
      role: "system",
      content: lightweightPersona[locale],
    };

    // Build lightweight conversation context
    const lightweightPrompts: ChatCompletionMessageParam[] = [SecurityProtocolPrompt, personaPrompt];

    // Add last conversation round only (1 round = 1 user + 1 assistant message) for continuity
    const chatContextManager = new ChatContextManager(locale);
    const lastRoundPrompt = chatContextManager.buildChatHistoryPrompt(messages, 1, 2); // 1 round, 2 messages per round
    if (lastRoundPrompt) {
      lightweightPrompts.push(lastRoundPrompt);
    }

    // Add memory only if analysis indicates recall is needed
    if (analysis.recall_memory && prevMemory) {
      const memoryInstructions = SESSION_MEMORY_REFERENCE_INSTRUCTIONS.replace("{{session_memory}}", prevMemory);
      lightweightPrompts.push({
        role: "assistant",
        content: memoryInstructions,
      });
    }

    // Add user input
    lightweightPrompts.push({
      role: "user",
      content: userInput.trim(),
    });

    // Generate lightweight AI response
    const result = await processAiPromptsWithRetry(lightweightPrompts, {}, 2, 1000);

    // Unwrap ActionResult
    if (result.error) {
      throw new Error(result.error.message);
    }

    const aiResponse = result.data;
    if (!aiResponse) {
      throw new Error("AI response is null");
    }

    // Handle credit deduction
    let creditsUsed = 0;
    if (userId && authId && aiResponse.consumedCredits) {
      await deductCreditsFromUser(authId, aiResponse.consumedCredits, "ai_usage", sessionId, {
        messageLength: userInput.length,
        responseLength: aiResponse.message.length,
        processingType: "lightweight",
      });
      creditsUsed = aiResponse.consumedCredits;
    }

    // Log AI operation (fire-and-forget)
    if (aiResponse.modelTokenUsage && userId && sessionId) {
      logAiOperation({
        userId,
        sessionId,
        operation: "RESPONSE",
        tokenUsage: aiResponse.modelTokenUsage,
        creditsCharged: creditsUsed,
      }).catch((error) => {
        logger.logWarning("Failed to log AI operation", {
          operation: "open_chat_lightweight_log_ai_operation_failed",
          sessionId,
          metadata: { error: error instanceof Error ? error.message : String(error) },
        });
      });
    }

    return {
      response: aiResponse.message,
      tokenUsage: aiResponse.modelTokenUsage,
      creditsUsed,
    };
  } catch (error) {
    logger.logWarning("Lightweight chat response failed", {
      operation: "open_chat_lightweight_response",
      userId,
      sessionId,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        inputLength: userInput.length,
        analysisValue: analysis.analysis_value,
      },
    });
    throw error;
  }
}
