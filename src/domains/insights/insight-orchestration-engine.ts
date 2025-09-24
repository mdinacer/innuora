import { ChatMessage } from "@/types/flow-chat-messages.types";
import { AdaptiveConfidenceEngine } from "./adaptive-confidence-engine";
import { AdvancedInsightsProfile } from "./advanced-insights.types";
import { ActionableInsight, ExerciseResult } from "./actionable-insights.types";
import { AIInsightEngine } from "./ai-insight-engine";
import { InsightsActionEngine } from "./insights-action-engine";
import {
  AdaptiveLearningProfile,
  AnticipatorNudge,
  PredictiveInsightEvent,
  PredictiveInsightIntelligence,
  PredictivePattern,
} from "./predictive-insight-intelligence";

/**
 * Master orchestration engine that coordinates all insight generation and learning
 * This is the main intelligence layer that makes the system predictive and adaptive
 */
export class InsightOrchestrationEngine {
  /**
   * Main orchestration method - processes session data and generates intelligent insights
   * This is called whenever we need to update insights for a user
   */
  static async orchestrateIntelligentInsights(
    userId: string,
    sessionData: ProcessedSessionData,
    userFeedbackHistory: ExerciseResult[],
    learningProfile: AdaptiveLearningProfile,
    currentContext: UserContext
  ): Promise<IntelligentInsightResult> {
    console.log(`[InsightOrchestration] Starting intelligent insight generation for user ${userId}`);

    // Step 1: Extract psychological patterns from session data
    const rawInsights = await this.extractPsychologicalPatterns(sessionData);

    // Step 2: Generate predictive insights with adaptive learning
    const intelligentResult = await PredictiveInsightIntelligence.generateIntelligentInsights(
      userId,
      rawInsights,
      userFeedbackHistory,
      learningProfile,
      {
        ...currentContext,
        recentStressors: currentContext.recentStressors || []
      }
    );

    // Step 3: Calculate adaptive confidence for each insight
    const insightsWithConfidence = await this.enhanceInsightsWithConfidence(
      intelligentResult.actionableInsights,
      learningProfile,
      currentContext
    );

    // Step 4: Generate real-time nudges if patterns are imminent
    const immediateNudges = await this.generateImmedateInterventions(
      intelligentResult.predictivePatterns,
      currentContext,
      learningProfile
    );

    // Step 5: Create learning events for future improvement
    const learningEvents = this.createLearningEvents(
      userId,
      rawInsights,
      intelligentResult,
      currentContext
    );

    // Step 6: Update user's learning profile
    const updatedLearningProfile = this.updateLearningProfile(
      learningProfile,
      userFeedbackHistory,
      learningEvents
    );

    console.log(`[InsightOrchestration] Generated ${insightsWithConfidence.length} insights with ${immediateNudges.length} nudges`);

    return {
      insights: insightsWithConfidence,
      predictivePatterns: intelligentResult.predictivePatterns,
      anticipatoryNudges: [...intelligentResult.anticipatoryNudges, ...immediateNudges],
      learningEvents,
      updatedLearningProfile,
      orchestrationMetadata: {
        processingDate: new Date(),
        dataQuality: this.assessDataQuality(sessionData),
        confidenceCalibration: learningProfile.confidenceCalibration,
        totalLearningInteractions: learningProfile.totalInteractions,
      },
    };
  }

