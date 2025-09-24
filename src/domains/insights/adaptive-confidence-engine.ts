import { ActionableInsight, ExerciseResult } from "./actionable-insights.types";
import { AdaptiveLearningProfile, PredictiveInsightEvent, PredictivePattern } from "./predictive-insight-intelligence";

/**
 * Adaptive confidence engine that learns from user interactions and improves predictions
 * This is the core intelligence that makes the system get smarter with each interaction
 */
export class AdaptiveConfidenceEngine {
  /**
   * Update insight confidence based on user feedback and outcomes
   * This is called after each user interaction with an insight
   */
  static updateInsightConfidence(
    insight: ActionableInsight,
    exerciseResult: ExerciseResult,
    userFeedback: {
      effectivenessRating?: number; // 1-10
      willUseAgain?: boolean;
      contextRelevance?: number; // 1-10
      timingRelevance?: number; // 1-10
    }
  ): number {
    let confidenceAdjustment = 0;

    // Factor 1: Exercise completion and engagement
    const completionRate = exerciseResult.completedSteps.length / (insight.instructions?.length || 1);
    if (completionRate >= 0.8) {
      confidenceAdjustment += 10; // High completion = good fit
    } else if (completionRate < 0.3) {
      confidenceAdjustment -= 15; // Low completion = poor fit
    }

    // Factor 2: Time spent (engagement indicator)
    const expectedTime = this.parseTimeCommitment(insight.timeCommitment);
    const engagementRatio = exerciseResult.timeSpent / expectedTime;

    if (engagementRatio > 1.2) {
      confidenceAdjustment += 5; // Spent more time = engaged
    } else if (engagementRatio < 0.5) {
      confidenceAdjustment -= 10; // Rushed through = not engaged
    }

    // Factor 3: Before/after emotional change
    if (exerciseResult.beforeRating && exerciseResult.afterRating) {
      const improvement = exerciseResult.beforeRating - exerciseResult.afterRating;
      confidenceAdjustment += improvement * 2; // Direct effectiveness
    }

    // Factor 4: User explicit feedback
    if (userFeedback.effectivenessRating) {
      const effectivenessBonus = (userFeedback.effectivenessRating - 5) * 3; // Scale around neutral
      confidenceAdjustment += effectivenessBonus;
    }

    if (userFeedback.willUseAgain === true) {
      confidenceAdjustment += 8;
    } else if (userFeedback.willUseAgain === false) {
      confidenceAdjustment -= 12;
    }

    // Factor 5: Context and timing relevance
    if (userFeedback.contextRelevance) {
      const contextBonus = (userFeedback.contextRelevance - 5) * 2;
      confidenceAdjustment += contextBonus;
    }

    if (userFeedback.timingRelevance) {
      const timingBonus = (userFeedback.timingRelevance - 5) * 2;
      confidenceAdjustment += timingBonus;
    }

    // Factor 6: Reflection quality (indicates cognitive processing)
    const reflectionQuality = this.assessReflectionQuality(exerciseResult.userReflection);
    confidenceAdjustment += reflectionQuality;

    return Math.max(0, Math.min(100, confidenceAdjustment));
  }

