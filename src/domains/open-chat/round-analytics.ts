import { RoundCostSummary } from "./round-cost-tracker";

/**
 * Analytics for tracking round performance and token usage patterns
 */
export interface RoundAnalytics {
  // Current session analytics
  currentSession: {
    averageTokensPerRound: number;
    averageCreditsPerRound: number;
    averageDurationMs: number;
    totalRounds: number;
    totalTokens: number;
    totalCredits: number;
  };

  // Global user analytics (optional - could be expensive to compute)
  userGlobal?: {
    averageTokensPerRound: number;
    averageCreditsPerRound: number;
    totalRounds: number;
    totalTokens: number;
    totalCredits: number;
  };

  // Round breakdown analytics
  breakdown: {
    analysis: { avgInput: number; avgOutput: number; percentage: number };
    response: { avgInput: number; avgOutput: number; percentage: number };
    memory: { avgInput: number; avgOutput: number; percentage: number };
    session_wellness: { avgInput: number; avgOutput: number; percentage: number };
  };
}

export class RoundAnalyticsEngine {
  private sessionRounds: RoundCostSummary[] = [];

  /**
   * Add a completed round to analytics
   */
  addRound(round: RoundCostSummary): void {
    this.sessionRounds.push(round);
  }

  /**
   * Calculate current session analytics
   */
  getSessionAnalytics(): RoundAnalytics["currentSession"] {
    if (this.sessionRounds.length === 0) {
      return {
        averageTokensPerRound: 0,
        averageCreditsPerRound: 0,
        averageDurationMs: 0,
        totalRounds: 0,
        totalTokens: 0,
        totalCredits: 0,
      };
    }

    const totalTokens = this.sessionRounds.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalCredits = this.sessionRounds.reduce((sum, r) => sum + r.totalCredits, 0);
    const totalDuration = this.sessionRounds.reduce((sum, r) => sum + r.durationMs, 0);

    return {
      averageTokensPerRound: Math.round(totalTokens / this.sessionRounds.length),
      averageCreditsPerRound: Math.round(totalCredits / this.sessionRounds.length),
      averageDurationMs: Math.round(totalDuration / this.sessionRounds.length),
      totalRounds: this.sessionRounds.length,
      totalTokens,
      totalCredits,
    };
  }

  /**
   * Calculate breakdown analytics showing AI call type distribution
   */
  getBreakdownAnalytics(): RoundAnalytics["breakdown"] {
    if (this.sessionRounds.length === 0) {
      return {
        analysis: { avgInput: 0, avgOutput: 0, percentage: 0 },
        response: { avgInput: 0, avgOutput: 0, percentage: 0 },
        memory: { avgInput: 0, avgOutput: 0, percentage: 0 },
        session_wellness: { avgInput: 0, avgOutput: 0, percentage: 0 },
      };
    }

    const totals = {
      analysis: { input: 0, output: 0 },
      response: { input: 0, output: 0 },
      memory: { input: 0, output: 0 },
      session_wellness: { input: 0, output: 0 },
    };

    let grandTotalTokens = 0;

    // Sum up all tokens by type
    this.sessionRounds.forEach((round) => {
      Object.keys(totals).forEach((type) => {
        const key = type as keyof typeof totals;
        totals[key].input += round.breakdown[key].input;
        totals[key].output += round.breakdown[key].output;
      });
      grandTotalTokens += round.totalTokens;
    });

    // Calculate averages and percentages
    const breakdown: RoundAnalytics["breakdown"] = {
      analysis: {
        avgInput: Math.round(totals.analysis.input / this.sessionRounds.length),
        avgOutput: Math.round(totals.analysis.output / this.sessionRounds.length),
        percentage: Math.round(((totals.analysis.input + totals.analysis.output) / grandTotalTokens) * 100),
      },
      response: {
        avgInput: Math.round(totals.response.input / this.sessionRounds.length),
        avgOutput: Math.round(totals.response.output / this.sessionRounds.length),
        percentage: Math.round(((totals.response.input + totals.response.output) / grandTotalTokens) * 100),
      },
      memory: {
        avgInput: Math.round(totals.memory.input / this.sessionRounds.length),
        avgOutput: Math.round(totals.memory.output / this.sessionRounds.length),
        percentage: Math.round(((totals.memory.input + totals.memory.output) / grandTotalTokens) * 100),
      },
      session_wellness: {
        avgInput: Math.round(totals.session_wellness.input / this.sessionRounds.length),
        avgOutput: Math.round(totals.session_wellness.output / this.sessionRounds.length),
        percentage: Math.round(
          ((totals.session_wellness.input + totals.session_wellness.output) / grandTotalTokens) * 100
        ),
      },
    };

    return breakdown;
  }

  /**
   * Get complete analytics
   */
  getAnalytics(): RoundAnalytics {
    return {
      currentSession: this.getSessionAnalytics(),
      breakdown: this.getBreakdownAnalytics(),
    };
  }

  /**
   * Get latest round summary
   */
  getLatestRound(): RoundCostSummary | null {
    return this.sessionRounds.length > 0 ? this.sessionRounds[this.sessionRounds.length - 1] : null;
  }

  /**
   * Clear session analytics (useful for session reset)
   */
  clearSession(): void {
    this.sessionRounds = [];
  }
}
