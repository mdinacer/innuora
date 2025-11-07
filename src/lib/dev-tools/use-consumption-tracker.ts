"use client";

/**
 * React Hook for Session Consumption Tracking
 *
 * Provides utilities to track AI operations from client components.
 * FOR TESTING ONLY - Remove before production deployment.
 */
import { useEffect, useRef } from "react";

import { calculateModelCost, type AIModelCategory } from "@/domains/ai-conversation/ai-models";
import { ENABLE_CONSUMPTION_TRACKER } from "./dev-tools-config";
import {
  clearConsumptionTracking,
  initializeConsumptionTracking,
  recordAIOperation,
} from "./session-consumption-tracker";
import type { AIOperationMetrics } from "./session-consumption-tracker.types";

const MODEL_TYPE_TO_CATEGORY: Record<"default" | "fallback", AIModelCategory> = {
  default: "reflection",
  fallback: "diagnostic",
};

/**
 * Initialize tracking for a session
 */
export function useConsumptionTracker(sessionId: string | undefined) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!ENABLE_CONSUMPTION_TRACKER || !sessionId || initialized.current) {
      return;
    }

    initializeConsumptionTracking(sessionId);
    initialized.current = true;

    return () => {
      clearConsumptionTracking();
      initialized.current = false;
    };
  }, [sessionId]);

  return {
    trackOperation: (
      operationType: AIOperationMetrics["operationType"],
      operationLabel: string,
      modelType: "default" | "fallback",
      inputTokens: number,
      outputTokens: number,
      metadata?: Record<string, unknown>
    ) => {
      if (!ENABLE_CONSUMPTION_TRACKER) return;

      const cost = calculateModelCost(MODEL_TYPE_TO_CATEGORY[modelType], inputTokens, outputTokens);

      recordAIOperation(
        operationType,
        operationLabel,
        cost.model,
        cost.vendor,
        inputTokens,
        outputTokens,
        cost.inputCost,
        cost.outputCost,
        metadata
      );
    },
  };
}

/**
 * Track an AI operation from response data
 */
export function trackAIOperationFromResponse(
  operationType: AIOperationMetrics["operationType"],
  operationLabel: string,
  modelType: "default" | "fallback",
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  },
  metadata?: Record<string, unknown>
) {
  if (!ENABLE_CONSUMPTION_TRACKER) return;

  const cost = calculateModelCost(
    MODEL_TYPE_TO_CATEGORY[modelType],
    tokenUsage.promptTokens,
    tokenUsage.completionTokens
  );

  recordAIOperation(
    operationType,
    operationLabel,
    cost.model,
    cost.vendor,
    tokenUsage.promptTokens,
    tokenUsage.completionTokens,
    cost.inputCost,
    cost.outputCost,
    metadata
  );
}
