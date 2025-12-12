import z from "zod";

import { ConversationMessage } from "@/domains/conversation/conversation.types";

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

export const SessionMetadataSchema = z.object({
  messageCount: z.number().int().nonnegative(),
  creditsUsed: z.number().nonnegative(),
  activeDurationMs: z.number().int().nonnegative(),

  lastActiveAt: z
    .union([z.date(), z.string()])
    .optional()
    .transform((v) => (typeof v === "string" ? new Date(v) : v)),

  extra: z.record(z.string(), z.unknown()).optional(),
});

export const SessionCreateSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  autoUpdateTitle: z.boolean().optional(),
  persistOnCloud: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type SessionCreate = z.infer<typeof SessionCreateSchema>;
