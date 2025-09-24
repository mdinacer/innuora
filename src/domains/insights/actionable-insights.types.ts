// Actionable guidance system for psychological insights
export interface ActionableInsight {
  id: string;
  sourceInsightId: string; // Links to original insight
  sourceInsightType:
    | "emotional_trigger"
    | "behavioral_wiring"
    | "avoidance_pattern"
    | "recovery_signature"
    | "progress_blindspot";

  // Core action information
  title: string;
  description: string;
  actionType: "exercise" | "reflection" | "behavioral_experiment" | "educational_reading" | "awareness_practice";
  timeCommitment: "2-5 minutes" | "10-15 minutes" | "20-30 minutes" | "ongoing practice";
  difficulty: "beginner" | "intermediate" | "advanced";

  // CBT-informed content
  cbtFramework:
    | "cognitive_restructuring"
    | "behavioral_activation"
    | "mindfulness"
    | "values_clarification"
    | "exposure_therapy"
    | "thought_record";
  rationale: string; // Why this action helps with this specific pattern

  // Action details
  instructions: ActionInstruction[];
  expectedOutcome: string;
  trackingMetrics?: string[]; // What to observe/measure

  // Resources
  educationalResources?: EducationalResource[];
  burnsReference?: string; // David Burns technique reference

  // Progress tracking
  isCompleted: boolean;
  completedAt?: Date;
  userNotes?: string;
  effectivenessRating?: number; // 1-10 user rating
  confidence?: number; // 0-100 system confidence in this insight
}

export interface ActionInstruction {
  step: number;
  instruction: string;
  example?: string;
  tip?: string;
}

export interface EducationalResource {
  title: string;
  type: "article" | "video" | "podcast" | "book_chapter" | "exercise_guide";
  url?: string;
  internalContent?: string; // For app-native content
  readingTime?: string;
  author?: string;
  summary: string;
}

export interface BehavioralExperiment {
  id: string;
  title: string;
  hypothesis: string; // What we're testing
  instructions: string[];
  observationPrompts: string[];
  durationDays: number;
  safetyGuidelines?: string[];
}

export interface ThoughtRecord {
  id: string;
  situation: string;
  automaticThought: string;
  emotion: string;
  emotionIntensity: number; // 1-10
  evidence: {
    supporting: string[];
    contradicting: string[];
  };
  balancedThought: string;
  newEmotionIntensity: number;
  createdAt: Date;
}

export interface ActionableInsightsProfile {
  userId: string;
  generatedAt: Date;
  actions: ActionableInsight[];
  completedActions: ActionableInsight[];
  inProgressExperiments: BehavioralExperiment[];
  thoughtRecords: ThoughtRecord[];

  // Progress metrics
  totalActionsGenerated: number;
  completionRate: number; // percentage
  averageEffectivenessRating: number;
  streakDays: number; // consecutive days with action completion

  // Personalization
  preferredActionTypes: string[];
  preferredTimeCommitments: string[];
  learningStyle: "visual" | "auditory" | "kinesthetic" | "reading";
}

// CBT technique mappings for different insight patterns
export interface CBTTechniqueMapping {
  insightPattern: string;
  recommendedTechniques: {
    primary: string[];
    secondary: string[];
    advanced: string[];
  };
  burnsCorrespondence: {
    technique: string;
    chapter?: string;
    page?: string;
  }[];
}

// Action templates for rapid generation
export interface ActionTemplate {
  id: string;
  name: string;
  applicablePatterns: string[];
  template: Omit<ActionableInsight, "id" | "sourceInsightId" | "sourceInsightType" | "isCompleted">;
}

// Exercise result interface for learning system
export interface ExerciseResult {
  exerciseType: string;
  userInput?: string;
  beforeRating?: number;
  afterRating?: number;
  observedChanges?: string[];
  completedSteps: number[];
  timeSpent: number;
  userReflection: string;
}
