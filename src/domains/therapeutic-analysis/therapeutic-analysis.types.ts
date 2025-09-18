import z from "zod";

import { SESSION_MODULES, SessionModule } from "@/lib/ai/shared/session-modules";

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
});

// === Type inferred from schema ===
export type TherapeuticAnalysis = z.infer<typeof TherapeuticAnalysisSchema>;
