import { AiModel } from "@/types/ai-model.types";
import {
  AdvancedInsightsProfile,
  AvoidancePattern,
  BehavioralWiring,
  EmotionalTrigger,
  ProgressBlindSpot,
  RecoverySignature,
} from "./advanced-insights.types";

// Multi-model AI strategy for different analysis depths
export const AI_MODELS = {
  FAST_ANALYSIS: {
    model: "gpt-3.5-turbo",
    apiPath: "gpt-3.5-turbo",
    vendor: "openai",
    use: "pattern_detection",
  } as const,
  DEEP_ANALYSIS: {
    model: "gpt-4o-mini",
    apiPath: "gpt-4o-mini",
    vendor: "openai",
    use: "psychological_insight",
  } as const,
};

// Session data interfaces for analysis
interface SessionData {
  id: string;
  date: Date;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  analysisSnapshots: Array<{
    intensity: "low" | "moderate" | "high";
    crisis: string;
    distortions: Array<{ type: string; severity: string }>;
    themes: Array<{ theme: string; frequency: string }>;
    coreBeliefs: Array<{ belief: string }>;
    behavioralPatterns: Array<{ type: string; severity: string }>;
    therapeuticReadiness: string;
  }>;
  memory: string; // consolidated session facts
}

export class AIInsightEngine {
  /**
   * Generate emotional trigger insights using fast pattern detection
   */
  static async detectEmotionalTriggers(sessions: SessionData[]): Promise<EmotionalTrigger[]> {
    const promptData = this.buildTriggerAnalysisPrompt(sessions);

    const prompt = `Analyze these therapy session patterns to identify emotional triggers and PREDICT when they'll happen next.

${promptData}

Instructions:
- Look for words, phrases, topics, or people that consistently precede emotional intensity spikes
- Identify patterns the user hasn't explicitly connected
- Focus on unconscious triggers (things that happen automatically)
- **PREDICT when each trigger is likely to occur next based on temporal patterns**
- Calculate confidence based on frequency and consistency

Return a JSON array of triggers with this structure:
{
  "trigger": "specific word/phrase/topic",
  "triggerType": "word|phrase|topic|person|situation",
  "emotionalResponse": "intensity_spike|crisis_elevation|avoidance_behavior",
  "confidence": 85,
  "occurrences": 12,
  "averageDelay": 2,
  "context": "Brief explanation of the pattern",
  "lastSeen": "2024-01-15",
  "nextPrediction": {
    "timeframe": "Sunday evening, next 2-3 days",
    "likelihood": 78,
    "earlyWarningMinutes": 30,
    "preventionOpportunity": 85
  }
}`;

    // Would call GPT-3.5-turbo for fast pattern detection
    return this.callFastAnalysisModel(prompt);
  }

  /**
   * Discover behavioral wiring patterns using deep analysis
   */
  static async analyzeBehavioralWiring(sessions: SessionData[]): Promise<BehavioralWiring[]> {
    const promptData = this.buildBehavioralWiringPrompt(sessions);

    const prompt = `Analyze these therapy sessions to discover automatic behavioral patterns the user might not realize they have.

${promptData}

Instructions:
- Identify core beliefs that automatically trigger specific behaviors
- Look for unconscious emotional rules ("When X, then I always do Y")
- Focus on patterns that happen without conscious thought
- Connect cognitive distortions to automatic responses

Return JSON array with this structure:
{
  "id": "unique-id",
  "pattern": "perfectionism → avoidance",
  "coreBeliefTrigger": "I must be perfect",
  "automaticBehavior": "avoids challenging tasks",
  "frequency": 87,
  "confidence": 92,
  "unconsciousIndicator": true,
  "insight": "Your perfectionist beliefs automatically activate avoidance without conscious awareness",
  "sessions": ["session-1", "session-3"]
}`;

    // Would call GPT-4o-mini for deep psychological analysis
    return this.callDeepAnalysisModel(prompt);
  }

