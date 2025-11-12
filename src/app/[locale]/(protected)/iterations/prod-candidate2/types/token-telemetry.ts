import { AIModelCategory } from "@/domains/ai-conversation/ai-models";
import { SessionProcessType } from "./session-runtime";

interface TokenBucket {
  prompt: number;
  completion: number;
  cached: number;
  cost: number;
}

export type TokenTelemetry = {
  totalPrompt: number;
  totalCompletion: number;
  totalCached: number;
  totalTokens: number;
  totalCost: number;
  byModel: Record<AIModelCategory, TokenBucket>;
  byProcess: Record<SessionProcessType, TokenBucket>;
};
