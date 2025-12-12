import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Relational Trace (Shared Type)
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

export const RESISTANCE_LEVELS = ["none", "sarcasm", "dismissive", "intellectualized"] as const;

export type ResistanceLevel = (typeof RESISTANCE_LEVELS)[number];

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
