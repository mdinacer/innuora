/**
 * Engine Input Types
 *
 * Input structure for holistic conversation engine.
 */

import type { RelationalTrace } from "./relational-trace.types";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ConversationWindow = ConversationMessage[];

export type EngineConfig = {
  warmth_clamp_delta: number;
  psychoedu_cooldown_turns: number;
  micro_breath_cooldown: number;
};

export type EngineInput = {
  conversation_window: ConversationWindow;
  current_user_message: string;
  relational_trace?: RelationalTrace;
  session_memory?: string; // Factual memory - always included when available
  config?: Partial<EngineConfig>;
};
