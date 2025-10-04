//import { OpenAI } from "openai";

import { processAiPromptsWithRetry } from "@/app/actions/ai-client-actions";
import { deductCreditsFromUser } from "@/app/actions/credit-actions";
import { getActiveSessionDuration } from "@/domains/active-session/active-session.utils";
import { Session } from "@/domains/open-chat/open-chat.types";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { logger } from "@/lib/logging/unified-logger";
import type { ModelTokenUsage } from "@/types/ai-model.types";
import SESSION_WELLNESS_PROMPT from "./session-wellness.prompt";
import { SessionWellness, SessionWellnessSchema } from "./session-wellness.types";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export class AISessionWellnessEngine {
  /**
   * Uses AI to evaluate whether a session should be concluded
   * Returns wellness assessment with token usage and credits consumed
   */
  async evaluateSessionWellness(
    session: Session,
    recentAnalyses: TherapeuticAnalysis[],
    lastUserMessage: string,
    authId?: string
  ): Promise<{ wellness: SessionWellness; tokenUsage: ModelTokenUsage | null; creditsUsed: number }> {
    const { durationMinutes } = getActiveSessionDuration(session);
    const messageCount = session.messages.length;

    // Safety check - never suggest conclusion during crisis or high intensity
    const latestAnalysis = recentAnalyses[recentAnalyses.length - 1];
    if (latestAnalysis) {
      if (latestAnalysis.crisis !== "none" || latestAnalysis.intensity === "high") {
        return {
          wellness: {
            suggest_conclusion: false,
            should_end: false,
            reasons: [],
            loop_assessment: "none",
            confidence: "high",
          },
          tokenUsage: null,
          creditsUsed: 0,
        };
      }
    }

    // Prepare context for AI evaluation with progression indicators
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
      progression_indicators:
        recentAnalyses.length >= 2
          ? {
              readiness_trend: this.getReadinessTrend(recentAnalyses),
              rumination_trend: this.getRuminationTrend(recentAnalyses),
              beliefs_emerging: this.areNewBeliefsEmerging(recentAnalyses),
              distortion_severity_trend: this.getDistortionTrend(recentAnalyses),
              theme_evolution: this.getThemeEvolution(recentAnalyses),
            }
          : null,
    };

    try {
      const result = await processAiPromptsWithRetry(
        [
          SESSION_WELLNESS_PROMPT,
          {
            role: "user",
            content: JSON.stringify(contextData, null, 2),
          },
        ],
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
        return {
          wellness: {
            suggest_conclusion: false,
            should_end: false,
            reasons: [],
            loop_assessment: "none",
            confidence: "low",
          },
          tokenUsage: null,
          creditsUsed: 0,
        };
      }

      const content = response.message;
      if (!content) {
        return {
          wellness: {
            suggest_conclusion: false,
            should_end: false,
            reasons: [],
            loop_assessment: "none",
            confidence: "low",
          },
          tokenUsage: null,
          creditsUsed: 0,
        };
      }

      const parsedResult = JSON.parse(content);
      const validatedResult = SessionWellnessSchema.parse(parsedResult);

      // Deduct credits for wellness evaluation
      if (authId && response.consumedCredits > 0) {
        const deductResult = await deductCreditsFromUser(
          authId,
          response.consumedCredits,
          "ai_wellness_check",
          session.id,
          {
            operation: "session_wellness_evaluation",
            tokensUsed: response.modelTokenUsage?.usage?.total_tokens || 0,
            messageCount,
            durationMinutes,
          }
        );

        if (deductResult.error) {
          logger.logWarning("Credit deduction failed for wellness evaluation", {
            operation: "session_wellness_credit_deduction_failed",
            sessionId: session.id,
            metadata: {
              authId,
              creditsUsed: response.consumedCredits,
              error: deductResult.error.message,
            },
          });
        }
      }

      return {
        wellness: validatedResult,
        tokenUsage: response.modelTokenUsage,
        creditsUsed: response.consumedCredits,
      };
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
      // Fallback to safe defaults with new schema
      return {
        wellness: {
          suggest_conclusion: messageCount > 40 || durationMinutes > 60,
          should_end: messageCount > 50, // Hard limit
          reasons: messageCount > 40 ? ["length"] : [],
          loop_assessment: "none",
          confidence: "low",
        },
        tokenUsage: null,
        creditsUsed: 0,
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

  private getRuminationTrend(analyses: TherapeuticAnalysis[]): string {
    if (analyses.length < 2) return "stable";

    const current = analyses[analyses.length - 1].behavioral_patterns.find((p) => p.type === "rumination");
    const previous = analyses[analyses.length - 2].behavioral_patterns.find((p) => p.type === "rumination");

    if (!current && !previous) return "none";
    if (!previous && current) return "emerging";
    if (previous && !current) return "resolved";

    // Both exist, compare severity
    if (!current || !previous) return "stable"; // Type guard

    const severityMap = { mild: 1, moderate: 2, severe: 3 };
    const currentSeverity = severityMap[current.severity];
    const previousSeverity = severityMap[previous.severity];

    if (currentSeverity < previousSeverity) return "improving";
    if (currentSeverity > previousSeverity) return "worsening";
    return "stable";
  }

  private areNewBeliefsEmerging(analyses: TherapeuticAnalysis[]): boolean {
    if (analyses.length < 2) return false;

    const currentBeliefs = analyses[analyses.length - 1].core_beliefs.map((b) => b.belief);
    const previousBeliefs = analyses[analyses.length - 2].core_beliefs.map((b) => b.belief);

    // Check if any current beliefs are new (not in previous)
    return currentBeliefs.some((belief) => !previousBeliefs.includes(belief));
  }

  private getDistortionTrend(analyses: TherapeuticAnalysis[]): string {
    if (analyses.length < 2) return "stable";

    const current = analyses[analyses.length - 1].distortions;
    const previous = analyses[analyses.length - 2].distortions;

    // Calculate average severity
    const severityMap = { mild: 1, moderate: 2, severe: 3 };

    const currentAvg =
      current.length > 0 ? current.reduce((sum, d) => sum + severityMap[d.severity], 0) / current.length : 0;
    const previousAvg =
      previous.length > 0 ? previous.reduce((sum, d) => sum + severityMap[d.severity], 0) / previous.length : 0;

    if (currentAvg < previousAvg) return "improving";
    if (currentAvg > previousAvg) return "worsening";
    return "stable";
  }

  private getThemeEvolution(analyses: TherapeuticAnalysis[]): string {
    if (analyses.length < 2) return "stable";

    const current = analyses[analyses.length - 1].themes;
    const previous = analyses[analyses.length - 2].themes;

    // Check if themes are deepening (frequency increasing)
    const frequencyMap = { occasional: 1, frequent: 2, pervasive: 3 };

    let deepeningCount = 0;
    let stagnantCount = 0;

    current.forEach((currTheme) => {
      const prevTheme = previous.find((p) => p.theme === currTheme.theme);
      if (prevTheme) {
        const currFreq = frequencyMap[currTheme.frequency];
        const prevFreq = frequencyMap[prevTheme.frequency];

        if (currFreq > prevFreq) deepeningCount++;
        else if (currFreq === prevFreq) stagnantCount++;
      }
    });

    if (deepeningCount > 0) return "deepening";
    if (stagnantCount === current.length && current.length > 0) return "stagnant";
    return "evolving";
  }
}
