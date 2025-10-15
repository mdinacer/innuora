"use server";

import { ChatCompletionMessageParam } from "openai/resources";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { deductCreditsFromUser } from "@/app/actions/credit-actions";
import { SessionAnalysis } from "@/domains/session-analysis/session-analysis.types";
import { SESSION_ADVANCED_SUMMARY_INSTRUCTIONS } from "@/domains/session-summary/session-summary.prompt";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
import type { ActionResult } from "@/types/action-result";
import type { AiMessageResponse } from "@/types/ai-model.types";

const LANGUAGES: Record<AppLocales, string> = {
  ar: "arabic",
  en: "english",
  fr: "french",
};

interface SessionSummaryResult {
  summary: string;
  tokenUsage: AiMessageResponse["modelTokenUsage"];
  creditsUsed: number;
}

export async function getSessionSummary(
  sessionAnalysis: SessionAnalysis,
  sessionMemory: string | null,
  locale: AppLocales = "en",
  authId?: string,
  sessionId?: string
): Promise<ActionResult<SessionSummaryResult>> {
  const language = LANGUAGES[locale];

  const instruction = SESSION_ADVANCED_SUMMARY_INSTRUCTIONS.replace("{{sessionMemory}}", sessionMemory ?? "")
    .replace("{{sessionsAnalysis}}", JSON.stringify(sessionAnalysis))
    .replace("{{lang}}", language);

  const result = await processAiPromptsWithRetry(
    [
      {
        role: "system",
        content: instruction,
      } as ChatCompletionMessageParam,
    ],
    {}
  );

  if (result.error) {
    return { data: null, error: result.error };
  }

  const aiResponse = result.data!;

  // Deduct credits for summary generation
  if (authId && aiResponse.consumedCredits > 0) {
    const deductResult = await deductCreditsFromUser(authId, aiResponse.consumedCredits, "ai_summary", sessionId, {
      operation: "session_summary_generation",
      tokensUsed: aiResponse.modelTokenUsage?.totalTokens || 0,
      locale,
    });

    if (deductResult.error) {
      logger.logWarning("Credit deduction failed for summary generation", {
        operation: "session_summary_credit_deduction_failed",
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
      summary: aiResponse.message,
      tokenUsage: aiResponse.modelTokenUsage,
      creditsUsed: aiResponse.consumedCredits,
    },
    error: null,
  };
}
