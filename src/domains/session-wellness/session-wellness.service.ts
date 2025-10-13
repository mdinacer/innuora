import { Session } from "@/domains/open-chat/open-chat.types";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { logger } from "@/lib/logging/unified-logger";

/**
 * Service for evaluating session wellness and suggesting conclusions
 * Extracted from use-chat-controller to separate business logic from UI concerns
 */
export class SessionWellnessService {
  /**
   * Evaluates session wellness after a message is processed
   * Runs in background, does not block UI
   * Returns token usage and credits consumed for tracking
   *
   * NOTE: analysisSnapshots are stored server-side only for security.
   * This wellness check runs with limited analysis data (no therapeutic insights).
   * For full wellness checks with analysis, this should be refactored to a server action.
   */
  async evaluateAfterMessage(
    session: Session | null,
    latestMessage: string,
    sessionId: string,
    locale: string,
    authId?: string
  ): Promise<{ tokenUsage: any; creditsUsed: number } | null> {
    if (!session) return null;

    // analysisSnapshots are now server-side only - wellness runs without them temporarily
    // TODO: Refactor wellness check to server action to access full therapeutic analysis
    const analysisSnapshots: TherapeuticAnalysis[] = [];

    // Dynamic import to avoid circular dependencies
    const { wellnessFrequencyManager } = await import("@/domains/session-wellness/session-wellness.frequency-manager");

    const messageCount = session.messages.length;
    const latestAnalysis = analysisSnapshots[analysisSnapshots.length - 1];
    const hasCrisisIndicators = latestAnalysis?.crisis !== "none" || latestAnalysis?.intensity === "high";

    // Check if wellness analysis should run based on frequency optimization
    if (wellnessFrequencyManager.shouldCheckWellness(sessionId, messageCount, hasCrisisIndicators)) {
      return await this.runWellnessCheck(
        session,
        analysisSnapshots,
        latestMessage,
        sessionId,
        messageCount,
        locale,
        authId
      );
    } else {
      this.logSkippedCheck(sessionId, messageCount, hasCrisisIndicators, locale);
      return null;
    }
  }

  /**
   * Executes wellness check with AI evaluation
   * Returns token usage and credits consumed for tracking
   */
  private async runWellnessCheck(
    session: Session,
    analysisSnapshots: TherapeuticAnalysis[],
    latestMessage: string,
    sessionId: string,
    messageCount: number,
    locale: string,
    authId?: string
  ): Promise<{ tokenUsage: any; creditsUsed: number } | null> {
    const { AISessionWellnessEngine } = await import("@/domains/session-wellness/session-wellness.ai");
    const { wellnessFrequencyManager } = await import("@/domains/session-wellness/session-wellness.frequency-manager");

    const aiWellnessEngine = new AISessionWellnessEngine();

    // Log wellness check execution with frequency stats
    const stats = wellnessFrequencyManager.getCheckStats(sessionId, messageCount);
    const savings = wellnessFrequencyManager.getTokenSavingsEstimate(sessionId, messageCount);

    logger.logInfo("Executing wellness check with frequency optimization", {
      operation: "session_wellness_check_optimized",
      sessionId,
      metadata: {
        messageCount,
        messagesSinceLastCheck: stats.messagesSinceLastCheck,
        estimatedTokensSaved: savings.estimatedTokensSaved,
        hasCrisisIndicators: analysisSnapshots[analysisSnapshots.length - 1]?.crisis !== "none",
        locale,
        authId,
      },
    });

    try {
      const result = await aiWellnessEngine.evaluateSessionWellness(session, analysisSnapshots, latestMessage, authId);
      const { wellness, tokenUsage, creditsUsed } = result;

      if (wellness.suggest_conclusion) {
        logger.logInfo("AI session wellness evaluation completed", {
          operation: "session_wellness_evaluation_complete",
          sessionId,
          metadata: {
            shouldEnd: wellness.should_end,
            suggestConclusion: wellness.suggest_conclusion,
            reasons: wellness.reasons,
            loopAssessment: wellness.loop_assessment,
            confidence: wellness.confidence,
            creditsUsed,
            tokensUsed: tokenUsage?.usage?.total_tokens || 0,
            locale,
          },
        });
        // TODO: Implement gentle conclusion guidance based on wellness.reasons and loop_assessment
      }

      return { tokenUsage, creditsUsed };
    } catch (error) {
      logger.logWarning("Session wellness evaluation failed", {
        operation: "session_wellness_evaluation_failed",
        sessionId,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          authId,
          locale,
        },
      });
      return null;
    }
  }

  /**
   * Logs when wellness check is skipped for frequency optimization
   */
  private logSkippedCheck(sessionId: string, messageCount: number, hasCrisisIndicators: boolean, locale: string): void {
    import("@/domains/session-wellness/session-wellness.frequency-manager").then(({ wellnessFrequencyManager }) => {
      const stats = wellnessFrequencyManager.getCheckStats(sessionId, messageCount);
      logger.logInfo("Wellness check skipped for frequency optimization", {
        operation: "session_wellness_check_skipped",
        sessionId,
        metadata: {
          messageCount,
          messagesSinceLastCheck: stats.messagesSinceLastCheck,
          timeSinceLastCheckMs: stats.timeSinceLastCheck,
          hasCrisisIndicators,
          locale,
        },
      });
    });
  }
}

// Export singleton instance
export const sessionWellnessService = new SessionWellnessService();
