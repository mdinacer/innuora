import { z } from "zod";

import type {
  EngagementLevel,
  RelationalStance,
  RelationalTone,
  RelationalTrace,
  RelationalTraceApp,
  ResistanceLevel,
} from "@/domains/shared-types";
import {
  ENGAGEMENT_LEVELS,
  RELATIONAL_STANCES,
  RELATIONAL_TONES,
  RelationalTraceAppSchema,
  RelationalTraceSchema,
  RESISTANCE_LEVELS,
  SAFE_FALLBACK_TRACE,
} from "@/domains/shared-types";

// Re-export shared types
export type { RelationalTrace, RelationalTraceApp, RelationalStance, RelationalTone, EngagementLevel, ResistanceLevel };

export {
  RelationalTraceSchema,
  RelationalTraceAppSchema,
  RELATIONAL_STANCES,
  RELATIONAL_TONES,
  ENGAGEMENT_LEVELS,
  RESISTANCE_LEVELS,
  SAFE_FALLBACK_TRACE,
};

// ─────────────────────────────────────────────────────────────
// Psychoeducation
// ─────────────────────────────────────────────────────────────

export const PSYCHOEDU_CATEGORIES = [
  "belief-system",
  "emotional-pattern",
  "behavioral-pattern",
  "self-worth",
  "meaning-fatigue",
  "avoidance",
  "perfectionism",
  "boundary",
  "resilience",
  "regulation",
  "attachment-dynamics",
] as const;

export type PsychoeducationCategory = (typeof PSYCHOEDU_CATEGORIES)[number];

export const PsychoeducationSchema = z.object({
  category: z.enum(PSYCHOEDU_CATEGORIES).optional(), // Make optional
  subject: z.string().optional(),
  content: z.string(),
  contextual_anchor: z.string(),
});

export type Psychoeducation = z.infer<typeof PsychoeducationSchema>;

// ─────────────────────────────────────────────────────────────
// Signals
// ─────────────────────────────────────────────────────────────

export const CRISIS_LEVELS = ["none", "acute"] as const;

export type CrisisLevel = (typeof CRISIS_LEVELS)[number];

// ─────────────────────────────────────────────────────────────
// Next Action
// ─────────────────────────────────────────────────────────────

export const NEXT_ACTION_TYPES = ["micro_task", "cognitive_work"] as const;

export type NextActionType = (typeof NEXT_ACTION_TYPES)[number];

export const NextActionSchema = z.object({
  type: z.enum(NEXT_ACTION_TYPES),
  label: z.string(),
  rationale: z.string(),
  confidence: z.number().min(0).max(1),
});

export type NextAction = z.infer<typeof NextActionSchema>;

// ─────────────────────────────────────────────────────────────
// Reflective Response
// ─────────────────────────────────────────────────────────────

export const ReflectiveResponseSchema = z.object({
  reflection: z.string(),
  follow_up_question: z.string().nullable(),
  psychoeducation: PsychoeducationSchema.nullable(),
  crisis: z.enum(CRISIS_LEVELS),
  next_relational_trace: RelationalTraceSchema,
  next_action: NextActionSchema.nullable(),
});

export type ReflectiveResponse = z.infer<typeof ReflectiveResponseSchema>;
