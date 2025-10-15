export type ModelMode = "free" | "paid";
export type Vendor = "openai" | "tngtech" | "mistralai" | "qwen" | "moonshotai" | "rekaai" | "deepseek";
export type ModelType = "gpt-4o" | "gpt-3.5-turbo" | "mistral" | "openchat" | string;

export interface AiModelPricing {
  prompt: number; // USD per 1K input tokens
  completion: number; // USD per 1K output tokens
}

export interface TokenUsage {
  completionTokens: number;
  promptTokens: number;
  totalTokens: number;
  completionTokensDetails?: {
    acceptedPredictionTokens: number;
    audioTokens: number;
    reasoningTokens: number;
    rejectedPredictionTokens: number;
  };
  costUSD: number;
}

export interface AiModel {
  model: string;
  apiPath: string;
  context: number;
  pricing?: AiModelPricing;
  vendor: Vendor;
  mode: ModelMode;
}

export type ModelTokenUsage = {
  completionTokens: number;
  promptTokens: number;
  totalTokens: number;
  timestamp: string;
  responseLength: number;
};

export type AiMessageResponse = {
  message: string;
  modelTokenUsage: ModelTokenUsage | null;
  consumedCredits: number;
};
