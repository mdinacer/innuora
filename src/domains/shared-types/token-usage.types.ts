/**
 * Token Usage Types (Shared)
 *
 * Used across domains for tracking AI token consumption
 */

export type ModelTokenUsage = {
  completionTokens: number;
  promptTokens: number;
  cachedTokens: number;
  totalTokens: number;
  timestamp: string;
  responseLength: number;
};
