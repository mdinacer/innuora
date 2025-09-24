import { ActionableInsight } from "./actionable-insights.types";
import {
  AdaptiveRecommendation,
  ContextDetector,
  ContextTrigger,
  DynamicNudge,
  ProgressionEngine,
  UserProgressProfile,
} from "./adaptive-progression.types";

export class AdaptiveProgressionEngine implements ProgressionEngine, ContextDetector {
  /**
   * Calculate user's readiness to move to more advanced actions
   */
  calculateReadinessForAdvancement(profile: UserProgressProfile): number {
    const factors = {
      completionRate: profile.completionPatterns.overallRate * 0.3,
      averageEffectiveness: profile.effectivenessRatings.overallAverage * 10 * 0.3,
      consistency: this.calculateConsistencyScore(profile) * 0.2,
      streakStrength: Math.min(profile.currentStreakDays / 14, 1) * 100 * 0.2, // 2 weeks = 100%
    };

    return Math.min(
      factors.completionRate + factors.averageEffectiveness + factors.consistency + factors.streakStrength,
      100
    );
  }

  /**
   * Recommend optimal difficulty level based on performance
   */
  recommendNextDifficultyLevel(profile: UserProgressProfile): "beginner" | "intermediate" | "advanced" {
    const readiness = this.calculateReadinessForAdvancement(profile);
    const currentLevel = profile.currentDifficultyLevel;

    // Only advance if consistently performing well
    if (currentLevel === "beginner" && readiness > 75) return "intermediate";
    if (currentLevel === "intermediate" && readiness > 85) return "advanced";

    // Consider stepping back if struggling
    if (readiness < 40 && currentLevel === "advanced") return "intermediate";
    if (readiness < 25 && currentLevel === "intermediate") return "beginner";

    return currentLevel;
  }

  /**
   * Identify areas where user is struggling and provide adaptive recommendations
   */
  identifyStruggleAreas(profile: UserProgressProfile): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = [];

    // Check completion rates by action type
    profile.preferredActionTypes.forEach((preference) => {
      if (preference.completionRate < 50 && preference.dropoffRate > 60) {
        recommendations.push({
          type: "action_type_shift",
          confidence: 80,
          rationale: `Your completion rate for ${preference.actionType} is low (${preference.completionRate}%). Let's try different approaches.`,
          suggestedChanges: [
            `Reduce ${preference.actionType} frequency temporarily`,
            `Introduce shorter, easier variants`,
            `Pair with your strongest action types`,
          ],
          expectedImpact: "Higher completion rates and maintained momentum",
        });
      }
    });

    // Check if difficulty is too high
    if (profile.completionPatterns.overallRate < 40) {
      recommendations.push({
        type: "difficulty_decrease",
        confidence: 90,
        rationale: "Overall completion rate suggests current difficulty may be too challenging",
        suggestedChanges: [
          "Focus on beginner-level actions for 2 weeks",
          "Break complex actions into smaller steps",
          "Emphasize awareness practices over behavioral experiments",
        ],
        expectedImpact: "Rebuilt confidence and higher engagement",
      });
    }

    // Check timing optimization opportunities
    if (this.hasSuboptimalTiming(profile)) {
      recommendations.push({
        type: "timing_optimization",
        confidence: 75,
        rationale: "Your engagement varies significantly by time - we can optimize when actions are suggested",
        suggestedChanges: [
          `Schedule actions during your peak hours: ${profile.peakEngagementTimes.map((t) => `${t.dayOfWeek} ${t.hourRange[0]}-${t.hourRange[1]}`).join(", ")}`,
          "Avoid suggesting complex actions during low-energy times",
        ],
        expectedImpact: "20-30% improvement in completion rates",
      });
    }

