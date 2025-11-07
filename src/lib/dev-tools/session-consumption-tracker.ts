/**
 * Session Consumption Tracker - Development Tool
 *
 * Utilities for tracking and analyzing AI usage metrics.
 * FOR TESTING ONLY - Remove before production deployment.
 */

import type {
  AIOperationMetrics,
  ConsumptionTrackerState,
  SessionConsumptionSummary,
} from "./session-consumption-tracker.types";

// Simple ID generator
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * In-memory store for consumption tracking
 * This is intentionally client-side only for development
 */
let trackerState: ConsumptionTrackerState = {
  enabled: false,
  currentSession: null,
  operations: [],
};

/**
 * Initialize consumption tracking for a session
 */
export function initializeConsumptionTracking(sessionId: string): void {
  trackerState = {
    enabled: true,
    currentSession: {
      sessionId,
      startTime: new Date(),
      totalOperations: 0,
      operationsByType: {},
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalInputCost: 0,
      totalOutputCost: 0,
      totalCost: 0,
      modelBreakdown: [],
      operations: [],
    },
    operations: [],
  };
}

/**
 * Record an AI operation
 */
export function recordAIOperation(
  operationType: AIOperationMetrics["operationType"],
  operationLabel: string,
  model: string,
  vendor: "openai",
  inputTokens: number,
  outputTokens: number,
  inputCost: number,
  outputCost: number,
  metadata?: Record<string, unknown>
): void {
  if (!trackerState.enabled || !trackerState.currentSession) {
    return;
  }

  const operation: AIOperationMetrics = {
    id: generateId(),
    timestamp: new Date(),
    operationType,
    operationLabel,
    model,
    vendor,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
    metadata,
  };

  // Add to operations list
  trackerState.operations.push(operation);
  trackerState.currentSession.operations.push(operation);

  // Update summary
  updateSessionSummary(operation);
}

/**
 * Update session summary with new operation
 */
function updateSessionSummary(operation: AIOperationMetrics): void {
  if (!trackerState.currentSession) return;

  const summary = trackerState.currentSession;

  // Increment totals
  summary.totalOperations++;
  summary.totalInputTokens += operation.inputTokens;
  summary.totalOutputTokens += operation.outputTokens;
  summary.totalTokens += operation.totalTokens;
  summary.totalInputCost += operation.inputCost;
  summary.totalOutputCost += operation.outputCost;
  summary.totalCost += operation.totalCost;

  // Update operation type counts
  summary.operationsByType[operation.operationType] = (summary.operationsByType[operation.operationType] || 0) + 1;

  // Update model breakdown
  let modelEntry = summary.modelBreakdown.find((m) => m.model === operation.model);
  if (!modelEntry) {
    modelEntry = {
      model: operation.model,
      operations: 0,
      totalTokens: 0,
      totalCost: 0,
    };
    summary.modelBreakdown.push(modelEntry);
  }
  modelEntry.operations++;
  modelEntry.totalTokens += operation.totalTokens;
  modelEntry.totalCost += operation.totalCost;
}

/**
 * Get current session summary
 */
export function getCurrentSessionSummary(): SessionConsumptionSummary | null {
  return trackerState.currentSession;
}

/**
 * Get all operations
 */
export function getAllOperations(): AIOperationMetrics[] {
  return trackerState.operations;
}

/**
 * Clear tracking data
 */
export function clearConsumptionTracking(): void {
  trackerState = {
    enabled: false,
    currentSession: null,
    operations: [],
  };
}

/**
 * Check if tracking is enabled
 */
export function isTrackingEnabled(): boolean {
  return trackerState.enabled;
}

/**
 * Export session data as JSON
 */
export function exportSessionConsumption(): string {
  return JSON.stringify(trackerState.currentSession, null, 2);
}

/**
 * Calculate average cost per message
 */
export function calculateAverageCostPerMessage(): number {
  if (!trackerState.currentSession) return 0;

  const conversationOps = trackerState.currentSession.operations.filter((op) => op.operationType === "conversation");

  if (conversationOps.length === 0) return 0;

  const totalCost = conversationOps.reduce((sum, op) => sum + op.totalCost, 0);
  return totalCost / conversationOps.length;
}

/**
 * Calculate estimated session cost for N messages
 */
export function estimateSessionCost(messageCount: number): number {
  const avgCostPerMessage = calculateAverageCostPerMessage();
  if (avgCostPerMessage === 0) return 0;

  // Estimate includes conversation + analysis + occasional memory/wellness
  const conversationCost = avgCostPerMessage * messageCount;

  // Estimate background operations (analysis runs every message, memory ~25%, wellness ~10%)
  const analysisMultiplier = 1.0; // Every message
  const memoryMultiplier = 0.25; // 25% of messages
  const wellnessMultiplier = messageCount >= 10 ? 0.1 : 0; // Every 10 messages

  // Get average costs for background operations
  const analysisCost =
    trackerState.currentSession?.operations
      .filter((op) => op.operationType === "analysis")
      .reduce((sum, op) => sum + op.totalCost, 0) || 0;

  const memoryCost =
    trackerState.currentSession?.operations
      .filter((op) => op.operationType === "memory")
      .reduce((sum, op) => sum + op.totalCost, 0) || 0;

  const wellnessCost =
    trackerState.currentSession?.operations
      .filter((op) => op.operationType === "wellness")
      .reduce((sum, op) => sum + op.totalCost, 0) || 0;

  const analysisOpsCount =
    trackerState.currentSession?.operations.filter((op) => op.operationType === "analysis").length || 1;
  const memoryOpsCount =
    trackerState.currentSession?.operations.filter((op) => op.operationType === "memory").length || 1;
  const wellnessOpsCount =
    trackerState.currentSession?.operations.filter((op) => op.operationType === "wellness").length || 1;

  const avgAnalysisCost = analysisCost / analysisOpsCount;
  const avgMemoryCost = memoryCost / memoryOpsCount;
  const avgWellnessCost = wellnessCost / wellnessOpsCount;

  const backgroundCost =
    avgAnalysisCost * analysisMultiplier * messageCount +
    avgMemoryCost * memoryMultiplier * messageCount +
    avgWellnessCost * wellnessMultiplier * messageCount;

  return conversationCost + backgroundCost;
}
