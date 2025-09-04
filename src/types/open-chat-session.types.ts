import { ModelCode } from "@/constants/ai-models";
import { StateAnalysis } from "@/lib/zod/state-analysis.schema";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

export type Session = {
  id: string;
  title: string;
  subtitle?: string;
  createdAt: Date;
  updatedAt?: Date;
  messages: OpenChatMessage[];
  summary: string | null;
  analysis: StateAnalysis[];
  modelCode: ModelCode;
  meta: {
    tokenUsage: ModelTokenUsage[];
    messageCount: number;
    tokenCount: number;
    costUSD: number;
    [key: string]: any;
  };
};
