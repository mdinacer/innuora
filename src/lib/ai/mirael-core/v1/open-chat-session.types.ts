import { StateAnalysis } from "@/lib/ai/mirael-core/v1/state-analysis/state-analysis.schema";
import { ModelCode } from "@/lib/constants/ai-models";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

//type PersistenceMode = "local" | "remote";

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
  persistOnCloud: boolean;
  aiSuggestedTitle: boolean;
  meta: {
    tokenUsage: ModelTokenUsage[];
    messageCount: number;
    tokenCount: number;
    costUSD: number;
    [key: string]: any;
  };
};
