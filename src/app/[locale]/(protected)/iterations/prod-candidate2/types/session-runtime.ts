import { FactualMemory } from "../memory/types";
import { OpenChatMessage } from "./chat-message";

export type SessionProcessType = "memory_analysis" | "reflective_directive" | "reflection" | "session_wellness";

export interface SessionPayload {
  messages: OpenChatMessage[];
  memories: FactualMemory[];
}

export interface SessionMetadata {
  messageCount: number;
  creditsUsed: number;
  activeDurationMs: number; // Actual conversation time (excluding idle gaps)
  lastActiveAt?: Date; // Last user interaction timestamp
  extra?: Record<string, unknown>; // Optional additional info
}

export interface ConversationSession {
  id: string;
  publicId?: string;

  userId: string;
  title: string;
  subtitle?: string;

  createdAt: Date;
  updatedAt: Date;

  messages: OpenChatMessage[];
  memories: FactualMemory[];

  shouldPersistToCloud?: boolean;
  shouldAutoUpdateTitle: boolean;

  metadata: SessionMetadata;
}
