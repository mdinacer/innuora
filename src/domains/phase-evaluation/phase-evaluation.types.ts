import { z } from "zod";

// ENUM CONSTANTS
export const SESSION_PHASES = ["opening", "exploration", "deep_reflection", "resolution", "closure"] as const;
export type SessionPhase = (typeof SESSION_PHASES)[number];

export const CLOSURE_STATES = ["continue", "near_closure", "ready_to_end"] as const;
export type ClosureState = (typeof CLOSURE_STATES)[number];

export const TONE_RECOMMENDATIONS = ["containment", "validation", "closure", "redirect"] as const;
export type ToneRecommendation = (typeof TONE_RECOMMENDATIONS)[number];

// ZOD SCHEMA
export const SessionPhaseEvaluationSchema = z.object({
  phase: z.enum(SESSION_PHASES),
  closure_state: z.enum(CLOSURE_STATES),
  tone_recommendation: z.enum(TONE_RECOMMENDATIONS),
  rationale: z.string(),
});

// Type inference
export type SessionPhaseEvaluation = z.infer<typeof SessionPhaseEvaluationSchema>;