  /**
   * Calculate predictive accuracy and adjust future predictions
   */
  static updatePredictiveAccuracy(
    pattern: PredictivePattern,
    actualOutcome: {
      didTriggerOccur: boolean;
      actualTiming?: Date;
      actualIntensity?: number; // 1-10
      preventionSuccess?: boolean;
    }
  ): {
    updatedPattern: PredictivePattern;
    accuracyScore: number;
    learningEvent: PredictiveInsightEvent;
  } {
    let accuracyScore = 0;

    // Timing accuracy
    if (actualOutcome.actualTiming && actualOutcome.didTriggerOccur) {
      const predictedTime = new Date(Date.now() + pattern.anticipationWindow * 60000);
      const timingDiff = Math.abs(actualOutcome.actualTiming.getTime() - predictedTime.getTime());
      const timingAccuracy = Math.max(0, 100 - timingDiff / 60000); // penalize by minutes off
      accuracyScore += timingAccuracy * 0.4; // 40% weight on timing
    }

    // Occurrence accuracy
    if (actualOutcome.didTriggerOccur && pattern.confidence > 70) {
      accuracyScore += 40; // correctly predicted occurrence
    } else if (!actualOutcome.didTriggerOccur && pattern.confidence < 30) {
      accuracyScore += 40; // correctly predicted non-occurrence
    } else if (actualOutcome.didTriggerOccur !== pattern.confidence > 50) {
      accuracyScore -= 30; // wrong prediction
    }

    // Prevention success (if intervention was attempted)
    if (actualOutcome.preventionSuccess === true) {
      accuracyScore += 20; // successful intervention
    } else if (actualOutcome.preventionSuccess === false) {
      accuracyScore -= 10; // intervention failed
    }

    // Update pattern with new accuracy data
    const updatedPattern: PredictivePattern = {
      ...pattern,
      historicalAccuracy: this.exponentialMovingAverage(pattern.historicalAccuracy, accuracyScore, 0.3),
      confidence: this.adjustPredictiveConfidence(pattern.confidence, accuracyScore),
      lastUpdated: new Date(),
    };

    // Create learning event
    const learningEvent: PredictiveInsightEvent = {
      id: `accuracy-${pattern.id}-${Date.now()}`,
      userId: pattern.id.split("-")[0], // assume user ID is in pattern ID
      type: "calibration",
      predictionAccuracy: accuracyScore,
      confidenceAdjustment: updatedPattern.confidence - pattern.confidence,
      insightGenerated: this.generateAccuracyInsight(pattern, actualOutcome, accuracyScore),
      timestamp: new Date(),
      contextData: { originalPattern: pattern, actualOutcome },
    };

    return {
      updatedPattern,
      accuracyScore,
      learningEvent,
    };
  }

  /**
   * Multi-layered confidence calculation that considers various factors
   */
  static calculateMultiLayeredConfidence(
    rawInsightConfidence: number,
    historicalUserResponse: number,
    contextualFit: number,
    personalityMatch: number,
    temporalRelevance: number,
    learningProfile: AdaptiveLearningProfile
  ): {
    finalConfidence: number;
    confidenceFactors: {
      raw: number;
      historical: number;
      contextual: number;
      personality: number;
      temporal: number;
      calibration: number;
    };
  } {
    const factors = {
      raw: rawInsightConfidence,
      historical: historicalUserResponse,
      contextual: contextualFit,
      personality: personalityMatch,
      temporal: temporalRelevance,
      calibration: learningProfile.confidenceCalibration,
    };

    // Weighted combination of factors
    const weights = {
      raw: 0.3, // base insight quality
      historical: 0.25, // past user success
      contextual: 0.2, // current situation fit
      personality: 0.15, // personality alignment
      temporal: 0.05, // timing appropriateness
      calibration: 0.05, // overall calibration
    };

    let finalConfidence = 0;
    finalConfidence += factors.raw * weights.raw;
    finalConfidence += factors.historical * weights.historical;
    finalConfidence += factors.contextual * weights.contextual;
    finalConfidence += factors.personality * weights.personality;
    finalConfidence += factors.temporal * weights.temporal;
    finalConfidence *= factors.calibration; // multiplicative calibration

    return {
      finalConfidence: Math.max(0, Math.min(100, finalConfidence)),
      confidenceFactors: factors,
    };
  }

  /**
   * Learning engine that adapts based on user patterns
   */
  static adaptToUserPatterns(
    profile: AdaptiveLearningProfile,
    recentEvents: PredictiveInsightEvent[],
    timeWindow: number = 30 // days
  ): AdaptiveLearningProfile {
    const updatedProfile = { ...profile };
    const recentPredictions = recentEvents.filter(
      (event) =>
        event.type === "prediction" && event.timestamp > new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000)
    );

    const recentOutcomes = recentEvents.filter(
      (event) => event.type === "outcome" && event.timestamp > new Date(Date.now() - timeWindow * 24 * 60 * 60 * 1000)
    );

    // Update success/failure counts
    recentOutcomes.forEach((outcome) => {
      if (outcome.predictionAccuracy && outcome.predictionAccuracy > 70) {
        updatedProfile.successfulPredictions++;
      } else {
        updatedProfile.failedPredictions++;
      }
    });

    // Adapt timing preferences based on user engagement
    const engagementByHour = this.analyzeEngagementPatterns(recentEvents);
    updatedProfile.optimalInterventionTiming = this.findOptimalTiming(engagementByHour);

    // Adapt insight depth preferences based on completion rates
    const completionRates = this.analyzeCompletionRates(recentEvents);
    updatedProfile.preferredInsightDepth = this.inferPreferredDepth(completionRates);

    // Update confidence calibration based on recent accuracy
    const averageAccuracy = this.calculateAverageAccuracy(recentOutcomes);
    updatedProfile.confidenceCalibration = this.calculateConfidenceCalibration(averageAccuracy);

