/**
 * Engine Output Types
 *
 * Output structure from holistic conversation engine.
 * Matches COMPACT_OPTIMIZED prompt JSON output format.
 */

import type { RelationalTrace } from "./relational-trace.types";

export type PsychoeducationalThread = {
  type: "integrated" | "none";
  content: string;
};

export type Signals = {
  resistance: "none" | "sarcasm" | "dismissive" | "intellectualized";
  crisis: "none" | "acute";
};

export type Meta = {
  stance: "grounded" | "steady" | "containing" | "receptive";
  tone_intent: "calm" | "warm" | "attuned" | "clear";
  warmth_level: number;
  responsiveness: "steady" | "softening" | "firming";
  goal_for_next_layer: string;
  accuracy: number;
  drift: "none" | "minor" | "major";
  used_lived_line: boolean;
  used_micro_breath: boolean;
};

export type EngineOutput = {
  reflection: string;
  psychoeducational_thread: PsychoeducationalThread;
  signals: Signals;
  meta: Meta;
  next_relational_trace: RelationalTrace;
};