  /**
   * Process user feedback and update system intelligence
   * This is called after user completes exercises or provides feedback
   */
  static async processUserFeedback(
    userId: string,
    insightId: string,
    exerciseResult: ExerciseResult,
    userFeedback: UserFeedback,
    learningProfile: AdaptiveLearningProfile
  ): Promise<FeedbackProcessingResult> {
    console.log(`[InsightOrchestration] Processing feedback for insight ${insightId}`);

    // Update insight confidence based on user interaction
    const confidenceAdjustment = AdaptiveConfidenceEngine.updateInsightConfidence(
      { id: insightId } as ActionableInsight, // would fetch full insight
      exerciseResult,
      userFeedback
    );

    // Create learning event
    const learningEvent: PredictiveInsightEvent = {
      id: `feedback-${insightId}-${Date.now()}`,
      userId,
      type: "outcome",
      predictionAccuracy: this.calculatePredictionAccuracy(exerciseResult, userFeedback),
      interventionEffectiveness: this.calculateInterventionEffectiveness(exerciseResult),
      userSatisfaction: userFeedback.effectivenessRating || 5,
      insightGenerated: this.generateFeedbackInsight(exerciseResult, userFeedback),
      timestamp: new Date(),
      contextData: { exerciseResult, userFeedback },
    };

    // Update learning profile
    const updatedProfile = AdaptiveConfidenceEngine.adaptToUserPatterns(
      learningProfile,
      [learningEvent],
      7 // analyze last 7 days
    );

    // Generate follow-up insights based on this feedback
    const followUpInsights = await this.generateFollowUpInsights(
      exerciseResult,
      userFeedback,
      updatedProfile
    );

    return {
      confidenceAdjustment,
      learningEvent,
      updatedLearningProfile: updatedProfile,
      followUpInsights,
      systemLearning: {
        accuracyImprovement: this.calculateAccuracyImprovement(learningEvent),
        personalityRefinement: this.calculatePersonalityRefinement(exerciseResult),
        predictionRefinement: this.calculatePredictionRefinement(learningEvent),
      },
    };
  }

  /**
   * Real-time context analysis for immediate intervention opportunities
   */
  static async analyzeRealTimeContext(
    userId: string,
    recentMessages: ChatMessage[],
    currentPredictivePatterns: PredictivePattern[],
    learningProfile: AdaptiveLearningProfile
  ): Promise<RealTimeAnalysisResult> {
    // Analyze recent conversation for emerging patterns
    const emergingTriggers = await this.detectEmergingTriggers(recentMessages);

    // Check if any predictive patterns are about to manifest
    const imminentPatterns = this.identifyImminentPatterns(
      currentPredictivePatterns,
      emergingTriggers,
      new Date()
    );

    // Generate immediate interventions if needed
    const immediateInterventions = await this.generateImmediateInterventions(
      imminentPatterns,
      learningProfile
    );

    // Calculate current emotional state probability
    const emotionalStatePredictin = this.predictEmotionalState(
      recentMessages,
      imminentPatterns
    );

    return {
      emergingTriggers,
      imminentPatterns,
      immediateInterventions,
      emotionalStatePredictin,
      interventionOpportunity: this.calculateInterventionOpportunity(imminentPatterns),
    };
  }

  /**
   * Generate adaptive insights based on multi-dimensional analysis
   */
  static async generateAdaptiveInsights(
    psychologicalPatterns: AdvancedInsightsProfile,
    contextualFactors: UserContext,
    learningProfile: AdaptiveLearningProfile,
    predictivePatterns: PredictivePattern[]
  ): Promise<ActionableInsight[]> {
    // Generate base insights from psychological patterns
    const baseInsights = await InsightsActionEngine.generateActionableInsights(
      psychologicalPatterns.emotionalTriggers,
      psychologicalPatterns.behavioralWiring,
      psychologicalPatterns.avoidancePatterns,
      psychologicalPatterns.recoverySignatures,
      psychologicalPatterns.progressBlindSpots
    );

    // Enhance each insight with adaptive intelligence
    const adaptedInsights = await Promise.all(
      baseInsights.map(async (insight) => {
        // Calculate multi-layered confidence
        const confidenceAnalysis = AdaptiveConfidenceEngine.calculateMultiLayeredConfidence(
          85, // raw confidence - would come from pattern analysis
          learningProfile.responseToActionTypes.get(insight.actionType) || 50,
          this.calculateContextualFit(insight, contextualFactors),
          this.calculatePersonalityMatch(insight, learningProfile),
          this.calculateTemporalRelevance(insight, contextualFactors),
          learningProfile
        );

        // Adapt insight based on context and learning
        const adaptedInsight = this.adaptInsightToContext(
          insight,
          contextualFactors,
          learningProfile,
          confidenceAnalysis.finalConfidence
        );

        return {
          ...adaptedInsight,
          confidence: confidenceAnalysis.finalConfidence,
          confidenceFactors: confidenceAnalysis.confidenceFactors,
          adaptationReason: this.generateAdaptationExplanation(insight, adaptedInsight),
        };
      })
    );

    // Add predictive insights for imminent patterns
    const predictiveInsights = await this.generatePredictiveInsights(
      predictivePatterns,
      learningProfile,
      contextualFactors
    );

    return [...adaptedInsights, ...predictiveInsights].sort((a, b) =>
      (b.confidence || 50) - (a.confidence || 50)
    );
  }

