"use server";

import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { deductCredits } from "@/app/actions/credit-actions";
import CHAT_MEMORY_BUILD_INSTRUCTIONS from "@/domains/session-memory/session-memory.prompt";
import { formatUserInputForMemory } from "@/domains/session-memory/session-memory.utils";
import { logger } from "@/lib/logging/unified-logger";
import type { ActionResult } from "@/types/action-result";
import type { AiMessageResponse } from "@/types/ai-model.types";

interface SessionMemoryResult {
  memory: string;
  tokenUsage: AiMessageResponse["modelTokenUsage"];
  creditsUsed: number;
}

export async function generateSessionMemory(
  userInput: string,
  existingMemory: string | null | undefined,
  authId?: string,
  sessionId?: string
): Promise<ActionResult<SessionMemoryResult>> {
  if (!userInput) {
    return {
      data: null,
      error: { code: "VALIDATION_FAILED", message: "User input is required" },
    };
  }

  const formattedUserMessage = formatUserInputForMemory(userInput);
  const memoryToInclude = existingMemory || "No existing memory.";

  const prompt = {
    role: "system",
    content: CHAT_MEMORY_BUILD_INSTRUCTIONS.replace("{{user_message}}", formattedUserMessage).replace(
      "{{existing_memory}}",
      memoryToInclude
    ),
  } as ChatCompletionMessageParam;

  const result = await processAiPromptsWithRetry([prompt], {});

  if (result.error) {
    return { data: null, error: result.error };
  }

  const aiResponse = result.data!;

  // Deduct credits for memory operation
  if (authId && aiResponse.consumedCredits > 0) {
    const deductResult = await deductCredits(authId, aiResponse.consumedCredits, "ai_memory_update", sessionId, {
      operation: "session_memory_generation",
      tokensUsed: aiResponse.modelTokenUsage?.usage?.total_tokens || 0,
    });

    if (deductResult.error) {
      logger.logWarning("Credit deduction failed for memory update", {
        operation: "session_memory_credit_deduction_failed",
        sessionId,
        metadata: {
          authId,
          creditsUsed: aiResponse.consumedCredits,
          error: deductResult.error.message,
        },
      });
    }
  }

  return {
    data: {
      memory: aiResponse.message,
      tokenUsage: aiResponse.modelTokenUsage,
      creditsUsed: aiResponse.consumedCredits,
    },
    error: null,
  };
}