    return updatedProfile;
  }

  /**
   * Real-time confidence adjustment based on current context
   */
  static adjustConfidenceForContext(
    baseConfidence: number,
    contextFactors: {
      currentStressLevel?: number; // 1-10
      timeOfDay?: number; // 0-23
      recentTriggers?: string[]; // recent emotional triggers
      socialContext?: "alone" | "with_others" | "work" | "family";
      energyLevel?: number; // 1-10
    }
  ): number {
    let adjustedConfidence = baseConfidence;

    // Stress level adjustment
    if (contextFactors.currentStressLevel) {
      if (contextFactors.currentStressLevel > 7) {
        adjustedConfidence *= 0.8; // reduce confidence when highly stressed
      } else if (contextFactors.currentStressLevel < 3) {
        adjustedConfidence *= 1.1; // increase confidence when calm
      }
    }

    // Time of day adjustment
    if (contextFactors.timeOfDay) {
      // People generally have better cognitive resources during certain hours
      if (contextFactors.timeOfDay >= 9 && contextFactors.timeOfDay <= 16) {
        adjustedConfidence *= 1.05; // peak hours
      } else if (contextFactors.timeOfDay >= 22 || contextFactors.timeOfDay <= 6) {
        adjustedConfidence *= 0.9; // tired hours
      }
    }

    // Recent trigger adjustment
    if (contextFactors.recentTriggers && contextFactors.recentTriggers.length > 0) {
      adjustedConfidence *= 0.85; // reduce confidence when recently triggered
    }

    // Energy level adjustment
    if (contextFactors.energyLevel) {
      if (contextFactors.energyLevel < 4) {
        adjustedConfidence *= 0.8; // low energy = lower confidence
      } else if (contextFactors.energyLevel > 7) {
        adjustedConfidence *= 1.1; // high energy = higher confidence
      }
    }

    return Math.max(0, Math.min(100, adjustedConfidence));
  }

  // Private helper methods
  private static parseTimeCommitment(timeCommitment: string): number {
    // Convert time commitment string to seconds
    if (timeCommitment.includes("2-5")) return 210; // 3.5 minutes average
    if (timeCommitment.includes("10-15")) return 750; // 12.5 minutes average
    if (timeCommitment.includes("20-30")) return 1500; // 25 minutes average
    return 300; // default 5 minutes
  }

  private static assessReflectionQuality(reflection: string): number {
    if (!reflection || reflection.length < 10) return -5;

    let quality = 0;

    // Length indicates engagement
    if (reflection.length > 50) quality += 3;
    if (reflection.length > 100) quality += 2;

    // Emotional words indicate processing
    const emotionalWords = ["feel", "felt", "emotion", "realize", "understand", "insight"];
    const emotionCount = emotionalWords.filter((word) => reflection.toLowerCase().includes(word)).length;
    quality += emotionCount * 2;

    // Future planning indicates integration
    if (reflection.includes("will") || reflection.includes("plan") || reflection.includes("next time")) {
      quality += 5;
    }

    return Math.min(10, quality);
  }

  private static exponentialMovingAverage(current: number, newValue: number, alpha: number): number {
    return alpha * newValue + (1 - alpha) * current;
  }

  private static adjustPredictiveConfidence(currentConfidence: number, accuracyScore: number): number {
    const adjustment = (accuracyScore - 50) * 0.2; // Scale around 50% accuracy
    return Math.max(0, Math.min(100, currentConfidence + adjustment));
  }

  private static generateAccuracyInsight(
    pattern: PredictivePattern,
    actualOutcome: any,
    accuracyScore: number
  ): string {
    if (accuracyScore > 80) {
      return `Prediction accuracy for ${pattern.pattern} improved - system learning successful`;
    } else if (accuracyScore < 30) {
      return `Prediction accuracy for ${pattern.pattern} low - adjusting pattern recognition`;
    } else {
      return `Moderate prediction accuracy for ${pattern.pattern} - continuing to learn`;
    }
  }

  private static analyzeEngagementPatterns(events: PredictiveInsightEvent[]): Map<number, number> {
    const engagementByHour = new Map<number, number>();

    events.forEach((event) => {
      if (event.userResponse === "engaged") {
        const hour = event.timestamp.getHours();
        engagementByHour.set(hour, (engagementByHour.get(hour) || 0) + 1);
      }
    });

    return engagementByHour;
  }

  private static findOptimalTiming(engagementByHour: Map<number, number>): number {
    let maxEngagement = 0;
    let optimalHour = 14; // default to 2 PM

    engagementByHour.forEach((engagement, hour) => {
      if (engagement > maxEngagement) {
        maxEngagement = engagement;
        optimalHour = hour;
      }
    });

    return optimalHour;
  }

  private static analyzeCompletionRates(events: PredictiveInsightEvent[]): Map<string, number> {
    const completionRates = new Map<string, number>();
    // Would analyze completion rates by insight depth
    // For now, return mock data
    completionRates.set("surface", 0.8);
    completionRates.set("moderate", 0.6);
    completionRates.set("deep", 0.4);
    return completionRates;
  }

  private static inferPreferredDepth(completionRates: Map<string, number>): "surface" | "moderate" | "deep" {
    const surface = completionRates.get("surface") || 0;
    const moderate = completionRates.get("moderate") || 0;
    const deep = completionRates.get("deep") || 0;

    if (deep > 0.7) return "deep";
    if (moderate > 0.6) return "moderate";
    return "surface";
  }

  private static calculateAverageAccuracy(outcomes: PredictiveInsightEvent[]): number {
    if (outcomes.length === 0) return 50;

    const totalAccuracy = outcomes.reduce((sum, outcome) => sum + (outcome.predictionAccuracy || 0), 0);

    return totalAccuracy / outcomes.length;
  }

  private static calculateConfidenceCalibration(averageAccuracy: number): number {
    // If average accuracy is high, slightly increase confidence
    // If average accuracy is low, decrease confidence
    if (averageAccuracy > 80) return 1.1;
    if (averageAccuracy < 40) return 0.9;
    return 1.0;
  }
}

