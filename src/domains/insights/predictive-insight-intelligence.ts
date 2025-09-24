import { AiModel } from "@/types/ai-model.types";
import {
  AdvancedInsightsProfile,
  AvoidancePattern,
  BehavioralWiring,
  EmotionalTrigger,
  ProgressBlindSpot,
  RecoverySignature,
} from "./advanced-insights.types";
import { ActionableInsight, ExerciseResult } from "./actionable-insights.types";

// Extended types for predictive intelligence
export interface PredictivePattern {
  id: string;
  type: "temporal" | "contextual" | "emotional_cascade" | "trigger_chain";
  pattern: string;

  // Temporal patterns (time-based predictions)
  timeOfDay?: number[];
  dayOfWeek?: number[];
  seasonalTrends?: SeasonalPattern[];

  // Contextual patterns (situation-based)
  contextTriggers?: string[];
  environmentalFactors?: string[];

  // Prediction metadata
  nextLikelyTrigger?: string;
  anticipationWindow: number; // minutes before pattern typically manifests
  preventionOpportunity: number; // probability we can intervene (0-100)

  confidence: number;
  historicalAccuracy: number; // how often our predictions were right
  lastUpdated: Date;
}

export interface SeasonalPattern {
  season: "spring" | "summer" | "fall" | "winter";
  modifier: number; // -1 to 1 (negative = worse, positive = better)
  specificTriggers: string[];
}

export interface AdaptiveLearningProfile {
  userId: string;

  // Learning metadata
  totalInteractions: number;
  successfulPredictions: number;
  failedPredictions: number;
  userCorrectionCount: number;

  // Adaptation weights (learned from user feedback)
  personalityWeights: {
    introversion: number; // affects social trigger sensitivity
    neuroticism: number; // affects anxiety-based patterns
    conscientiousness: number; // affects perfectionism patterns
    openness: number; // affects change readiness
    agreeableness: number; // affects conflict avoidance
  };

  // User-specific learning patterns
  preferredInsightDepth: "surface" | "moderate" | "deep";
  responseToActionTypes: Map<string, number>; // effectiveness by action type
  optimalInterventionTiming: number; // when user is most receptive (hours)

  // Dynamic confidence adjustments
  confidenceCalibration: number; // adjustment factor based on accuracy
  lastCalibrationUpdate: Date;
}

export interface PredictiveInsightEvent {
  id: string;
  userId: string;
  type: "prediction" | "intervention" | "outcome" | "calibration";

  // Prediction events
  predictedPattern?: string;
  predictionConfidence?: number;
  timeToManifest?: number; // predicted minutes until trigger

  // Intervention events
  interventionType?: string;
  interventionTiming?: number; // minutes before predicted trigger
  userResponse?: "engaged" | "dismissed" | "delayed";

  // Outcome events
  actualOutcome?: string;
  predictionAccuracy?: number; // 0-100
  interventionEffectiveness?: number; // 0-100
  userSatisfaction?: number; // 1-10

  // Learning events
  insightGenerated?: string;
  confidenceAdjustment?: number;

  timestamp: Date;
  contextData?: Record<string, any>;
}