  /**
   * Detect subconscious avoidance patterns
   */
  static async detectAvoidancePatterns(sessions: SessionData[]): Promise<AvoidancePattern[]> {
    const promptData = this.buildAvoidanceAnalysisPrompt(sessions);

    const prompt = `Analyze conversation flows to identify topics the user unconsciously avoids discussing.

${promptData}

Instructions:
- Look for topics that consistently get deflected or redirected
- Identify patterns of conversation steering away from specific subjects
- Note how the user changes topics when certain themes emerge
- Focus on unconscious avoidance (not deliberate topic changes)

Return JSON array:
{
  "avoidedTopic": "family relationships",
  "deflectionMethods": ["changes to work topic", "asks about techniques", "makes jokes"],
  "frequency": 8,
  "totalAvoidances": 15,
  "insightGenerated": "You may unconsciously redirect conversations away from family topics when they become emotionally intense",
  "emotionalContext": "anxiety and sadness emerge when family is mentioned"
}`;

    return this.callDeepAnalysisModel(prompt);
  }

  /**
   * Identify personal recovery signatures
   */
  static async identifyRecoverySignatures(sessions: SessionData[]): Promise<RecoverySignature[]> {
    const promptData = this.buildRecoveryAnalysisPrompt(sessions);

    const prompt = `Analyze what specifically helps this user recover from emotional difficulty.

${promptData}

Instructions:
- Identify patterns that consistently reduce emotional intensity
- Look for unconscious coping mechanisms the user uses naturally
- Find personal recovery triggers that work specifically for this individual
- Note which approaches happen automatically vs. consciously

Return JSON array:
{
  "recoveryTrigger": "values-based reflection",
  "effectiveness": 78,
  "averageRecoveryTime": 4,
  "preferredModule": "values_clarification",
  "unconsciousUse": true,
  "personalizedInsight": "You naturally shift to thinking about your values when overwhelmed - this is your most effective unconscious coping strategy"
}`;

    return this.callDeepAnalysisModel(prompt);
  }

  /**
   * Identify progress blind spots - growth the user can't see
   */
  static async identifyProgressBlindSpots(
    currentSessions: SessionData[],
    historicalSessions: SessionData[]
  ): Promise<ProgressBlindSpot[]> {
    const currentData = this.buildProgressAnalysisPrompt(currentSessions, "current");
    const historicalData = this.buildProgressAnalysisPrompt(historicalSessions, "historical");

    const prompt = `Compare these historical vs current therapy patterns to identify growth the user might not recognize.

HISTORICAL PATTERNS (2-3 months ago):
${historicalData}

CURRENT PATTERNS:
${currentData}

Instructions:
- Identify subtle positive changes the user likely hasn't noticed
- Look for evolution in emotional responses, coping strategies, self-talk
- Find areas where automatic responses have improved
- Focus on progress that would surprise the user to learn about

Return JSON array:
{
  "area": "self-compassion in perfectionist moments",
  "oldPattern": "immediate self-criticism when making mistakes",
  "newPattern": "notices perfectionist thoughts and responds with curiosity",
  "improvementPercentage": 65,
  "timeframe": "over the past 2 months",
  "userAwareness": "unaware",
  "aiGeneratedCelebration": "You've developed a much kinder inner voice without even realizing it - your self-talk has become 65% more compassionate"
}`;

    return this.callDeepAnalysisModel(prompt);
  }

  /**
   * Generate comprehensive insights profile
   */
  static async generateAdvancedInsights(userId: string, sessions: SessionData[]): Promise<AdvancedInsightsProfile> {
    const [emotionalTriggers, behavioralWiring, avoidancePatterns, recoverySignatures] = await Promise.all([
      this.detectEmotionalTriggers(sessions),
      this.analyzeBehavioralWiring(sessions),
      this.detectAvoidancePatterns(sessions),
      this.identifyRecoverySignatures(sessions),
    ]);

    // Historical analysis for progress blind spots
    const recentSessions = sessions.slice(-10);
    const historicalSessions = sessions.slice(0, -10);
    const progressBlindSpots = await this.identifyProgressBlindSpots(recentSessions, historicalSessions);

    // Generate meta-insights using deep analysis
    const metaInsights = await this.generateMetaInsights({
      emotionalTriggers,
      behavioralWiring,
      avoidancePatterns,
      recoverySignatures,
      progressBlindSpots,
    });

    return {
      userId,
      analysisDate: new Date(),
      emotionalTriggers,
      behavioralWiring,
      avoidancePatterns,
      recoverySignatures,
      progressBlindSpots,
      emotionalWiring: [], // Would be populated with additional analysis
      ...metaInsights,
      dataPointsAnalyzed: sessions.length,
      analysisConfidence: this.calculateOverallConfidence([
        emotionalTriggers,
        behavioralWiring,
        avoidancePatterns,
        recoverySignatures,
      ]),
    };
  }

