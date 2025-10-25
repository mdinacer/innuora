// ===============================
// INPUTS (as per your instruction)
// ===============================
export type Role = "user" | "assistant";

export type ConversationTurn = {
  role: Role;
  content: string;
};

export type RelationalTraceIn = {
  last_theme?: string;
  tone_shift?: string; // e.g., "maintain steady containment, slightly increase warmth"
  unresolved_thread?: string; // e.g., "fear of losing connection to self"
  last_warmth_level?: number; // 1–5
  psychoeducation_last_turn?: boolean; // true if a capsule was used last turn
};

export type EngineConfig = {
  warmth_clamp_delta?: number; // default 1
  psychoedu_cooldown_turns?: number; // default 4
  micro_breath_cooldown?: number; // default 2
};

export type HolisticEngineInput = {
  conversation_window: ConversationTurn[]; // last 6–10 turns, newest last
  current_user_message: string; // latest user line
  relational_trace?: RelationalTraceIn; // optional continuity
  config?: EngineConfig; // optional knobs
};

export type HolisticEngineMeta = {
  stance: Stance;
  tone_intent: ToneIntent;
  warmth_level: number; // 1–5 (candidate; you may clamp app-side)
  responsiveness: Responsiveness;
  goal_for_next_layer: NextLayerGoal;
  accuracy: number; // 90–100, relational coherence metric
  drift: Drift;
  used_lived_line: boolean;
  used_micro_breath: boolean;
};

export type HolisticEngineRelationalTrace = {
  last_theme: string;
  tone_shift: string; // e.g., "maintain steady containment, slightly increase warmth"
  unresolved_thread: string;
  last_warmth_level: number; // carry forward (after any app-side clamp if you apply it)
  psychoeducation_last_turn: boolean;
};

// ==================================
// OUTPUT (matches your JSON schema)
// ==================================
export type PsychoeduType = "lived" | "observed" | "read" | "none";
export type ResistanceType = "none" | "sarcasm" | "dismissive" | "intellectualized";
export type CrisisType = "none" | "acute";

export type Stance = "grounded" | "steady" | "containing" | "receptive" | "firm" | "softening";

export type ToneIntent = "calm" | "measured" | "quietly warm" | "attuned" | "neutral" | "clear";

export type Responsiveness = "steady" | "softening" | "firming" | "opening";

export type NextLayerGoal = "create safety" | "sustain openness" | "reduce defensiveness" | "mirror vulnerability";

export type Drift = "none" | "minor" | "major";

export type HolisticEngineOutput = {
  reflection: string; // 1–3 sentences; ends with awareness

  psychoeducational_thread: {
    type: PsychoeduType;
    content: string; // empty if type:"none"
  };

  signals: {
    resistance: ResistanceType; // sarcasm | dismissive | intellectualized | none
    crisis: CrisisType; // acute | none
  };

  meta: HolisticEngineMeta;

  next_relational_trace: HolisticEngineRelationalTrace;
};

export interface RelationalTraceApp extends RelationalTraceIn {
  psychoedu_cooldown_remaining?: number;
  micro_breath_cooldown_remaining?: number;
}
