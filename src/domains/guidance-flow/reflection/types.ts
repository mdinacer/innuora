import { z } from "zod";

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

export const RESISTANCE_LEVELS = ["none", "sarcasm", "dismissive", "intellectualized"] as const;

export type ResistanceLevel = (typeof RESISTANCE_LEVELS)[number];

export const CRISIS_LEVELS = ["none", "acute"] as const;

export type CrisisLevel = (typeof CRISIS_LEVELS)[number];

// ─────────────────────────────────────────────────────────────
// Relational Trace
// ─────────────────────────────────────────────────────────────

export const RELATIONAL_STANCES = [
  "grounding",
  "steady",
  "exploratory",
  "clarifying",
  "nurturing",
  "directive",
] as const;

export type RelationalStance = (typeof RELATIONAL_STANCES)[number];

export const RELATIONAL_TONES = ["warm", "calm", "curious", "light", "firm"] as const;

export type RelationalTone = (typeof RELATIONAL_TONES)[number];

export const ENGAGEMENT_LEVELS = ["low", "moderate", "high"] as const;

export type EngagementLevel = (typeof ENGAGEMENT_LEVELS)[number];

export const RelationalTraceSchema = z.object({
  relational_stance: z.enum(RELATIONAL_STANCES),
  tone: z.enum(RELATIONAL_TONES),
  focus: z.string(),
  notes: z.string(),
  psychoeducation_last_turn: z.boolean().optional(),
  curiosity_last_turn: z.boolean().optional(),
  used_lived_line: z.boolean(),
  user_engagement: z.enum(ENGAGEMENT_LEVELS),
  resistance: z.enum(RESISTANCE_LEVELS).optional(),
});

export type RelationalTrace = z.infer<typeof RelationalTraceSchema>;

export const RelationalTraceAppSchema = RelationalTraceSchema.extend({
  psychoedu_cooldown_remaining: z.number().optional(),
  curiosity_cooldown_remaining: z.number().optional(),
});

export type RelationalTraceApp = z.infer<typeof RelationalTraceAppSchema>;

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

// ─────────────────────────────────────────────────────────────
// Fallback Trace
// ─────────────────────────────────────────────────────────────

export const SAFE_FALLBACK_TRACE: RelationalTraceApp = {
  relational_stance: "steady",
  tone: "calm",
  focus: "establishing initial connection",
  notes: "No prior relational context. Keep presence neutral, warm, and adaptable.",
  psychoeducation_last_turn: false,
  curiosity_last_turn: false,
  used_lived_line: false,
  user_engagement: "moderate",

  psychoedu_cooldown_remaining: 0,
  curiosity_cooldown_remaining: 0,
};