    return recommendations;
  }

  /**
   * Optimize the sequence of actions based on user's progress patterns
   */
  optimizeActionSequencing(profile: UserProgressProfile, availableActions: string[]): string[] {
    // Sort actions by predicted success rate
    return availableActions.sort((a, b) => {
      const scoreA = this.predictActionSuccessRate(a, profile);
      const scoreB = this.predictActionSuccessRate(b, profile);
      return scoreB - scoreA;
    });
  }

  /**
   * Detect time-based emotional triggers (Sunday evening anxiety, etc.)
   */
  detectTimeBasedTriggers(userId: string, currentTime: Date): string[] {
    const triggers: string[] = [];
    const day = currentTime.getDay(); // 0 = Sunday
    const hour = currentTime.getHours();

    // Sunday evening trigger (common anticipatory anxiety)
    if (day === 0 && hour >= 17 && hour <= 21) {
      triggers.push("sunday_evening");
    }

    // Monday morning trigger (work anxiety)
    if (day === 1 && hour >= 6 && hour <= 10) {
      triggers.push("monday_morning");
    }

    // Late night overthinking trigger
    if (hour >= 22 || hour <= 2) {
      triggers.push("late_night_overthinking");
    }

    // End of workday transition
    if (hour >= 17 && hour <= 19 && day >= 1 && day <= 5) {
      triggers.push("workday_transition");
    }

    return triggers;
  }

  /**
   * Detect triggers based on conversation content
   */
  detectConversationTriggers(sessionContent: string, userTriggers: ContextTrigger[]): string[] {
    const detectedTriggers: string[] = [];
    const contentLower = sessionContent.toLowerCase();

    userTriggers.forEach((trigger) => {
      const triggerWords = trigger.triggerName.toLowerCase().split(" ");
      const hasAllWords = triggerWords.every((word) => contentLower.includes(word));

      if (hasAllWords) {
        detectedTriggers.push(trigger.triggerName);
      }
    });

    return detectedTriggers;
  }

  /**
   * Detect emotional state changes from intensity patterns
   */
  detectEmotionalStateChanges(intensityHistory: number[]): "spike" | "dip" | "stable" {
    if (intensityHistory.length < 2) return "stable";

    const recent = intensityHistory.slice(-3); // Last 3 measurements
    const average = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const previousAverage =
      intensityHistory.length >= 6 ? intensityHistory.slice(-6, -3).reduce((sum, val) => sum + val, 0) / 3 : average;

    const change = average - previousAverage;

    if (change > 2) return "spike";
    if (change < -2) return "dip";
    return "stable";
  }

  /**
   * Determine if user should be nudged based on context
   */
  shouldNudgeUser(userId: string, context: string[]): DynamicNudge | null {
    // Sunday evening nudge
    if (context.includes("sunday_evening")) {
      return {
        id: `nudge-${userId}-${Date.now()}`,
        userId,
        triggerCondition: "sunday_evening",
        message:
          "Sunday evening energy shift detected. This is your pattern - would a 2-minute awareness practice help?",
        actionId: "trigger-awareness-sunday-evening",
        urgency: "medium",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
        isRead: false,
        wasDismissed: false,
        wasActedUpon: false,
      };
    }

    // Family topic avoidance nudge
    if (context.includes("family_topic_mentioned")) {
      return {
        id: `nudge-${userId}-${Date.now()}`,
        userId,
        triggerCondition: "family_topic_mentioned",
        message: "I notice family topics came up - your gentle approach practice might be helpful here.",
        actionId: "avoidance-exposure-family-relationships",
        urgency: "low",
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isRead: false,
        wasDismissed: false,
        wasActedUpon: false,
      };
    }

    return null;
  }

  /**
   * Generate personalized action based on current context and progress
   */
  generateContextualAction(
    userId: string,
    context: string[],
    profile: UserProgressProfile,
    baseAction: ActionableInsight
  ): ActionableInsight {
    // Adapt difficulty based on current state and time
    const adaptedDifficulty = this.adaptDifficultyForContext(context, profile.currentDifficultyLevel);

    // Adapt time commitment based on context
    const adaptedTimeCommitment = this.adaptTimeCommitmentForContext(context, baseAction.timeCommitment);

    // Add contextual nudges to instructions
    const contextualInstructions = this.addContextualNudges(context, baseAction.instructions);

    return {
      ...baseAction,
      id: `${baseAction.id}-contextual-${Date.now()}`,
      difficulty: adaptedDifficulty,
      timeCommitment: adaptedTimeCommitment,
      instructions: contextualInstructions,
      title: `${baseAction.title} (Right Now)`,
      description: `${baseAction.description} - adapted for your current situation`,
    };
  }

  // Private helper methods
  private calculateConsistencyScore(profile: UserProgressProfile): number {
    const trend = profile.completionPatterns.weeklyTrend;
    const streakFactor = Math.min(profile.currentStreakDays / 7, 1); // 1 week = max score

    const trendScore = trend === "improving" ? 100 : trend === "stable" ? 70 : 40;
    return trendScore * 0.6 + streakFactor * 100 * 0.4;
  }

  private hasSuboptimalTiming(profile: UserProgressProfile): boolean {
    const engagementVariation =
      Math.max(...profile.peakEngagementTimes.map((p) => p.engagementScore)) -
      Math.min(...profile.peakEngagementTimes.map((p) => p.engagementScore));
    return engagementVariation > 40; // High variation suggests timing optimization opportunity
  }

  private predictActionSuccessRate(actionId: string, profile: UserProgressProfile): number {
    // This would use ML in production - for now, simple heuristics
    const baseScore = 50;

    // Boost score for action types user prefers
    const actionTypeBonus =
      profile.preferredActionTypes.find((pref) => actionId.includes(pref.actionType))?.completionRate || 50;

    return (baseScore + actionTypeBonus) / 2;
  }

  private adaptDifficultyForContext(
    context: string[],
    currentLevel: "beginner" | "intermediate" | "advanced"
  ): "beginner" | "intermediate" | "advanced" {
    // Reduce difficulty during stress/trigger times
    if (context.includes("sunday_evening") || context.includes("late_night_overthinking")) {
      return currentLevel === "advanced" ? "intermediate" : "beginner";
    }
    return currentLevel;
  }

  private adaptTimeCommitmentForContext(
    context: string[],
    originalCommitment: string
  ): "2-5 minutes" | "10-15 minutes" | "20-30 minutes" | "ongoing practice" {
    // Shorter commitments during stress/trigger times
    if (context.includes("sunday_evening") || context.includes("workday_transition")) {
      return "2-5 minutes";
    }
    return originalCommitment as any;
  }

  private addContextualNudges(context: string[], originalInstructions: any[]): any[] {
    const contextualInstructions = [...originalInstructions];

    // Add context-specific guidance
    if (context.includes("sunday_evening")) {
      contextualInstructions[0] = {
        ...contextualInstructions[0],
        tip: `${contextualInstructions[0].tip || ""} Since it's Sunday evening, be extra gentle with yourself.`,
      };
    }

    return contextualInstructions;
  }
}