  // Private helper methods
  private static buildTriggerAnalysisPrompt(sessions: SessionData[]): string {
    return sessions
      .map(
        (session) =>
          `Session ${session.date.toISOString().split("T")[0]}:\n` +
          `Messages: ${session.messages.length}\n` +
          `Intensity changes: ${session.analysisSnapshots.map((s) => s.intensity).join(" → ")}\n` +
          `Key themes: ${session.analysisSnapshots.flatMap((s) => s.themes.map((t) => t.theme)).join(", ")}\n`
      )
      .join("\n\n");
  }

  private static buildBehavioralWiringPrompt(sessions: SessionData[]): string {
    return sessions
      .map(
        (session) =>
          `Session ${session.id}:\n` +
          `Core beliefs: ${session.analysisSnapshots.flatMap((s) => s.coreBeliefs.map((b) => b.belief)).join(", ")}\n` +
          `Behavioral patterns: ${session.analysisSnapshots.flatMap((s) => s.behavioralPatterns.map((p) => `${p.type} (${p.severity})`)).join(", ")}\n` +
          `Distortions: ${session.analysisSnapshots.flatMap((s) => s.distortions.map((d) => d.type)).join(", ")}\n`
      )
      .join("\n\n");
  }

  private static buildAvoidanceAnalysisPrompt(sessions: SessionData[]): string {
    return sessions
      .map(
        (session) =>
          `Session ${session.id}:\n` +
          `Conversation flow: ${session.messages.map((m) => `${m.role}: [${m.content.slice(0, 50)}...]`).join(" → ")}\n` +
          `Topics avoided: ${session.analysisSnapshots.flatMap((s) => s.behavioralPatterns.filter((p) => p.type === "avoidance").map((p) => p.type))}\n`
      )
      .join("\n\n");
  }

  private static buildRecoveryAnalysisPrompt(sessions: SessionData[]): string {
    return sessions
      .map(
        (session) =>
          `Session ${session.id}:\n` +
          `Intensity progression: ${session.analysisSnapshots.map((s) => s.intensity).join(" → ")}\n` +
          `Recovery indicators: ${session.analysisSnapshots.map((s) => s.therapeuticReadiness).join(" → ")}\n`
      )
      .join("\n\n");
  }

  private static buildProgressAnalysisPrompt(sessions: SessionData[], period: string): string {
    return sessions
      .map(
        (session) =>
          `${period} - Session ${session.id}:\n` +
          `Self-talk patterns: ${session.analysisSnapshots.flatMap((s) => s.coreBeliefs.map((b) => b.belief)).join(", ")}\n` +
          `Coping responses: ${session.analysisSnapshots.flatMap((s) => s.behavioralPatterns.map((p) => p.type)).join(", ")}\n`
      )
      .join("\n\n");
  }

  private static async callFastAnalysisModel(prompt: string): Promise<any[]> {
    // Would integrate with actual AI service
    // return await SendPromptsToAi([{role: "user", content: prompt}], AI_MODELS.FAST_ANALYSIS);
    return []; // Mock for now
  }

  private static async callDeepAnalysisModel(prompt: string): Promise<any[]> {
    // Would integrate with actual AI service
    // return await SendPromptsToAi([{role: "user", content: prompt}], AI_MODELS.DEEP_ANALYSIS);
    return []; // Mock for now
  }

  private static async generateMetaInsights(insights: any) {
    return {
      overallPattern: "Pattern of unconscious perfectionism driving avoidance behaviors",
      biggestBlindSpot: "You don't realize how much your perfectionist beliefs control your daily decisions",
      hiddenStrength: "Your values-based thinking is your most powerful unconscious coping mechanism",
      unconsciousWisdom: "You naturally protect your energy by avoiding emotionally draining topics",
      recommendedNextInsights: ["Explore the connection between family dynamics and work perfectionism"],
    };
  }

  private static calculateOverallConfidence(insights: any[]): number {
    return 85; // Would calculate based on data quality and pattern consistency
  }
}
