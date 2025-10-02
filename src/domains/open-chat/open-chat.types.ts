import z from "zod";

import { SessionAnalysis } from "@/domains/session-analysis/session-analysis.types";
import { SessionDiagnosticsWithMetadata } from "@/domains/session-diagnostics/session-diagnostics.types";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

export type SessionOverview = {
  id: string;
  publicId?: string;
  title: string;
  subtitle: string | null;
  autoUpdateTitle: boolean;
  persistOnCloud: boolean;
  metadata: {
    messageCount: number;
    tokenCount: number; // Total tokens (for backward compatibility)
    inputTokens: number; // Input/prompt tokens
    outputTokens: number; // Output/completion tokens
    costUSD: number;
    creditsUsed: number;
  };
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

  // Sensitive data
  messages: OpenChatMessage[];
  memoryStore: string | null; // a user memory store
  continuitySummary: SessionSummary | null; // a session summary for continuity
  aggregatedAnalysis: SessionAnalysis | null; // a combined analysis
  analysisSnapshots: TherapeuticAnalysis[]; // an array of StateAnalysis

  // Session diagnostics (encrypted)
  sessionDiagnostics: SessionDiagnosticsWithMetadata | null;

  persistOnCloud?: boolean;
  autoUpdateTitle: boolean;
  metadata: SessionMeta;
}

export interface SessionSummary {
  text: string;
  updatedAt: Date;
  lastMessageIndex: number;
}

export interface SessionMeta {
  tokenUsage: ModelTokenUsage[];
  messageCount: number;
  tokenCount: number; // Total tokens (for backward compatibility)
  inputTokens: number; // Input/prompt tokens (cheaper)
  outputTokens: number; // Output/completion tokens (more expensive)
  costUSD: number;
  creditsUsed: number;
  activeDurationMs: number; // Actual conversation time (excludes idle gaps)
  lastActiveAt: Date; // Last user interaction timestamp
  [key: string]: unknown;
}

export const SessionMetadataSchema = z.object({
  messageCount: z.number().optional().default(0),
  tokenCount: z.number().optional().default(0),
  inputTokens: z.number().optional().default(0),
  outputTokens: z.number().optional().default(0),
  costUSD: z.number().optional().default(0),
  creditsUsed: z.number().optional().default(0),
  activeDurationMs: z.number().optional().default(0),
  lastActiveAt: z.coerce.date().optional(),
});