  // Private helper methods for data processing and intelligence

  private static async extractPsychologicalPatterns(
    sessionData: ProcessedSessionData
  ): Promise<AdvancedInsightsProfile> {
    // Convert processed session data to format expected by AI engine
    const aiSessions = this.convertToAISessionFormat(sessionData);

    // Use AI engine to extract patterns
    return await AIInsightEngine.generateAdvancedInsights(
      sessionData.userId,
      aiSessions
    );
  }

  private static async enhanceInsightsWithConfidence(
    insights: ActionableInsight[],
    learningProfile: AdaptiveLearningProfile,
    context: UserContext
  ): Promise<EnhancedActionableInsight[]> {
    return Promise.all(
      insights.map(async (insight) => {
        const contextualConfidence = AdaptiveConfidenceEngine.adjustConfidenceForContext(
          insight.confidence || 50,
          {
            currentStressLevel: context.currentStressLevel,
            timeOfDay: context.timeOfDay,
            recentTriggers: context.recentTriggers,
            energyLevel: context.energyLevel,
          }
        );

        return {
          ...insight,
          confidence: contextualConfidence,
          adaptiveMetadata: {
            originalConfidence: insight.confidence || 50,
            contextualAdjustment: contextualConfidence - (insight.confidence || 50),
            personalityMatch: this.calculatePersonalityMatch(insight, learningProfile),
            historicalSuccess: learningProfile.responseToActionTypes.get(insight.actionType) || 50,
          },
        };
      })
    );
  }

  private static async generateImmedateInterventions(
    patterns: PredictivePattern[],
    context: UserContext,
    profile: AdaptiveLearningProfile
  ): Promise<AnticipatorNudge[]> {
    const nudges: AnticipatorNudge[] = [];

    for (const pattern of patterns) {
      const timeUntilTrigger = this.calculateTimeUntilPattern(pattern, context);

      // Generate intervention if pattern is imminent (< 30 minutes)
      if (timeUntilTrigger > 0 && timeUntilTrigger <= 30) {
        const nudge = await this.createContextualNudge(
          pattern,
          timeUntilTrigger,
          profile,
          context
        );
        if (nudge) nudges.push(nudge);
      }
    }

    return nudges;
  }

  private static createLearningEvents(
    userId: string,
    insights: AdvancedInsightsProfile,
    result: any,
    context: UserContext
  ): PredictiveInsightEvent[] {
    const events: PredictiveInsightEvent[] = [];

    // Create prediction events for each insight generated
    result.actionableInsights.forEach((insight: ActionableInsight) => {
      events.push({
        id: `prediction-${insight.id}`,
        userId,
        type: "prediction",
        predictedPattern: insight.sourceInsightType,
        predictionConfidence: insight.confidence || 50,
        timestamp: new Date(),
        contextData: { context, insight },
      });
    });

    return events;
  }

  private static updateLearningProfile(
    currentProfile: AdaptiveLearningProfile,
    feedback: ExerciseResult[],
    events: PredictiveInsightEvent[]
  ): AdaptiveLearningProfile {
    return AdaptiveConfidenceEngine.adaptToUserPatterns(
      currentProfile,
      events,
      30 // analyze last 30 days
    );
  }

  private static assessDataQuality(sessionData: ProcessedSessionData): DataQualityMetrics {
    return {
      totalDataPoints: sessionData.messages.length,
      analysisSnapshots: sessionData.analysisSnapshots.length,
      temporalSpan: sessionData.temporalSpanDays,
      confidenceLevel: this.calculateDataConfidence(sessionData),
    };
  }

  private static calculateDataConfidence(sessionData: ProcessedSessionData): number {
    let confidence = 50; // baseline

    // More messages = higher confidence
    if (sessionData.messages.length > 100) confidence += 20;
    else if (sessionData.messages.length > 50) confidence += 10;

    // Longer time span = higher confidence
    if (sessionData.temporalSpanDays > 30) confidence += 15;
    else if (sessionData.temporalSpanDays > 7) confidence += 8;

    // Analysis snapshots = higher confidence
    confidence += Math.min(15, sessionData.analysisSnapshots.length * 2);

    return Math.min(100, confidence);
  }

