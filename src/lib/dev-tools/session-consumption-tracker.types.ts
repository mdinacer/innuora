/**
 * Session Consumption Tracker - Development Tool
 *
 * Tracks detailed AI usage metrics for monetization analysis.
 * FOR TESTING ONLY - Remove before production deployment.
 */

export interface AIOperationMetrics {
  id: string;
  timestamp: Date;
  operationType: "conversation" | "analysis" | "memory" | "wellness" | "title" | "other";
  operationLabel: string;
  model: string; // e.g., "gpt-4.1", "gpt-4.1-mini"
  vendor: "openai";

  // Token usage
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;

  // Cost breakdown (USD)
  inputCost: number;
  outputCost: number;
  totalCost: number;

  // Context
  messageIndex?: number; // Which message in session triggered this
  metadata?: Record<string, unknown>;
}

export interface SessionConsumptionSummary {
  sessionId: string;
  startTime: Date;

  // Operation counts
  totalOperations: number;
  operationsByType: Record<string, number>;

  // Token totals
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;

  // Cost totals (USD)
  totalInputCost: number;
  totalOutputCost: number;
  totalCost: number;

  // Per-model breakdown
  modelBreakdown: {
    model: string;
    operations: number;
    totalTokens: number;
    totalCost: number;
  }[];

  // All operations
  operations: AIOperationMetrics[];
}

export interface ConsumptionTrackerState {
  enabled: boolean;
  currentSession: SessionConsumptionSummary | null;
  operations: AIOperationMetrics[];
}
