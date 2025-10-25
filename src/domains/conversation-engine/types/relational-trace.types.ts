/**
 * Relational Trace Types
 *
 * Tracks conversation continuity across turns.
 * Used by holistic engine to maintain therapeutic relationship.
 */

export type RelationalTrace = {
  last_theme: string; // Brief theme description (EN) - e.g., "exhaustion beyond rest"
  tone_shift: string; // Tone shift description (EN) - e.g., "maintain steady containment"
  unresolved_thread: string; // Unresolved thread (EN) - e.g., "rest feels unsafe"
  last_warmth_level: number; // 1-5 scale
  psychoeducation_last_turn: boolean; // Was psychoeducation used in last turn?
};

export const DEFAULT_RELATIONAL_TRACE: RelationalTrace = {
  last_theme: "",
  tone_shift: "",
  unresolved_thread: "",
  last_warmth_level: 3,
  psychoeducation_last_turn: false,
};