  private static calculatePredictionAccuracy(
    result: ExerciseResult,
    feedback: UserFeedback
  ): number {
    let accuracy = 50;

    // High completion rate indicates good prediction
    const completionRate = result.completedSteps.length / 4; // assume 4 steps average
    accuracy += completionRate * 20;

    // Positive feedback indicates accurate prediction
    if (feedback.effectivenessRating && feedback.effectivenessRating > 7) {
      accuracy += 20;
    }

    // Time spent indicates engagement (accurate prediction)
    if (result.timeSpent > 300) { // 5 minutes
      accuracy += 10;
    }

    return Math.min(100, Math.max(0, accuracy));
  }

  private static calculateInterventionEffectiveness(result: ExerciseResult): number {
    if (!result.beforeRating || !result.afterRating) return 50;

    const improvement = result.beforeRating - result.afterRating;
    return Math.min(100, Math.max(0, 50 + improvement * 10));
  }

  private static generateFeedbackInsight(
    result: ExerciseResult,
    feedback: UserFeedback
  ): string {
    if (feedback.effectivenessRating && feedback.effectivenessRating > 8) {
      return `High effectiveness insight: ${result.exerciseType} works very well for this user`;
    } else if (feedback.effectivenessRating && feedback.effectivenessRating < 4) {
      return `Low effectiveness insight: ${result.exerciseType} may not suit this user's style`;
    } else {
      return `Moderate effectiveness: ${result.exerciseType} shows standard results`;
    }
  }

  private static async generateFollowUpInsights(
    result: ExerciseResult,
    feedback: UserFeedback,
    profile: AdaptiveLearningProfile
  ): Promise<ActionableInsight[]> {
    // Generate insights based on what worked/didn't work
    const insights: ActionableInsight[] = [];

    if (feedback.effectivenessRating && feedback.effectivenessRating > 7) {
      // Generate similar insights
      const similarInsight = await this.generateSimilarInsight(result, profile);
      if (similarInsight) insights.push(similarInsight);
    }

    return insights;
  }

  private static async generateSimilarInsight(
    result: ExerciseResult,
    profile: AdaptiveLearningProfile
  ): Promise<ActionableInsight | null> {
    // Would generate similar insight based on successful pattern
    return null; // placeholder
  }

  private static calculateAccuracyImprovement(event: PredictiveInsightEvent): number {
    return event.predictionAccuracy || 0;
  }

  private static calculatePersonalityRefinement(result: ExerciseResult): number {
    // Calculate how much we learned about user's personality
    return result.userReflection.length > 100 ? 10 : 5;
  }

  private static calculatePredictionRefinement(event: PredictiveInsightEvent): number {
    return event.predictionAccuracy || 0;
  }

  private static async detectEmergingTriggers(messages: ChatMessage[]): Promise<string[]> {
    // Analyze recent messages for trigger words/patterns
    const recentContent = messages.slice(-5).map(m => m.content).join(" ");

    // Simple keyword detection - would be more sophisticated with AI
    const triggerKeywords = ["stressed", "anxious", "overwhelmed", "frustrated", "family", "work"];
    return triggerKeywords.filter(keyword =>
      recentContent.toLowerCase().includes(keyword)
    );
  }

  private static identifyImminentPatterns(
    patterns: PredictivePattern[],
    emergingTriggers: string[],
    currentTime: Date
  ): PredictivePattern[] {
    return patterns.filter(pattern => {
      // Check if triggers match pattern triggers
      const hasMatchingTrigger = emergingTriggers.some(trigger =>
        pattern.nextLikelyTrigger?.toLowerCase().includes(trigger.toLowerCase())
      );

      // Check if within anticipation window
      const withinWindow = this.calculateTimeUntilPattern(pattern, {} as UserContext) <= 60;

      return hasMatchingTrigger || withinWindow;
    });
  }

  private static async generateImmediateInterventions(
    patterns: PredictivePattern[],
    profile: AdaptiveLearningProfile
  ): Promise<AnticipatorNudge[]> {
    return Promise.all(
      patterns.map(async pattern => ({
        id: `immediate-${pattern.id}`,
        patternId: pattern.id,
        message: `Your ${pattern.nextLikelyTrigger} pattern may be activating`,
        interventionType: "proactive_awareness" as const,
        urgency: "high" as const,
        suggestedAction: "Take a moment to notice what you're feeling right now",
        dismissable: true,
        timestamp: new Date(),
      }))
    );
  }

