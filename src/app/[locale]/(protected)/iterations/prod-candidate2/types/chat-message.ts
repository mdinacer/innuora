import { NextAction, Psychoeducation } from "../reflection/types";

export type ChatRole = "user" | "assistant";

export interface BaseChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt?: string | Date;
}

export interface UserChatMessage extends BaseChatMessage {
  role: "user";
}

export interface AssistantChatMessage extends BaseChatMessage {
  role: "assistant";
  psychoeducation?: Psychoeducation | null;
  follow_up_question?: string | null;
  next_action?: NextAction | null;
}

export type OpenChatMessage = UserChatMessage | AssistantChatMessage;