export class PredictiveInsightIntelligence {
  /**
   * Core intelligence method: Generate predictive insights with adaptive learning
   */
  static async generateIntelligentInsights(
    userId: string,
    rawInsights: AdvancedInsightsProfile,
    userFeedbackHistory: ExerciseResult[],
    adaptiveLearning: AdaptiveLearningProfile,
    currentContext: { timeOfDay: number; dayOfWeek: number; recentStressors: string[] }
  ): Promise<{
    actionableInsights: ActionableInsight[];
    predictivePatterns: PredictivePattern[];
    anticipatoryNudges: AnticipatorNudge[];
    adaptedProfile: AdaptiveLearningProfile;
  }> {
    // 1. Learn from user feedback to improve future suggestions
    const updatedProfile = await this.updateLearningProfile(adaptiveLearning, userFeedbackHistory);

    // 2. Generate predictive patterns based on historical data
    const predictivePatterns = await this.identifyPredictivePatterns(rawInsights, currentContext);

    // 3. Create actionable insights with adaptive confidence scoring
    const actionableInsights = await this.generateAdaptiveInsights(
      rawInsights,
      predictivePatterns,
      updatedProfile,
      currentContext
    );

    // 4. Generate anticipatory nudges for immediate intervention
    const anticipatoryNudges = await this.generateAnticipatoryNudges(
      predictivePatterns,
      currentContext,
      updatedProfile
    );

    return {
      actionableInsights,
      predictivePatterns,
      anticipatoryNudges,
      adaptedProfile: updatedProfile,
    };
  }

  /**
   * Learn from user feedback to improve prediction accuracy
   */
  private static async updateLearningProfile(
    currentProfile: AdaptiveLearningProfile,
    recentFeedback: ExerciseResult[]
  ): Promise<AdaptiveLearningProfile> {
    const profile = { ...currentProfile };

    // Analyze effectiveness by action type
    recentFeedback.forEach(result => {
      const effectiveness = this.calculateEffectiveness(result);
      const actionType = result.exerciseType;

      // Update action type preferences
      const currentEffectiveness = profile.responseToActionTypes.get(actionType) || 50;
      const updatedEffectiveness = this.exponentialMovingAverage(currentEffectiveness, effectiveness, 0.3);
      profile.responseToActionTypes.set(actionType, updatedEffectiveness);

      // Adapt personality weights based on user responses
      this.adaptPersonalityWeights(profile, result);

      profile.totalInteractions++;
    });

    // Calibrate confidence based on recent accuracy
    profile.confidenceCalibration = this.calculateConfidenceCalibration(profile, recentFeedback);
    profile.lastCalibrationUpdate = new Date();

    return profile;
  }

  /**
   * Identify predictive patterns that anticipate emotional states
   */
  private static async identifyPredictivePatterns(
    insights: AdvancedInsightsProfile,
    context: { timeOfDay: number; dayOfWeek: number; recentStressors: string[] }
  ): Promise<PredictivePattern[]> {
    const patterns: PredictivePattern[] = [];

    // Temporal patterns: time-based trigger predictions
    for (const trigger of insights.emotionalTriggers) {
      if (this.hasTemporalPattern(trigger)) {
        patterns.push({
          id: `temporal-${trigger.trigger}`,
          type: "temporal",
          pattern: `${trigger.trigger} typically occurs on ${this.getTemporalDescription(trigger)}`,
          timeOfDay: this.extractTimePatterns(trigger),
          dayOfWeek: this.extractDayPatterns(trigger),
          nextLikelyTrigger: trigger.trigger,
          anticipationWindow: this.calculateAnticipationWindow(trigger),
          preventionOpportunity: this.calculatePreventionOpportunity(trigger),
          confidence: trigger.confidence * 0.9, // slightly lower for predictions
          historicalAccuracy: 0, // will be updated with real data
          lastUpdated: new Date(),
        });
      }
    }

    // Contextual patterns: situation-based predictions
    for (const wiring of insights.behavioralWiring) {
      if (this.hasContextualTriggers(wiring, context.recentStressors)) {
        patterns.push({
          id: `contextual-${wiring.id}`,
          type: "contextual",
          pattern: `${wiring.pattern} likely to activate in current context`,
          contextTriggers: context.recentStressors,
          nextLikelyTrigger: wiring.coreBeliefTrigger,
          anticipationWindow: 60, // 1 hour prediction window
          preventionOpportunity: 75, // contextual patterns are more preventable
          confidence: wiring.confidence * 0.8,
          historicalAccuracy: 0,
          lastUpdated: new Date(),
        });
      }
    }

    // Emotional cascade patterns: predict escalation chains
    patterns.push(...this.identifyEmotionalCascades(insights));

    return patterns;
  }

