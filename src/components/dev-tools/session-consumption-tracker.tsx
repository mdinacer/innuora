"use client";

/**
 * Session Consumption Tracker Component - Development Tool
 *
 * Displays detailed AI usage metrics for monetization analysis.
 * FOR TESTING ONLY - Remove before production deployment.
 *
 * Shows:
 * - Per-operation token usage and costs
 * - Session totals and averages
 * - Model breakdown
 * - Estimated costs for different session lengths
 */
import React, { useEffect, useState } from "react";

import {
  calculateAverageCostPerMessage,
  estimateSessionCost,
  exportSessionConsumption,
  getCurrentSessionSummary,
} from "@/lib/dev-tools/session-consumption-tracker";
import type { AIOperationMetrics, SessionConsumptionSummary } from "@/lib/dev-tools/session-consumption-tracker.types";

export function SessionConsumptionTracker() {
  const [summary, setSummary] = useState<SessionConsumptionSummary | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<AIOperationMetrics | null>(null);

  // Poll for updates every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      const currentSummary = getCurrentSessionSummary();
      setSummary(currentSummary);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (!summary) {
    return null;
  }

  const avgCostPerMessage = calculateAverageCostPerMessage();

  const handleExport = () => {
    const json = exportSessionConsumption();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `session-consumption-${summary.sessionId}-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-2xl">
      {/* Compact view */}
      <div className="rounded-lg border-2 border-orange-500 bg-orange-50 p-3 shadow-lg dark:bg-orange-950">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="rounded bg-orange-500 px-2 py-1 text-xs font-bold text-white">DEV ONLY</div>
            <div className="text-sm font-semibold text-orange-900 dark:text-orange-100">Session Consumption</div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-orange-600 dark:text-orange-400">Total Cost</div>
              <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
                ${summary.totalCost.toFixed(4)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-orange-600 dark:text-orange-400">Operations</div>
              <div className="text-lg font-bold text-orange-900 dark:text-orange-100">{summary.totalOperations}</div>
            </div>

            <div className="text-right">
              <div className="text-xs text-orange-600 dark:text-orange-400">Tokens</div>
              <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
                {summary.totalTokens.toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded bg-orange-500 px-3 py-1 text-sm font-medium text-white hover:bg-orange-600"
            >
              {isExpanded ? "Hide" : "Details"}
            </button>
          </div>
        </div>

        {/* Expanded view */}
        {isExpanded && (
          <div className="mt-4 space-y-4 border-t border-orange-300 pt-4 dark:border-orange-700">
            {/* Session Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded bg-white p-3 dark:bg-orange-900">
                <div className="text-xs text-orange-600 dark:text-orange-400">Avg Cost/Message</div>
                <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                  ${avgCostPerMessage.toFixed(4)}
                </div>
              </div>

              <div className="rounded bg-white p-3 dark:bg-orange-900">
                <div className="text-xs text-orange-600 dark:text-orange-400">Input Tokens</div>
                <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                  {summary.totalInputTokens.toLocaleString()}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">${summary.totalInputCost.toFixed(4)}</div>
              </div>

              <div className="rounded bg-white p-3 dark:bg-orange-900">
                <div className="text-xs text-orange-600 dark:text-orange-400">Output Tokens</div>
                <div className="text-xl font-bold text-orange-900 dark:text-orange-100">
                  {summary.totalOutputTokens.toLocaleString()}
                </div>
                <div className="text-xs text-orange-600 dark:text-orange-400">
                  ${summary.totalOutputCost.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Model Breakdown */}
            <div>
              <div className="mb-2 text-sm font-semibold text-orange-900 dark:text-orange-100">Model Breakdown</div>
              <div className="space-y-2">
                {summary.modelBreakdown.map((model) => (
                  <div key={model.model} className="rounded bg-white p-2 text-xs dark:bg-orange-900">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-orange-900 dark:text-orange-100">{model.model}</span>
                      <div className="flex gap-4">
                        <span className="text-orange-600 dark:text-orange-400">{model.operations} ops</span>
                        <span className="text-orange-600 dark:text-orange-400">
                          {model.totalTokens.toLocaleString()} tokens
                        </span>
                        <span className="font-semibold text-orange-900 dark:text-orange-100">
                          ${model.totalCost.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Session Costs */}
            <div>
              <div className="mb-2 text-sm font-semibold text-orange-900 dark:text-orange-100">
                Estimated Session Costs
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 30, 50].map((count) => (
                  <div key={count} className="rounded bg-white p-2 text-center dark:bg-orange-900">
                    <div className="text-xs text-orange-600 dark:text-orange-400">{count} messages</div>
                    <div className="text-lg font-bold text-orange-900 dark:text-orange-100">
                      ${estimateSessionCost(count).toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operations List */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-orange-900 dark:text-orange-100">Recent Operations</div>
                <button
                  onClick={handleExport}
                  className="rounded bg-orange-500 px-2 py-1 text-xs font-medium text-white hover:bg-orange-600"
                >
                  Export JSON
                </button>
              </div>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {summary.operations
                  .slice()
                  .reverse()
                  .map((op) => (
                    <button
                      key={op.id}
                      onClick={() => setSelectedOperation(selectedOperation?.id === op.id ? null : op)}
                      className="cursor-pointer rounded bg-white p-2 text-xs hover:bg-orange-100 dark:bg-orange-900 dark:hover:bg-orange-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-orange-200 px-1.5 py-0.5 text-[10px] font-semibold text-orange-900 dark:bg-orange-700 dark:text-orange-100">
                            {op.operationType}
                          </span>
                          <span className="font-medium text-orange-900 dark:text-orange-100">{op.operationLabel}</span>
                          <span className="text-orange-600 dark:text-orange-400">{op.model}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="text-orange-600 dark:text-orange-400">
                            {op.inputTokens}→{op.outputTokens}
                          </span>
                          <span className="font-semibold text-orange-900 dark:text-orange-100">
                            ${op.totalCost.toFixed(4)}
                          </span>
                        </div>
                      </div>

                      {selectedOperation?.id === op.id && (
                        <div className="mt-2 space-y-1 border-t border-orange-200 pt-2 dark:border-orange-700">
                          <div className="flex justify-between">
                            <span className="text-orange-600 dark:text-orange-400">Input Cost:</span>
                            <span className="text-orange-900 dark:text-orange-100">${op.inputCost.toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-600 dark:text-orange-400">Output Cost:</span>
                            <span className="text-orange-900 dark:text-orange-100">${op.outputCost.toFixed(6)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-600 dark:text-orange-400">Total Tokens:</span>
                            <span className="text-orange-900 dark:text-orange-100">
                              {op.totalTokens.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-600 dark:text-orange-400">Timestamp:</span>
                            <span className="text-orange-900 dark:text-orange-100">
                              {op.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          {op.metadata && Object.keys(op.metadata).length > 0 && (
                            <div className="mt-1">
                              <div className="text-orange-600 dark:text-orange-400">Metadata:</div>
                              <pre className="mt-1 overflow-x-auto rounded bg-orange-50 p-1 text-[10px] text-orange-900 dark:bg-orange-950 dark:text-orange-100">
                                {JSON.stringify(op.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
