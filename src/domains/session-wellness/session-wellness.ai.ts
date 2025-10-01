//import { OpenAI } from "openai";

import { SendPromptsToAi } from "@/app/actions/ai-client-actions";
import { getActiveSessionDuration } from "@/domains/active-session/active-session.utils";
import { Session } from "@/domains/open-chat/open-chat.types";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { logger } from "@/lib/logging/unified-logger";
import { GPT_4_1_MINI_MODEL } from "../ai-conversation/ai-models";
import SESSION_WELLNESS_PROMPT from "./session-wellness.prompt";
import { SessionWellness, SessionWellnessSchema } from "./session-wellness.types";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export class AISessionWellnessEngine {
  /**
   * Uses AI to evaluate whether a session should be concluded
   */
  async evaluateSessionWellness(
    session: Session,
    recentAnalyses: TherapeuticAnalysis[],
    lastUserMessage: string
  ): Promise<SessionWellness> {
    const { durationMinutes } = getActiveSessionDuration(session);
    const messageCount = session.messages.length;

    // Safety check - never suggest conclusion during crisis or high intensity
    const latestAnalysis = recentAnalyses[recentAnalyses.length - 1];
    if (latestAnalysis) {
      if (latestAnalysis.crisis !== "none" || latestAnalysis.intensity === "high") {
        return { suggest_conclusion: false };
      }
    }

    // Prepare context for AI evaluation
    const contextData = {
      last_user_message: lastUserMessage,
      session_duration_minutes: durationMinutes,
      message_count: messageCount,
      latest_analysis: latestAnalysis
        ? {
            intensity: latestAnalysis.intensity,
            crisis: latestAnalysis.crisis,
            therapeutic_readiness: latestAnalysis.therapeutic_readiness,
            themes: latestAnalysis.themes,
            distortions: latestAnalysis.distortions,
          }
        : null,
      recent_progress:
        recentAnalyses.length >= 2
          ? {
              current_distortions: latestAnalysis?.distortions.length || 0,
              previous_distortions: recentAnalyses[recentAnalyses.length - 2]?.distortions.length || 0,
              readiness_trend: this.getReadinessTrend(recentAnalyses),
            }
          : null,
    };

    try {
      const result = await SendPromptsToAi(
        [
          SESSION_WELLNESS_PROMPT,
          {
            role: "user",
            content: JSON.stringify(contextData, null, 2),
          },
        ],
        GPT_4_1_MINI_MODEL,
        {
          temperature: 0.1,
          max_tokens: 200,
        }
      );

      // Unwrap ActionResult
      if (result.error) {
        throw new Error(result.error.message);
      }

      const response = result.data;
      if (!response) {
        return { suggest_conclusion: false };
      }

      const content = response.message;
      if (!content) {
        return { suggest_conclusion: false };
      }

      const parsedResult = JSON.parse(content);
      const validatedResult = SessionWellnessSchema.parse(parsedResult);

      return validatedResult;
    } catch (error) {
      logger.logWarning("AI session wellness evaluation failed", {
        operation: "session_wellness_ai_evaluation_failed",
        sessionId: session.id,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          messageCount,
          durationMinutes,
          latestAnalysisIntensity: latestAnalysis?.intensity,
          latestAnalysisCrisis: latestAnalysis?.crisis,
        },
      });
      // Fallback to basic length-based evaluation
      return {
        suggest_conclusion: messageCount > 40 || durationMinutes > 60,
        reason: messageCount > 40 ? "length" : undefined,
        confidence: "low",
      };
    }
  }

  private getReadinessTrend(analyses: TherapeuticAnalysis[]): string {
    if (analyses.length < 2) return "stable";

    const latest = analyses[analyses.length - 1];
    const previous = analyses[analyses.length - 2];

    const readinessLevels = { resistant: 1, ambivalent: 2, ready: 3, engaged: 4 };

    const currentLevel = readinessLevels[latest.therapeutic_readiness];
    const previousLevel = readinessLevels[previous.therapeutic_readiness];

    if (currentLevel > previousLevel) return "improving";
    if (currentLevel < previousLevel) return "declining";
    return "stable";
  }
}
