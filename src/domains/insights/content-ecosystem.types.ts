export interface ContentRecommendation {
  id: string;
  title: string;
  type: "article" | "guided_exercise" | "audio_meditation" | "video_explanation" | "worksheet";

  // Content linking
  sourceInsightId: string;
  sourceInsightType:
    | "emotional_trigger"
    | "behavioral_wiring"
    | "avoidance_pattern"
    | "recovery_signature"
    | "progress_blindspot";
  recommendationReason: string; // Why this content matches their insight

  // Content metadata
  estimatedReadTime?: number; // minutes
  difficulty: "beginner" | "intermediate" | "advanced";
  cbtFramework: string; // matches insight's CBT framework

  // SEO and discoverability
  tags: string[];
  slug: string;
  metaDescription: string;

  // Personalization
  relevanceScore: number; // 0-100, how well it matches user's specific pattern
  isRecommended: boolean; // featured recommendation
  viewCount?: number;

  // Content structure
  summary: string;
  keyTakeaways: string[];
  relatedActions: string[]; // actionable insight IDs

  // Progressive content
  prerequisiteContent?: string[]; // content IDs that should be consumed first
  nextStepContent?: string[]; // natural next content

  createdAt: Date;
  updatedAt: Date;
}

export interface GuidedExercise {
  id: string;
  title: string;
  description: string;

  // Exercise structure
  steps: ExerciseStep[];
  estimatedDuration: number; // minutes
  materials?: string[]; // "pen and paper", "quiet space"

  // Integration with insights
  applicablePatterns: string[];
  cbtTechnique: string;

  // Progression tracking
  completionCriteria: string[];
  successMetrics: string[];

  // Variations for different contexts
  variations: ExerciseVariation[];
}

export interface ExerciseStep {
  stepNumber: number;
  instruction: string;
  duration?: number; // seconds for timed steps
  example?: string;
  tip?: string;
  checkpointQuestion?: string; // reflection question
}

export interface ExerciseVariation {
  name: string;
  description: string;
  contextTrigger: string; // "high_stress", "time_limited", "beginner_friendly"
  modifiedSteps: Partial<ExerciseStep>[];
}

export interface ContentPathway {
  id: string;
  name: string;
  description: string;

  // Pathway structure
  stages: ContentStage[];
  estimatedCompletionWeeks: number;

  // Targeting
  targetPatterns: string[]; // insight patterns this pathway addresses
  targetDemographic: string; // "high_functioning_women", "perfectionism_focus"

  // Progress tracking
  prerequisiteInsights: string[]; // required insights to unlock pathway
  milestoneActions: string[]; // key actions that mark progression
}

export interface ContentStage {
  stageNumber: number;
  name: string;
  objective: string;

  // Stage content
  requiredContent: string[]; // must consume these
  optionalContent: string[]; // supplementary content
  practiceActions: string[]; // actionable insights to practice

  // Completion criteria
  minimumTimeSpent: number; // minutes
  requiredActionCompletions: number;
  progressCheckQuestions: string[];

  unlocksCriteria?: string; // what unlocks the next stage
}

export interface PersonalizedContentFeed {
  userId: string;
  generatedAt: Date;

  // Current focus
  primaryInsightFocus: string; // main insight being addressed
  currentPathway?: string;
  currentStage?: number;

  // Curated content
  featuredRecommendation: ContentRecommendation;
  dailyRecommendations: ContentRecommendation[];
  weeklyDeepDive: ContentRecommendation;

  // Learning preferences
  preferredContentTypes: string[];
  optimalLearningTimes: number[]; // hours of day

  // Engagement tracking
  contentEngagementScore: number; // how well they engage with content
  lastContentConsumed?: Date;

  // Dynamic adjustments
  contentDifficultyPreference: "easier" | "current" | "challenging";
  pacePreference: "slower" | "current" | "faster";
}

export interface ContentEngagementMetrics {
  contentId: string;
  userId: string;

  // Engagement data
  timeSpent: number; // seconds
  completionPercentage: number; // 0-100
  wasHelpful: boolean | null; // user feedback
  helpfulnessRating?: number; // 1-5

  // Behavior tracking
  returnVisits: number;
  sharedContent: boolean;
  appliedToAction: boolean; // did they do a related action after

  // Context
  accessedVia: "recommendation" | "search" | "pathway" | "nudge";
  deviceType: "mobile" | "desktop" | "tablet";
  timeOfAccess: Date;

  // Outcome tracking
  followUpActionsTaken: string[]; // actions completed after consuming content
  reportedInsights?: string[]; // user-reported learnings
}

// Content generation and management
export interface ContentRecommendationEngine {
  generatePersonalizedFeed(userId: string, insights: any[]): PersonalizedContentFeed;
  recommendForSpecificInsight(insightId: string, userPreferences: any): ContentRecommendation[];
  suggestNextContent(currentContentId: string, userId: string): ContentRecommendation[];
  optimizeContentDifficulty(userId: string, contentId: string): "easier" | "current" | "harder";
}

// SEO and discoverability system
export interface SEOContentStrategy {
  generateKeywords(insight: any): string[];
  createMetaContent(insight: any): { title: string; description: string; keywords: string[] };
  suggestInternalLinking(contentId: string, allContent: ContentRecommendation[]): string[];
  identifyContentGaps(existingContent: ContentRecommendation[], userInsights: any[]): string[];
}
