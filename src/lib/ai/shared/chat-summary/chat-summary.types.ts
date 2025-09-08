import { ModelTokenUsage } from "@/types/ai-model.types";

export interface SummaryConfig {
  wordRange: string;
  includeMetadata: boolean;
  description: string;
  maxInputTokens: number;
}

export interface SummaryResult {
  summary: string;
  modelTokenUsage: ModelTokenUsage | null;
  title?: string;
  subtitle?: string;
  metadata?: {
    messageCount: number;
    truncated: boolean;
    emotionalIntensity?: "low" | "medium" | "high";
  };
}