  /**
   * Generate actionable insights with adaptive confidence scoring
   */
  private static async generateAdaptiveInsights(
    rawInsights: AdvancedInsightsProfile,
    predictivePatterns: PredictivePattern[],
    learningProfile: AdaptiveLearningProfile,
    context: any
  ): Promise<ActionableInsight[]> {
    const insights: ActionableInsight[] = [];

    // Generate insights from raw patterns
    const baseInsights = await this.generateBaseInsights(rawInsights);

    // Adapt insights based on user learning profile
    for (const insight of baseInsights) {
      const adaptedInsight = this.adaptInsightToUser(insight, learningProfile, predictivePatterns);
      insights.push(adaptedInsight);
    }

    // Generate predictive insights
    for (const pattern of predictivePatterns) {
      if (pattern.preventionOpportunity > 60) { // high prevention opportunity
        const preventiveInsight = await this.generatePreventiveInsight(pattern, learningProfile);
        if (preventiveInsight) {
          insights.push(preventiveInsight);
        }
      }
    }

    // Sort by adaptive confidence and user preferences
    return this.prioritizeAdaptiveInsights(insights, learningProfile);
  }

  /**
   * Generate anticipatory nudges for real-time intervention
   */
  private static async generateAnticipatoryNudges(
    patterns: PredictivePattern[],
    context: any,
    profile: AdaptiveLearningProfile
  ): Promise<AnticipatorNudge[]> {
    const nudges: AnticipatorNudge[] = [];

    for (const pattern of patterns) {
      const timeUntilTrigger = this.calculateTimeUntilTrigger(pattern, context);

      // Generate nudge if trigger is predicted within intervention window
      if (timeUntilTrigger > 0 && timeUntilTrigger <= pattern.anticipationWindow) {
        const nudge = await this.generateContextualNudge(pattern, timeUntilTrigger, profile);
        if (nudge) {
          nudges.push(nudge);
        }
      }
    }

    return nudges;
  }

  /**
   * Calculate effectiveness from exercise results
   */
  private static calculateEffectiveness(result: ExerciseResult): number {
    let effectiveness = 50; // baseline

    // Factor in before/after ratings
    if (result.beforeRating && result.afterRating) {
      const improvement = result.beforeRating - result.afterRating;
      effectiveness += improvement * 5; // scale improvement
    }

    // Factor in time spent (engagement indicator)
    if (result.timeSpent > 180) { // 3+ minutes indicates engagement
      effectiveness += 10;
    }

    // Factor in reflection quality (string length as proxy)
    if (result.userReflection && result.userReflection.length > 50) {
      effectiveness += 15;
    }

    // Factor in completed steps
    if (result.completedSteps.length > 2) {
      effectiveness += 10;
    }

    return Math.min(100, Math.max(0, effectiveness));
  }

  /**
   * Exponential moving average for smooth learning
   */
  private static exponentialMovingAverage(current: number, newValue: number, alpha: number): number {
    return alpha * newValue + (1 - alpha) * current;
  }

  /**
   * Adapt personality weights based on user exercise responses
   */
  private static adaptPersonalityWeights(profile: AdaptiveLearningProfile, result: ExerciseResult): void {
    // Infer personality traits from exercise responses
    if (result.exerciseType === "cognitive_restructuring" && result.afterRating! > result.beforeRating!) {
      // User responds well to cognitive approaches - likely higher openness
      profile.personalityWeights.openness += 0.05;
    }

    if (result.timeSpent > 300) { // 5+ minutes
      // User willing to spend time on deep work - higher conscientiousness
      profile.personalityWeights.conscientiousness += 0.03;
    }

    if (result.userReflection.includes("anxiety") || result.userReflection.includes("worry")) {
      // User reports anxiety frequently - adjust neuroticism
      profile.personalityWeights.neuroticism += 0.02;
    }

    // Keep weights in bounds [0, 1]
    Object.keys(profile.personalityWeights).forEach(key => {
      const typedKey = key as keyof typeof profile.personalityWeights;
      profile.personalityWeights[typedKey] = Math.min(1, Math.max(0, profile.personalityWeights[typedKey]));
    });
  }

