import z from "zod";

import { OpenChatMessage } from "@/types/open-chat-message.types";

export type SessionOverview = {
  id: string;
  publicId?: string;
  title: string;
  subtitle: string | null;
  autoUpdateTitle: boolean;
  persistOnCloud: boolean;
  metadata: SessionMeta;
  createdAt: Date;
  updatedAt: Date;
};

export interface Session {
  id: string;
  userId: string;
  title: string;
  subtitle?: string;

  createdAt: Date;
  updatedAt: Date;

  // Client-visible data (encrypted with user password)
  messages: OpenChatMessage[];
  persistOnCloud?: boolean;
  autoUpdateTitle: boolean;
  metadata: SessionMeta;

  //sessionDiagnostics: SessionDiagnosticsWithMetadata | null;
  // REMOVED - These fields are now SERVER-SIDE ONLY (stored in encrypted serverData field):
  // - memoryStore: Now in serverData (session context)
  // - continuitySummary: Now in serverData (session context)
  // - aggregatedAnalysis: Now in serverData (session context)
  // - analysisSnapshots: Now in serverData (session context)
  // - serverAnalytics: Replaced by AiOperationLog table
}

export interface SessionSummary {
  text: string;
  updatedAt: Date;
  lastMessageIndex: number;
}

export interface SessionMeta {
  messageCount: number;
  creditsUsed: number;
  activeDurationMs: number; // Actual conversation time (excludes idle gaps)
  lastActiveAt?: Date; // Last user interaction timestamp
  [key: string]: unknown;
}

export const SessionMetadataSchema = z.object({
  messageCount: z.number().optional().default(0),
  creditsUsed: z.number().optional().default(0),
  activeDurationMs: z.number().optional().default(0),
  lastActiveAt: z.coerce.date().optional(),
});
