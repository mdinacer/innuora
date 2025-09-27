import z from "zod";

import { SESSION_MODULES, SessionModule } from "@/domains/cbt-modules/constants";

// === Maps and Types ===
export const USER_STATE_MAP = {
  firstTime: "first_time",
  returning: "returning",
  established: "established",
} as const;

export type UserState = (typeof USER_STATE_MAP)[keyof typeof USER_STATE_MAP];

export const CRISIS_LEVEL_MAP = {
  none: "none",
  mild: "mild",
  moderate: "moderate",
  high: "high",
  immediate: "immediate",
} as const;

export type CrisisLevel = (typeof CRISIS_LEVEL_MAP)[keyof typeof CRISIS_LEVEL_MAP];

export const EMOTION_INTENSITY_MAP = {
  low: "low",
  moderate: "moderate",
  high: "high",
} as const;

export type EmotionalIntensity = (typeof EMOTION_INTENSITY_MAP)[keyof typeof EMOTION_INTENSITY_MAP];

export const ANALYSIS_VALUE_MAP = {
  low: "low",
  medium: "medium",
  high: "high",
} as const;

export type AnalysisValue = (typeof ANALYSIS_VALUE_MAP)[keyof typeof ANALYSIS_VALUE_MAP];

export type AnalysisContextItem = {
  core_module: SessionModule | null;
  process_module: SessionModule | null;
  utility_module: SessionModule | null;
  intensity: EmotionalIntensity;
};

export type AnalysisContext = {
  recentAnalyses: AnalysisContextItem[];
  recurringThemes: string[];
  distortions: string[];
};

export const TherapeuticAnalysisSchema = z.object({
  core_module: z.enum(SESSION_MODULES).nullable(),
  process_module: z.enum(SESSION_MODULES).nullable(),
  utility_module: z.enum(SESSION_MODULES).nullable(),

  intensity: z.enum(EMOTION_INTENSITY_MAP),
  crisis: z.enum(CRISIS_LEVEL_MAP),

  distortions: z.array(
    z.object({
      type: z.string(),
      severity: z.enum(["mild", "moderate", "severe"]),
    })
  ),

  themes: z.array(
    z.object({
      theme: z.string(),
      frequency: z.enum(["occasional", "frequent", "pervasive"]),
    })
  ),

  core_beliefs: z.array(
    z.object({
      belief: z.string(),
    })
  ),

  silent_rules: z.array(
    z.object({
      rule: z.string(),
      rigidity: z.enum(["flexible", "moderate", "rigid"]),
    })
  ),

  behavioral_patterns: z.array(
    z.object({
      type: z.enum(["avoidance", "safety_behaviors", "perfectionism", "procrastination", "isolation", "rumination"]),
      severity: z.enum(["mild", "moderate", "severe"]),
    })
  ),

  state: z.enum(USER_STATE_MAP),
  therapeutic_readiness: z.enum(["resistant", "ambivalent", "ready", "engaged"]),

  update_memory: z.boolean(),
  recall_memory: z.boolean(),
  analysis_value: z.enum(ANALYSIS_VALUE_MAP),
});

// === Type inferred from schema ===
export type TherapeuticAnalysis = z.infer<typeof TherapeuticAnalysisSchema>;

// === Advanced Session Diagnostics ===
export const CONFIDENCE_LEVEL_MAP = {
  low: "low",
  medium: "medium",
  high: "high",
} as const;

export type ConfidenceLevel = (typeof CONFIDENCE_LEVEL_MAP)[keyof typeof CONFIDENCE_LEVEL_MAP];

export const COGNITIVE_DISTORTION_MAP = {
  all_or_nothing: "all-or-nothing",
  overgeneralization: "overgeneralization",
  mental_filter: "mental_filter",
  disqualifying_positive: "disqualifying_positive",
  jumping_conclusions: "jumping_conclusions",
  magnification: "magnification",
  emotional_reasoning: "emotional_reasoning",
  should_statements: "should_statements",
  labeling: "labeling",
  personalization: "personalization",
  rumination: "rumination",
  catastrophizing: "catastrophizing",
} as const;

export type CognitiveDistortion = (typeof COGNITIVE_DISTORTION_MAP)[keyof typeof COGNITIVE_DISTORTION_MAP];

export const SessionDiagnosticsSchema = z.object({
  core_beliefs: z.array(
    z.object({
      belief: z.string(),
      confidence: z.enum(CONFIDENCE_LEVEL_MAP),
    })
  ),

  silent_rules_and_double_binds: z.array(
    z.object({
      rule: z.string(),
      confidence: z.enum(CONFIDENCE_LEVEL_MAP),
    })
  ),

  dominant_distortions: z.array(
    z.object({
      distortion: z.enum(COGNITIVE_DISTORTION_MAP),
      confidence: z.enum(CONFIDENCE_LEVEL_MAP),
      examples: z.array(z.string()),
    })
  ),

  emotional_behavioral_patterns: z.array(
    z.object({
      trigger: z.string(),
      emotions: z.array(z.string()),
      behaviors: z.array(z.string()),
      loop: z.string(),
      confidence: z.enum(CONFIDENCE_LEVEL_MAP),
    })
  ),

  hidden_leverage_points: z.array(
    z.object({
      insight: z.string(),
      confidence: z.enum(CONFIDENCE_LEVEL_MAP),
    })
  ),

  therapeutic_opportunities: z.array(z.string()),
});

export type SessionDiagnostics = z.infer<typeof SessionDiagnosticsSchema>;