  /**
   * Calculate confidence calibration factor based on accuracy
   */
  private static calculateConfidenceCalibration(
    profile: AdaptiveLearningProfile,
    recentFeedback: ExerciseResult[]
  ): number {
    if (profile.totalInteractions < 10) {
      return 1.0; // not enough data for calibration
    }

    const accuracy = profile.successfulPredictions / (profile.successfulPredictions + profile.failedPredictions);

    // If we're overconfident (accuracy < 0.7), reduce confidence
    // If we're underconfident (accuracy > 0.9), increase confidence
    if (accuracy < 0.7) {
      return 0.9;
    } else if (accuracy > 0.9) {
      return 1.1;
    }

    return 1.0;
  }

  // Helper methods for pattern analysis
  private static hasTemporalPattern(trigger: EmotionalTrigger): boolean {
    // Would analyze historical data to detect time patterns
    return trigger.occurrences > 5 && trigger.confidence > 70;
  }

  private static getTemporalDescription(trigger: EmotionalTrigger): string {
    // Would return human-readable temporal pattern
    return "Sunday evenings and Monday mornings";
  }

  private static extractTimePatterns(trigger: EmotionalTrigger): number[] {
    // Would extract time-of-day patterns from historical data
    return [19, 20, 21]; // 7-9 PM example
  }

  private static extractDayPatterns(trigger: EmotionalTrigger): number[] {
    // Would extract day-of-week patterns
    return [0, 1]; // Sunday, Monday example
  }

  private static calculateAnticipationWindow(trigger: EmotionalTrigger): number {
    // Calculate optimal intervention window based on trigger delay
    return Math.max(30, trigger.averageDelay * 5); // at least 30 minutes
  }

  private static calculatePreventionOpportunity(trigger: EmotionalTrigger): number {
    // Calculate how preventable this trigger is
    return trigger.emotionalResponse === "intensity_spike" ? 80 : 60;
  }

  private static hasContextualTriggers(wiring: BehavioralWiring, recentStressors: string[]): boolean {
    // Check if current context matches wiring triggers
    return recentStressors.some(stressor =>
      wiring.coreBeliefTrigger.toLowerCase().includes(stressor.toLowerCase())
    );
  }

  private static identifyEmotionalCascades(insights: AdvancedInsightsProfile): PredictivePattern[] {
    // Identify chains of emotional reactions
    return insights.behavioralWiring.map(wiring => ({
      id: `cascade-${wiring.id}`,
      type: "emotional_cascade" as const,
      pattern: `${wiring.coreBeliefTrigger} → ${wiring.automaticBehavior} → emotional escalation`,
      nextLikelyTrigger: wiring.automaticBehavior,
      anticipationWindow: 15, // quick escalation
      preventionOpportunity: 90, // cascades are highly preventable
      confidence: wiring.confidence,
      historicalAccuracy: 0,
      lastUpdated: new Date(),
    }));
  }

  private static async generateBaseInsights(insights: AdvancedInsightsProfile): Promise<ActionableInsight[]> {
    // Generate basic insights from raw patterns
    // (This would call the existing InsightsActionEngine)
    return [];
  }

