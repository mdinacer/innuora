import {
  CrossSessionInsights,
  DistortionPattern,
  EmotionalIntensityTrend,
  PatternInsight,
  SessionOutcomeTrend,
} from "./insights.types";

// Mock data interfaces - will be replaced with real session data
interface SessionAnalysisData {
  sessionId: string;
  date: Date;
  intensity: "low" | "moderate" | "high";
  distortions: Array<{ type: string; severity: string; count: number }>;
  themes: Array<{ theme: string; frequency: string }>;
  coreBeliefs: Array<{ belief: string; count: number }>;
  crisis: "none" | "mild" | "moderate" | "high" | "immediate";
  endState: "clarity" | "overwhelm" | "neutral";
}

export class InsightsAnalyzer {
  static analyzeEmotionalIntensity(
    currentPeriodSessions: SessionAnalysisData[],
    previousPeriodSessions: SessionAnalysisData[]
  ): EmotionalIntensityTrend {
    const getCurrentIntensityScore = (sessions: SessionAnalysisData[]) => {
      if (sessions.length === 0) return 0;
      const scores = { low: 1, moderate: 2, high: 3 };
      const avgScore = sessions.reduce((sum, s) => sum + scores[s.intensity], 0) / sessions.length;
      return avgScore;
    };

    const currentScore = getCurrentIntensityScore(currentPeriodSessions);
    const previousScore = getCurrentIntensityScore(previousPeriodSessions);

    const getIntensityLevel = (score: number): "low" | "moderate" | "high" => {
      if (score <= 1.4) return "low";
      if (score <= 2.4) return "moderate";
      return "high";
    };

    const improvement = previousScore > 0 ? ((previousScore - currentScore) / previousScore) * 100 : 0;

    return {
      period: "month",
      current: getIntensityLevel(currentScore),
      previous: getIntensityLevel(previousScore),
      improvement: Math.round(improvement),
      trend: improvement > 10 ? "improving" : improvement < -10 ? "concerning" : "stable",
    };
  }

  static analyzeDistortionPatterns(
    currentPeriodSessions: SessionAnalysisData[],
    previousPeriodSessions: SessionAnalysisData[]
  ): DistortionPattern[] {
    const getDistortionCounts = (sessions: SessionAnalysisData[]) => {
      const counts: Record<string, number> = {};
      sessions.forEach((session) => {
        session.distortions.forEach((distortion) => {
          counts[distortion.type] = (counts[distortion.type] || 0) + distortion.count;
        });
      });
      return counts;
    };

    const currentCounts = getDistortionCounts(currentPeriodSessions);
    const previousCounts = getDistortionCounts(previousPeriodSessions);

    const patterns: DistortionPattern[] = [];
    const allDistortionTypes = new Set([...Object.keys(currentCounts), ...Object.keys(previousCounts)]);

    allDistortionTypes.forEach((type) => {
      const current = currentCounts[type] || 0;
      const previous = previousCounts[type] || 0;

      if (previous > 0 || current > 0) {
        const reduction = previous > 0 ? ((previous - current) / previous) * 100 : 0;

        patterns.push({
          type,
          currentFrequency: current,
          previousFrequency: previous,
          reduction: Math.round(reduction),
          trend: reduction > 20 ? "improving" : reduction < -20 ? "increasing" : "stable",
        });
      }
    });

    return patterns.sort((a, b) => b.reduction - a.reduction);
  }

  static generateKeyInsights(
    currentSessions: SessionAnalysisData[],
    previousSessions: SessionAnalysisData[],
    distortionPatterns: DistortionPattern[]
  ): PatternInsight[] {
    const insights: PatternInsight[] = [];

    // Self-awareness timing insight
    const avgMessagesBeforeAwareness = this.calculateAwarenessSpeed(currentSessions);
    if (avgMessagesBeforeAwareness > 0) {
      insights.push({
        id: "awareness-speed",
        category: "awareness",
        title: "You're catching patterns earlier",
        description: `You're noticing perfectionist thoughts within ${avgMessagesBeforeAwareness} messages on average`,
      });
    }

    // Distortion improvement insight
    const topImprovement = distortionPatterns[0];
    if (topImprovement && topImprovement.reduction > 30) {
      insights.push({
        id: "distortion-improvement",
        category: "progress",
        title: `${this.humanizeDistortionType(topImprovement.type)} patterns are shifting`,
        description: `${topImprovement.reduction}% reduction in frequency this month`,
        metric: {
          value: `${topImprovement.reduction}%`,
          change: topImprovement.reduction,
          direction: "down",
        },
      });
    }

    // Solution focus insight
    const solutionFocusIncrease = this.calculateSolutionFocus(currentSessions, previousSessions);
    if (solutionFocusIncrease > 20) {
      insights.push({
        id: "solution-focus",
        category: "strength",
        title: "You're finding solutions faster",
        description: `${solutionFocusIncrease}% more solution-focused conversations`,
        metric: {
          value: `${solutionFocusIncrease}%`,
          change: solutionFocusIncrease,
          direction: "up",
        },
      });
    }

    return insights;
  }

  static analyzeSessionOutcomes(sessions: SessionAnalysisData[]): SessionOutcomeTrend {
    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        clarityRate: 0,
        overwhelmReduction: 0,
        solutionFocusIncrease: 0,
      };
    }

    const clarityCount = sessions.filter((s) => s.endState === "clarity").length;
    const clarityRate = (clarityCount / sessions.length) * 100;

    return {
      totalSessions: sessions.length,
      clarityRate: Math.round(clarityRate),
      overwhelmReduction: 0, // Will be calculated with comparison data
      solutionFocusIncrease: 0, // Will be calculated with comparison data
    };
  }

  private static calculateAwarenessSpeed(sessions: SessionAnalysisData[]): number {
    // Simplified calculation - would analyze actual message patterns
    return Math.floor(Math.random() * 3) + 2; // 2-4 messages average
  }

  private static calculateSolutionFocus(current: SessionAnalysisData[], previous: SessionAnalysisData[]): number {
    // Simplified calculation - would analyze theme patterns
    return Math.floor(Math.random() * 40) + 20; // 20-60% improvement
  }

  private static humanizeDistortionType(type: string): string {
    const humanized: Record<string, string> = {
      all_or_nothing: "All-or-nothing thinking",
      overgeneralization: "Overgeneralization",
      mental_filter: "Mental filtering",
      disqualifying_positive: "Dismissing positives",
      jumping_to_conclusions: "Jumping to conclusions",
      magnification: "Magnifying problems",
      emotional_reasoning: "Emotional reasoning",
      should_statements: "Should statements",
      labeling: "Self-labeling",
      personalization: "Taking things personally",
    };

    return humanized[type] || type.replace(/_/g, " ");
  }
}
