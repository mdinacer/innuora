export type RelationalTrace = {
  relational_stance: "grounding" | "steady" | "exploratory" | "clarifying" | "nurturing" | "directive";
  tone: "warm" | "calm" | "curious" | "light" | "firm";
  focus: string;
  notes: string;
};

export interface RelationalTraceApp extends RelationalTrace {
  psychoedu_cooldown_remaining?: number;
  curiosity_cooldown_remaining?: number;
}

//────────────────────────────────────────────
// REFLECTIVE RESPONSE — therapeutic output
//────────────────────────────────────────────
export type ReflectiveResponse = {
  reflection: string;
  follow_up_question: string | null;

  psychoeducation: {
    content: string;
    contextual_anchor: string;
  } | null;

  signals: {
    resistance: "none" | "sarcasm" | "dismissive" | "intellectualized";
    crisis: "none" | "acute";
  };

  next_relational_trace: RelationalTrace;
};

export const SAFE_FALLBACK_TRACE: RelationalTraceApp = {
  relational_stance: "steady",
  tone: "calm",
  focus: "stability",
  notes: "Fallback trace — use calm, grounding tone.",
  psychoedu_cooldown_remaining: 0,
  curiosity_cooldown_remaining: 0,
};
