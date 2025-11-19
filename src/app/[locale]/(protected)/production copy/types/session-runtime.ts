import { ConversationMessage } from "./chat-message";

export type SessionProcessType = "memory_analysis" | "reflective_directive" | "reflection" | "session_wellness";

export interface SessionPayload {
  messages: ConversationMessage[];
}

export interface SessionMetadata {
  messageCount: number;
  creditsUsed: number;
  activeDurationMs: number; // Actual conversation time (excluding idle gaps)
  lastActiveAt?: Date; // Last user interaction timestamp
  extra?: Record<string, unknown>; // Optional additional info
}

interface BaseConversationSession {
  id: string;
  userId: string;
  title: string;
  subtitle?: string;
  createdAt: Date;
  updatedAt: Date;
  persistOnCloud: boolean;
  autoUpdateTitle: boolean;
  metadata: SessionMetadata;
}

export interface ConversationSession extends BaseConversationSession {
  messages: ConversationMessage[];
}
