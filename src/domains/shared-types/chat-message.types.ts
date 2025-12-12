// ─────────────────────────────────────────────────────────────
// Chat Message Types (Shared)
// ─────────────────────────────────────────────────────────────

import { NextAction, Psychoeducation } from "../reflection";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface BaseChatMessage extends ChatMessage {
  id: string;
  timestamp: number;
}

export interface UserChatMessage extends BaseChatMessage {
  role: "user";
}

// Note: Psychoeducation and NextAction are imported by conversation domain
// They remain in reflection.types.ts as they're reflection-specific
export interface AssistantChatMessage extends BaseChatMessage {
  role: "assistant";
  psychoeducation?: Psychoeducation | null; // Generic to avoid circular dependency
  follow_up_question?: string | null;
  next_action?: NextAction | null; // Generic to avoid circular dependency
}

export type ConversationMessage = UserChatMessage | AssistantChatMessage;
