/**
 * Engine Output Types
 *
 * Output structure from holistic conversation engine.
 * Simplified to remove unused meta fields - pacing controls moved to RelationalTrace.
 */

import type { RelationalTrace } from "./relational-trace.types";

export type PsychoeducationalThread = {
  type: "integrated" | "none";
  content?: string;
};

export type Signals = {
  resistance: "none" | "sarcasm" | "dismissive" | "intellectualized";
  crisis: "none" | "acute";
};

export type EngineOutput = {
  reflection: string;
  psychoeducational_thread: PsychoeducationalThread;
  signals: Signals;
  next_relational_trace: RelationalTrace; // Now includes used_lived_line & used_micro_breath for pacing
};
