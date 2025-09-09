import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { ModelCode } from "@/lib/constants/ai-models";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { SessionAnalysis } from "./session-analysis/session-analysis.types";

export interface Session {
  id: string;
  title: string;
  subtitle?: string;

  createdAt: Date;
  updatedAt?: Date;

  messages: OpenChatMessage[];

  sessionMemory: string | null;
  sessionSummary: SessionSummary | null;
  sessionAnalysis: SessionAnalysis | null;
  analysis: StateAnalysis[];

  modelCode: ModelCode;
  persistOnCloud: boolean;
  aiSuggestedTitle: boolean;

  meta: SessionMeta;
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
  [key: string]: unknown; // more flexible than `any`
}