  private static adaptInsightToUser(
    insight: ActionableInsight,
    profile: AdaptiveLearningProfile,
    patterns: PredictivePattern[]
  ): ActionableInsight {
    // Adapt insight based on user preferences and learning profile
    const adaptedInsight = { ...insight };

    // Adjust difficulty based on user success rate
    const actionTypeSuccess = profile.responseToActionTypes.get(insight.actionType) || 50;
    if (actionTypeSuccess > 80) {
      adaptedInsight.difficulty = insight.difficulty === "beginner" ? "intermediate" : "advanced";
    }

    // Adjust time commitment based on user engagement patterns
    if (profile.preferredInsightDepth === "deep") {
      adaptedInsight.timeCommitment = insight.timeCommitment === "2-5 minutes" ? "10-15 minutes" : insight.timeCommitment;
    }

    return adaptedInsight;
  }

  private static async generatePreventiveInsight(
    pattern: PredictivePattern,
    profile: AdaptiveLearningProfile
  ): Promise<ActionableInsight | null> {
    if (pattern.preventionOpportunity < 60) return null;

    return {
      id: `preventive-${pattern.id}`,
      sourceInsightId: pattern.id,
      sourceInsightType: "emotional_trigger",
      title: `Prevent ${pattern.nextLikelyTrigger} Pattern`,
      description: `Proactive intervention for predicted emotional pattern`,
      actionType: "awareness_practice",
      timeCommitment: "2-5 minutes",
      difficulty: "beginner",
      cbtFramework: "mindfulness",
      rationale: `Based on your patterns, ${pattern.pattern} is likely to occur soon. This proactive approach can prevent escalation.`,
      instructions: [
        {
          step: 1,
          instruction: `Notice that ${pattern.nextLikelyTrigger} may be approaching`,
          tip: "Awareness is the first step to prevention"
        }
      ],
      expectedOutcome: "Prevention of automatic emotional pattern",
      isCompleted: false,
    };
  }

  private static prioritizeAdaptiveInsights(
    insights: ActionableInsight[],
    profile: AdaptiveLearningProfile
  ): ActionableInsight[] {
    return insights.sort((a, b) => {
      const aSuccess = profile.responseToActionTypes.get(a.actionType) || 50;
      const bSuccess = profile.responseToActionTypes.get(b.actionType) || 50;
      return bSuccess - aSuccess; // higher success rate first
    });
  }

  private static calculateTimeUntilTrigger(pattern: PredictivePattern, context: any): number {
    // Calculate minutes until pattern is predicted to manifest
    if (pattern.type === "temporal" && pattern.timeOfDay) {
      const currentHour = new Date().getHours();
      const nextTriggerHour = pattern.timeOfDay.find(hour => hour > currentHour) || pattern.timeOfDay[0];
      return (nextTriggerHour - currentHour) * 60;
    }

    return 30; // default 30 minutes
  }

  private static async generateContextualNudge(
    pattern: PredictivePattern,
    timeUntil: number,
    profile: AdaptiveLearningProfile
  ): Promise<AnticipatorNudge | null> {
    return {
      id: `nudge-${pattern.id}`,
      patternId: pattern.id,
      message: `Your ${pattern.nextLikelyTrigger} pattern may activate in ${Math.round(timeUntil)} minutes`,
      interventionType: "proactive_awareness",
      urgency: timeUntil < 15 ? "high" : "medium",
      suggestedAction: "Take 3 deep breaths and set an intention for conscious response",
      dismissable: true,
      timestamp: new Date(),
    };
  }
}

export interface AnticipatorNudge {
  id: string;
  patternId: string;
  message: string;
  interventionType: "proactive_awareness" | "micro_intervention" | "reframing_prompt";
  urgency: "low" | "medium" | "high";
  suggestedAction: string;
  dismissable: boolean;
  timestamp: Date;
}

// Extended ExerciseResult interface to support learning
export interface ExerciseResult {
  exerciseType: string;
  userInput?: string;
  beforeRating?: number;
  afterRating?: number;
  observedChanges?: string[];
  completedSteps: number[];
  timeSpent: number;
  userReflection: string;

  // New fields for learning
  contextualFactors?: string[];
  emotionalState?: string;
  interventionEffectiveness?: number;
  willUseAgain?: boolean;
}