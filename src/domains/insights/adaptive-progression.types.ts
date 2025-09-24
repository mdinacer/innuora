export interface UserProgressProfile {
  userId: string;
  lastUpdated: Date;

  // Learning patterns
  preferredActionTypes: ActionPreference[];
  completionPatterns: CompletionPattern;
  effectivenessRatings: EffectivenessPattern;

  // Progression tracking
  currentDifficultyLevel: "beginner" | "intermediate" | "advanced";
  readinessForAdvancement: number; // 0-100
  strugglingAreas: string[]; // action types or CBT frameworks
  strengthAreas: string[];

  // Adaptive settings
  optimalTimeCommitments: string[]; // preferred time slots
  currentStreakDays: number;
  longestStreak: number;

  // Context awareness
  triggerContexts: ContextTrigger[];
  peakEngagementTimes: TimePattern[];
}

export interface ActionPreference {
  actionType: string;
  completionRate: number; // 0-100
  averageRating: number; // 1-10
  timeToComplete: number; // minutes
  dropoffRate: number; // how often they start but don't finish
}

export interface CompletionPattern {
  totalActionsAssigned: number;
  totalCompleted: number;
  overallRate: number;
  weeklyTrend: "improving" | "stable" | "declining";
  bestCompletionDays: string[]; // days of week
  bestCompletionTimes: number[]; // hours of day
}

export interface EffectivenessPattern {
  overallAverage: number;
  byActionType: Record<string, number>;
  byCBTFramework: Record<string, number>;
  byDifficulty: Record<string, number>;
  improvementTrend: "improving" | "stable" | "declining";
}

export interface ContextTrigger {
  triggerName: string;
  lastDetected: Date;
  frequency: number; // times per week
  optimalResponseWindow: number; // hours after trigger for best engagement
  associatedActions: string[]; // action IDs that work best for this trigger
}

export interface TimePattern {
  dayOfWeek: string;
  hourRange: [number, number]; // 24h format
  engagementScore: number; // 0-100
  completionRate: number;
}

export interface AdaptiveRecommendation {
  type: "difficulty_increase" | "difficulty_decrease" | "action_type_shift" | "timing_optimization" | "content_focus";
  confidence: number; // 0-100
  rationale: string;
  suggestedChanges: string[];
  expectedImpact: string;
}

export interface DynamicNudge {
  id: string;
  userId: string;
  triggerCondition: string; // "sunday_evening" | "family_topic_mentioned" | "perfectionism_spike"
  message: string;
  actionId?: string; // recommended action to take
  urgency: "low" | "medium" | "high";
  createdAt: Date;
  expiresAt: Date;
  isRead: boolean;
  wasDismissed: boolean;
  wasActedUpon: boolean;
}

// Real-time context detection
export interface ContextDetector {
  detectTimeBasedTriggers(userId: string, currentTime: Date): string[];
  detectConversationTriggers(sessionContent: string, userTriggers: ContextTrigger[]): string[];
  detectEmotionalStateChanges(intensityHistory: number[]): "spike" | "dip" | "stable";
  shouldNudgeUser(userId: string, context: string[]): DynamicNudge | null;
}

// Adaptive progression engine
export interface ProgressionEngine {
  calculateReadinessForAdvancement(profile: UserProgressProfile): number;
  recommendNextDifficultyLevel(profile: UserProgressProfile): "beginner" | "intermediate" | "advanced";
  identifyStruggleAreas(profile: UserProgressProfile): AdaptiveRecommendation[];
  optimizeActionSequencing(profile: UserProgressProfile, availableActions: string[]): string[];
}
