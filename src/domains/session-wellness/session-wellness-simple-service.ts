"use server";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { deductCreditsFromUser } from "@/app/actions/credit-actions";
import { getAuthenticatedUserContext } from "@/app/actions/user-context";
import { Session } from "@/domains/open-chat/open-chat.types";
import { logAiOperation } from "@/lib/ai-operations/ai-operation-logger";
import { logger } from "@/lib/logging/unified-logger";
import { getSessionContext } from "@/lib/session/session-context-service";
import SESSION_WELLNESS_PROMPT from "./session-wellness.prompt";
import { SessionWellness, SessionWellnessSchema } from "./session-wellness.types";

type SessionWellnessResult = {
  wellness: SessionWellness;
  tokenUsage: any | null;
  creditsUsed: number;
};

/**
 * Runs AI wellness evaluation every 10 messages (non-blocking)
 */
export async function runSessionWellnessCheck(
  session: Session,
  lastUserMessage: string
): Promise<SessionWellnessResult | null> {
  const authenticatedUser = await getAuthenticatedUserContext();

  // Fetch session context WITH ownership validation
  const sessionContext = await getSessionContext(session.id, authenticatedUser.id);
  const prevAnalysis = sessionContext.analysisSnapshots.slice(-3); // Last 3 analyses

  // analysisSnapshots is already TherapeuticAnalysisWithMessageId[], which extends TherapeuticAnalysis

  const messageCount = session.messages.length;
  const latestAnalysis = prevAnalysis.at(-1);

  // Frequency + safety gates
  if (messageCount % 10 !== 0) return null;
  if (latestAnalysis?.crisis !== "none" || latestAnalysis?.intensity === "high") return null;

  const context = {
    message_count: messageCount,
    last_user_message: lastUserMessage,
    latest_analysis: latestAnalysis
      ? {
          intensity: latestAnalysis.intensity,
          crisis: latestAnalysis.crisis,
          therapeutic_readiness: latestAnalysis.therapeutic_readiness,
          themes: latestAnalysis.themes,
          distortions: latestAnalysis.distortions,
        }
      : null,
  };

  try {
    const result = await processAiPromptsWithRetry(
      [SESSION_WELLNESS_PROMPT, { role: "user", content: JSON.stringify(context) }],
      { temperature: 0.1, max_completion_tokens: 200 }
    );

    if (result.error) throw new Error(result.error.message);
    const content = result.data?.message;
    if (!content) throw new Error("Empty AI response");

    const parsed = JSON.parse(content);
    const wellness = SessionWellnessSchema.parse(parsed);

    // Deduct credits (fire and forget)
    if (authenticatedUser.authId && result.data.consumedCredits > 0) {
      deductCreditsFromUser(
        authenticatedUser.authId,
        result.data.consumedCredits,
        "ai_wellness_check",
        session.id
      ).catch(() => {});
    }

    // Log AI operation (fire-and-forget)
    if (result.data.modelTokenUsage && authenticatedUser.id) {
      logAiOperation({
        userId: authenticatedUser.id,
        sessionId: session.id,
        operation: "SESSION_WELLNESS",
        tokenUsage: result.data.modelTokenUsage,
        creditsCharged: result.data.consumedCredits || 0,
      }).catch((error) => {
        logger.logWarning("Failed to log AI operation", {
          operation: "session_wellness_log_ai_operation_failed",
          sessionId: session.id,
          metadata: { error: error instanceof Error ? error.message : String(error) },
        });
      });
    }

    console.log("Session wellness:", wellness);

    return {
      wellness,
      tokenUsage: result.data.modelTokenUsage || null,
      creditsUsed: result.data.consumedCredits || 0,
    };
  } catch (error) {
    logger.logWarning("Session wellness check failed", {
      operation: "session_wellness_check_failed",
      sessionId: session.id,
      metadata: { error: String(error) },
    });
    return null;
  }
}
