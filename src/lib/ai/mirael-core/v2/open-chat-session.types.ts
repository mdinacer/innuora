import z from "zod";

import { SessionAnalysis } from "@/lib/ai/mirael-core/v2/session-analysis/session-analysis.types";
import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { ModelCode } from "@/lib/constants/ai-models";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

export type SessionOverview = {
  id: string;
  obfuscatedId: string;
  title: string;
  subtitle: string | null;
  autoUpdateTitle: boolean;
  persistOnCloud: boolean;
  metadata: {
    messageCount: number;
    tokenCount: number;
    costUSD: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export interface Session {
  id: string;
  title: string;
  subtitle?: string;

  createdAt: Date;
  updatedAt: Date;

  // Sensitive data
  messages: OpenChatMessage[];
  memoryStore: string | null; // a user memory store
  continuitySummary: SessionSummary | null; // a session summary for continuity
  aggregatedAnalysis: SessionAnalysis | null; // a combined analysis
  analysisSnapshots: StateAnalysis[]; // an array of StateAnalysis

  modelCode: ModelCode;
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
  tokenCount: number;
  costUSD: number;
  [key: string]: unknown;
}

export const SessionMetadataSchema = z.object({
  messageCount: z.number().optional().default(0),
  tokenCount: z.number().optional().default(0),
  costUSD: z.number().optional().default(0),
});