/**
 * Confidence explanation system - helps users understand why certain insights are suggested
 */
export class ConfidenceExplanationEngine {
  static generateConfidenceExplanation(
    insight: ActionableInsight,
    confidenceFactors: {
      raw: number;
      historical: number;
      contextual: number;
      personality: number;
      temporal: number;
      calibration: number;
    },
    finalConfidence: number
  ): string {
    const explanations: string[] = [];

    // Raw insight quality
    if (confidenceFactors.raw > 80) {
      explanations.push("This insight is based on strong psychological patterns");
    } else if (confidenceFactors.raw < 40) {
      explanations.push("This insight is exploratory - we're testing if it fits you");
    }

    // Historical success
    if (confidenceFactors.historical > 70) {
      explanations.push("You've had good success with similar exercises");
    } else if (confidenceFactors.historical < 30) {
      explanations.push("This is a new type of approach for you");
    }

    // Contextual fit
    if (confidenceFactors.contextual > 70) {
      explanations.push("This fits well with your current situation");
    }

    // Personality match
    if (confidenceFactors.personality > 70) {
      explanations.push("This aligns with your personal learning style");
    }

    // Temporal relevance
    if (confidenceFactors.temporal > 70) {
      explanations.push("The timing seems right for this approach");
    } else if (confidenceFactors.temporal < 30) {
      explanations.push("You might want to try this later when you have more energy");
    }

    if (explanations.length === 0) {
      return "I'm suggesting this based on your conversation patterns";
    }

    return explanations.join(". ") + ".";
  }

  static generateConfidenceVisualization(
    finalConfidence: number,
    factors: any
  ): {
    confidenceLevel: "low" | "moderate" | "high";
    visualIndicator: string;
    detailBreakdown: Array<{ factor: string; contribution: number; description: string }>;
  } {
    let confidenceLevel: "low" | "moderate" | "high";
    if (finalConfidence > 75) confidenceLevel = "high";
    else if (finalConfidence > 50) confidenceLevel = "moderate";
    else confidenceLevel = "low";

    const visualIndicator = "●".repeat(Math.ceil(finalConfidence / 20));

    const detailBreakdown = [
      { factor: "Pattern Strength", contribution: factors.raw, description: "How clear this pattern is" },
      {
        factor: "Your Success Rate",
        contribution: factors.historical,
        description: "How well this usually works for you",
      },
      { factor: "Current Fit", contribution: factors.contextual, description: "How relevant this is right now" },
      { factor: "Personal Match", contribution: factors.personality, description: "How this fits your style" },
      { factor: "Timing", contribution: factors.temporal, description: "Whether now is a good time" },
    ];

    return {
      confidenceLevel,
      visualIndicator,
      detailBreakdown,
    };
  }
}