  private static predictEmotionalState(
    messages: ChatMessage[],
    patterns: PredictivePattern[]
  ): EmotionalStatePredictin {
    // Analyze messages and patterns to predict emotional state
    return {
      predictedIntensity: 6, // 1-10
      predictedEmotion: "mild anxiety",
      confidence: 70,
      timeToManifest: 15, // minutes
    };
  }

  private static calculateInterventionOpportunity(patterns: PredictivePattern[]): number {
    if (patterns.length === 0) return 0;

    const avgOpportunity = patterns.reduce((sum, p) => sum + p.preventionOpportunity, 0) / patterns.length;
    return avgOpportunity;
  }

  private static calculateContextualFit(insight: ActionableInsight, context: UserContext): number {
    let fit = 50; // baseline

    // Time of day relevance
    if (context.timeOfDay >= 9 && context.timeOfDay <= 17) {
      fit += 10; // business hours
    }

    // Stress level appropriateness
    if (context.currentStressLevel && context.currentStressLevel > 7) {
      if (insight.difficulty === "beginner") fit += 15; // easier exercises when stressed
      else fit -= 10; // harder exercises less appropriate when stressed
    }

    return Math.min(100, Math.max(0, fit));
  }

  private static calculatePersonalityMatch(insight: ActionableInsight, profile: AdaptiveLearningProfile): number {
    // Calculate how well insight matches user's personality
    let match = 50;

    if (insight.actionType === "behavioral_experiment" && profile.personalityWeights.openness > 0.7) {
      match += 20; // high openness likes experiments
    }

    if (insight.actionType === "reflection" && profile.personalityWeights.conscientiousness > 0.7) {
      match += 15; // high conscientiousness likes reflection
    }

    return Math.min(100, Math.max(0, match));
  }

  private static calculateTemporalRelevance(insight: ActionableInsight, context: UserContext): number {
    let relevance = 50;

    // Energy level appropriateness
    if (context.energyLevel && context.energyLevel > 7) {
      relevance += 10; // high energy = more relevant
    } else if (context.energyLevel && context.energyLevel < 4) {
      relevance -= 15; // low energy = less relevant
    }

    return Math.min(100, Math.max(0, relevance));
  }

  private static adaptInsightToContext(
    insight: ActionableInsight,
    context: UserContext,
    profile: AdaptiveLearningProfile,
    confidence: number
  ): ActionableInsight {
    const adapted = { ...insight };

    // Adapt difficulty based on stress level
    if (context.currentStressLevel && context.currentStressLevel > 7) {
      if (adapted.difficulty === "intermediate") adapted.difficulty = "beginner";
      if (adapted.difficulty === "advanced") adapted.difficulty = "intermediate";
    }

    // Adapt time commitment based on energy
    if (context.energyLevel && context.energyLevel < 5) {
      if (adapted.timeCommitment === "20-30 minutes") adapted.timeCommitment = "10-15 minutes";
      if (adapted.timeCommitment === "10-15 minutes") adapted.timeCommitment = "2-5 minutes";
    }

    return adapted;
  }

  private static generateAdaptationExplanation(
    original: ActionableInsight,
    adapted: ActionableInsight
  ): string {
    const changes: string[] = [];

    if (original.difficulty !== adapted.difficulty) {
      changes.push(`adjusted difficulty from ${original.difficulty} to ${adapted.difficulty}`);
    }

    if (original.timeCommitment !== adapted.timeCommitment) {
      changes.push(`adjusted time from ${original.timeCommitment} to ${adapted.timeCommitment}`);
    }

    return changes.length > 0 ? `Adapted based on current context: ${changes.join(", ")}` : "Standard recommendation";
  }

  private static async generatePredictiveInsights(
    patterns: PredictivePattern[],
    profile: AdaptiveLearningProfile,
    context: UserContext
  ): Promise<ActionableInsight[]> {
    const insights: ActionableInsight[] = [];

    for (const pattern of patterns) {
      if (pattern.preventionOpportunity > 70) {
        const preventiveInsight: ActionableInsight = {
          id: `predictive-${pattern.id}`,
          sourceInsightId: pattern.id,
          sourceInsightType: "emotional_trigger",
          title: `Prevent ${pattern.nextLikelyTrigger} Pattern`,
          description: "Proactive intervention based on predicted pattern",
          actionType: "awareness_practice",
          timeCommitment: "2-5 minutes",
          difficulty: "beginner",
          cbtFramework: "mindfulness",
          rationale: `Your pattern suggests ${pattern.pattern} may occur soon. This proactive approach can help prevent escalation.`,
          instructions: [
            {
              step: 1,
              instruction: "Notice the early signs of this pattern",
              tip: "Awareness allows you to respond instead of react"
            }
          ],
          expectedOutcome: "Prevention of automatic emotional escalation",
          confidence: pattern.confidence,
          isCompleted: false,
        };

        insights.push(preventiveInsight);
      }
    }

    return insights;
  }

