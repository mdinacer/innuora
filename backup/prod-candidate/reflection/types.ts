export type RelationalTrace = {
  relational_stance: "grounding" | "steady" | "exploratory" | "clarifying" | "nurturing" | "directive";
  tone: "warm" | "calm" | "curious" | "light" | "firm";
  focus: string;
  notes: string;
  psychoeducation_last_turn: boolean;
  curiosity_last_turn: boolean;
  used_lived_line: boolean;
  user_engagement: "low" | "moderate" | "high";
  psychoedu_cooldown?: "ready" | "active"; // optional: not required by schema
  curiosity_cooldown?: "ready" | "active"; // optional: not required by schema
};

export interface RelationalTraceApp extends RelationalTrace {
  psychoedu_cooldown_remaining?: number;
  curiosity_cooldown_remaining?: number;
}

//────────────────────────────────────────────
// REFLECTIVE RESPONSE META — internal tracking
//────────────────────────────────────────────
export type ReflectiveResponseMeta = {
  psychoeducation_suppressed?: boolean;
  psychoeducation_suppression_reason?: string;
  curiosity_suppressed?: boolean;
  curiosity_suppression_reason?: string;
  override_reason?: string;
};

//────────────────────────────────────────────
// REFLECTIVE RESPONSE — therapeutic output
//────────────────────────────────────────────
export type ReflectiveResponse = {
  reflection: string;
  follow_up_question: string | null;

  psychoeducation: {
    category?:
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
    subject?: string;
    content: string;
    contextual_anchor: string;
  } | null;

  signals: {
    resistance: "none" | "sarcasm" | "dismissive" | "intellectualized";
    crisis: "none" | "acute";
  };

  next_relational_trace: RelationalTrace;

  next_action?: {
    type: "micro_task" | "cognitive_work";
    label: string;
    rationale: string;
    confidence: number;
  } | null;

  meta?: ReflectiveResponseMeta;
};

export const SAFE_FALLBACK_TRACE: RelationalTraceApp = {
  relational_stance: "steady",
  tone: "calm",
  focus: "stability and containment",
  notes: "Fallback trace — maintain calm, grounding tone; avoid exploration until stability verified.",
  psychoeducation_last_turn: false,
  curiosity_last_turn: false,
  used_lived_line: false,
  user_engagement: "moderate",
  psychoedu_cooldown: "ready",
  curiosity_cooldown: "ready",
  psychoedu_cooldown_remaining: 0,
  curiosity_cooldown_remaining: 0,
};
