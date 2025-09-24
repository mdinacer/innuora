export interface EmotionalTrigger {
  trigger: string;
  triggerType: "word" | "phrase" | "topic" | "person" | "situation";
  emotionalResponse: "intensity_spike" | "crisis_elevation" | "avoidance_behavior";
  confidence: number; // 0-100
  occurrences: number;
  averageDelay: number; // messages between trigger and response
  context: string; // AI-generated explanation
  lastSeen: Date;
  // NEW: Predictive fields
  nextPrediction?: {
    timeframe: string; // "Sunday evening, next 2-3 days"
    likelihood: number; // 0-100
    earlyWarningMinutes: number; // how far ahead to warn
    preventionOpportunity: number; // 0-100 how preventable
  };
}

export interface BehavioralWiring {
  id: string;
  pattern: string; // e.g., "perfectionism → avoidance"
  coreBeliefTrigger: string;
  automaticBehavior: string;
  frequency: number; // percentage of occurrences
  confidence: number;
  unconsciousIndicator: boolean; // likely unconscious connection
  insight: string; // AI-generated explanation
  sessions: string[]; // session IDs where this occurs
}

export interface AvoidancePattern {
  avoidedTopic: string;
  deflectionMethods: string[]; // how they redirect
  frequency: number;
  lastAvoidance: Date;
  totalAvoidances: number;
  insightGenerated: string; // AI analysis of why this might be avoided
  emotionalContext: string; // what they feel when this topic emerges
}

export interface RecoverySignature {
  recoveryTrigger: string;
  effectiveness: number; // how much intensity drops
  averageRecoveryTime: number; // messages to reach baseline
  preferredModule: string; // which CBT approach works
  unconsciousUse: boolean; // happens automatically
  personalizedInsight: string;
}

export interface ProgressBlindSpot {
  area: string; // what area of growth
  oldPattern: string; // how they used to respond
  newPattern: string; // how they respond now
  improvementPercentage: number;
  timeframe: string; // "over the past 2 months"
  userAwareness: "unaware" | "somewhat_aware" | "aware";
  aiGeneratedCelebration: string; // encouraging insight
}

export interface EmotionalWiring {
  beliefStatePattern: string; // "When I believe X, I feel Y"
  automaticEmotionalRule: string;
  frequency: number;
  intensity: "mild" | "moderate" | "strong";
  bypass: boolean; // happens without conscious thought
  therapeuticImplication: string;
}

export interface AdvancedInsightsProfile {
  userId: string;
  analysisDate: Date;

  // Core discoveries
  emotionalTriggers: EmotionalTrigger[];
  behavioralWiring: BehavioralWiring[];
  avoidancePatterns: AvoidancePattern[];
  recoverySignatures: RecoverySignature[];
  progressBlindSpots: ProgressBlindSpot[];
  emotionalWiring: EmotionalWiring[];

  // Meta-insights
  overallPattern: string; // AI-generated summary
  biggestBlindSpot: string;
  hiddenStrength: string;
  unconsciousWisdom: string; // what they do well without realizing

  // Confidence metrics
  dataPointsAnalyzed: number;
  analysisConfidence: number;
  recommendedNextInsights: string[];
}