  private static convertToAISessionFormat(sessionData: ProcessedSessionData): any[] {
    // Convert to format expected by AIInsightEngine
    return [{
      id: sessionData.sessionId,
      date: new Date(),
      messages: sessionData.messages,
      analysisSnapshots: sessionData.analysisSnapshots,
      memory: sessionData.memory || "",
    }];
  }

  private static calculateTimeUntilPattern(pattern: PredictivePattern, context: UserContext): number {
    // Simple calculation - would be more sophisticated
    return pattern.anticipationWindow || 30;
  }

  private static async createContextualNudge(
    pattern: PredictivePattern,
    timeUntil: number,
    profile: AdaptiveLearningProfile,
    context: UserContext
  ): Promise<AnticipatorNudge | null> {
    return {
      id: `contextual-${pattern.id}`,
      patternId: pattern.id,
      message: `Based on your patterns, ${pattern.nextLikelyTrigger} may occur in ${timeUntil} minutes`,
      interventionType: "proactive_awareness",
      urgency: timeUntil < 15 ? "high" : "medium",
      suggestedAction: "Consider using your preferred coping strategy now",
      dismissable: true,
      timestamp: new Date(),
    };
  }
}

// Type definitions for the orchestration system

export interface ProcessedSessionData {
  userId: string;
  sessionId: string;
  messages: ChatMessage[];
  analysisSnapshots: any[];
  memory?: string;
  temporalSpanDays: number;
}

export interface UserContext {
  timeOfDay: number;
  dayOfWeek: number;
  currentStressLevel?: number;
  energyLevel?: number;
  socialContext?: "alone" | "with_others" | "work" | "family";
  recentTriggers?: string[];
  recentStressors?: string[];
}

export interface UserFeedback {
  effectivenessRating?: number; // 1-10
  willUseAgain?: boolean;
  contextRelevance?: number; // 1-10
  timingRelevance?: number; // 1-10
}

export interface EnhancedActionableInsight extends ActionableInsight {
  confidence: number;
  confidenceFactors?: any;
  adaptiveMetadata?: {
    originalConfidence: number;
    contextualAdjustment: number;
    personalityMatch: number;
    historicalSuccess: number;
  };
  adaptationReason?: string;
}

export interface IntelligentInsightResult {
  insights: EnhancedActionableInsight[];
  predictivePatterns: PredictivePattern[];
  anticipatoryNudges: AnticipatorNudge[];
  learningEvents: PredictiveInsightEvent[];
  updatedLearningProfile: AdaptiveLearningProfile;
  orchestrationMetadata: {
    processingDate: Date;
    dataQuality: DataQualityMetrics;
    confidenceCalibration: number;
    totalLearningInteractions: number;
  };
}

export interface FeedbackProcessingResult {
  confidenceAdjustment: number;
  learningEvent: PredictiveInsightEvent;
  updatedLearningProfile: AdaptiveLearningProfile;
  followUpInsights: ActionableInsight[];
  systemLearning: {
    accuracyImprovement: number;
    personalityRefinement: number;
    predictionRefinement: number;
  };
}

export interface RealTimeAnalysisResult {
  emergingTriggers: string[];
  imminentPatterns: PredictivePattern[];
  immediateInterventions: AnticipatorNudge[];
  emotionalStatePredictin: EmotionalStatePredictin;
  interventionOpportunity: number;
}

export interface EmotionalStatePredictin {
  predictedIntensity: number; // 1-10
  predictedEmotion: string;
  confidence: number; // 0-100
  timeToManifest: number; // minutes
}

export interface DataQualityMetrics {
  totalDataPoints: number;
  analysisSnapshots: number;
  temporalSpan: number;
  confidenceLevel: number;
}