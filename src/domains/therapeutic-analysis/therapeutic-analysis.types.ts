import z from "zod";

import { SESSION_MODULES, SessionModule } from "@/domains/therapeutic-analysis/therapeutic-analysis.constants";

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
export type TherapeuticAnalysisWithMessageId = TherapeuticAnalysis & { messageId: string };

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

//───────────────────────────────────────────────────────────────
// INNUORA ANALYSIS — Lightweight cognitive-emotional analysis
//───────────────────────────────────────────────────────────────
export type InnuoraAnalysis = {
  /** Emotional activation level inferred from tone and phrasing. */
  intensity: "low" | "moderate" | "high";

  /** Crisis severity inferred from language and tone. */
  crisis_level: "none" | "low" | "moderate" | "high" | "immediate";

  /** Openness and psychological readiness for reflective engagement. */
  readiness: "avoidant" | "cautious" | "open" | "engaged" | "reflective";

  /** Primary emotional tone detected in the user's language. */
  emotion: "sadness" | "anger" | "guilt" | "fear" | "shame" | "numbness" | "confusion" | "hope";

  /** Most salient cognitive distortion inferred from the user's statement. */
  distortion:
    | "none"
    | "catastrophizing"
    | "emotional reasoning"
    | "should statements"
    | "disqualifying positives"
    | "personalization"
    | "all-or-nothing thinking"
    | "over-control";

  /** ≤5 tokens — concise thematic label (e.g., "rest guilt", "meaning fatigue", "conditional worth"). */
  theme: string;

  /** If true, the Reflective Engine may safely include gentle curiosity in the next response. */
  allow_curiosity: boolean;

  /** If true, short contextual psychoeducation is appropriate in the next reflection. */
  allow_psychoeducation: boolean;

  /** Indicates readiness to cognitively process psychoeducational insight. */
  psychoedu_ready: boolean;

  /** ≤40 tokens — concise reasoning for emotional gating and intensity judgment. */
  rationale: string;

  /** ≤60 tokens — internal contextual notes to support continuity in future analysis. */
  notes: string;
};

export const SAFE_FALLBACK_ANALYSIS: InnuoraAnalysis = {
  intensity: "moderate",
  crisis_level: "none",
  readiness: "cautious",
  emotion: "numbness",
  distortion: "none",
  theme: "emotional fatigue",
  allow_curiosity: false,
  allow_psychoeducation: false,
  psychoedu_ready: false,
  rationale:
    "Initial round — no prior data. Assume moderate activation, emotional exhaustion baseline, and guarded openness.",
  notes:
    "Fallback analysis used for session initialization. Maintain containment and steady tone until clearer affect and readiness emerge.",
};
