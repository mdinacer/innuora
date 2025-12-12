import { NextAction, Psychoeducation } from "@/domains/reflection/reflection.types";
import type {
  BaseChatMessage,
  ChatMessage,
  ChatRole,
  ConversationMessage,
  UserChatMessage,
} from "@/domains/shared-types";

// Re-export shared chat message types
export type { ChatRole, ChatMessage, BaseChatMessage, UserChatMessage, ConversationMessage };

// Domain-specific: AssistantChatMessage with concrete types
export interface AssistantChatMessage {
  role: "assistant";
  id: string;
  timestamp: number;
  content: string;
  psychoeducation?: Psychoeducation | null;
  follow_up_question?: string | null;
  next_action?: NextAction | null;
}

// Re-export ConversationMessage with correct type
export type ConversationMessageTyped = UserChatMessage | AssistantChatMessage;

export type InputProcessResults = {
  reflection: string;
  psychoeducation: Psychoeducation | null;
  action: NextAction | null;
  followUpQuestion: string | null;
  consumedCredits: number;
  crisis?: {
    level: "high" | "immediate" | "acute";
    notes?: string;
  };
};
