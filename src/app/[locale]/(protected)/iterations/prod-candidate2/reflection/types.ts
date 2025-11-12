// ─────────────────────────────────────────────────────────────
// Psychoeducation
// ─────────────────────────────────────────────────────────────
export type PsychoeducationCategory =
  | "belief-system"
  | "emotional-pattern"
  | "behavioral-pattern"
  | "self-worth"
  | "meaning-fatigue"
  | "avoidance"
  | "perfectionism"
  | "boundary"
  | "resilience"
  | "regulation"
  | "attachment-dynamics";

export interface Psychoeducation {
  category: PsychoeducationCategory;
  subject: string;
  content: string;
  contextual_anchor: string;
}

// ─────────────────────────────────────────────────────────────
// Signals
// ─────────────────────────────────────────────────────────────
export type ResistanceLevel = "none" | "sarcasm" | "dismissive" | "intellectualized";

export type CrisisLevel = "none" | "acute";

// ─────────────────────────────────────────────────────────────
// Relational Trace
// ─────────────────────────────────────────────────────────────
export type RelationalStance = "grounding" | "steady" | "exploratory" | "clarifying" | "nurturing" | "directive";

export type RelationalTone = "warm" | "calm" | "curious" | "light" | "firm";

export type ResistanceType = "none" | "sarcasm" | "dismissive" | "intellectualized";

export type EngagementLevel = "low" | "moderate" | "high";

export interface RelationalTrace {
  relational_stance: RelationalStance;
  tone: RelationalTone;
  focus: string;
  notes: string;
  psychoeducation_last_turn: boolean;
  curiosity_last_turn: boolean;
  used_lived_line: boolean;
  user_engagement: EngagementLevel;
  resistance?: ResistanceType;
}
export interface RelationalTraceApp extends RelationalTrace {
  psychoedu_cooldown_remaining?: number;
  curiosity_cooldown_remaining?: number;
}

export const SAFE_FALLBACK_TRACE: RelationalTraceApp = {
  relational_stance: "steady",
  tone: "calm",
  focus: "stability and containment",
  notes: "Fallback trace — maintain calm, grounding tone; avoid exploration until stability verified.",
  psychoeducation_last_turn: false,
  curiosity_last_turn: false,
  used_lived_line: false,
  user_engagement: "moderate",

  psychoedu_cooldown_remaining: 0,
  curiosity_cooldown_remaining: 0,
};

// ─────────────────────────────────────────────────────────────
// Next Action
// ─────────────────────────────────────────────────────────────
export type NextActionType = "micro_task" | "cognitive_work";

export interface NextAction {
  type: NextActionType;
  label: string;
  rationale: string;
  confidence: number; // between 0 and 1
}

// ─────────────────────────────────────────────────────────────
// Main Reflective Response
// ─────────────────────────────────────────────────────────────
export interface ReflectiveResponse {
  reflection: string;
  follow_up_question: string | null;
  psychoeducation: Psychoeducation | null;
  crisis: CrisisLevel;
  next_relational_trace: RelationalTrace;
  next_action: NextAction | null;
}
