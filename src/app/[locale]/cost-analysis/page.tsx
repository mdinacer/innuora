"use client";

import React from "react";

import { generateCostAnalysis } from "@/lib/cost-analysis/cost-analyzer";

export default function CostAnalysisPage() {
  // Generate analysis on client-side (updates automatically when code changes)
  const analysis = generateCostAnalysis();

  // Export to JSON file
  const handleExport = () => {
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cost-analysis-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Cost Analysis Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Automated analysis of real AI costs - updates when code changes
          </p>
          <p className="text-sm text-slate-500">Generated: {new Date(analysis.generatedAt).toLocaleString()}</p>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export to JSON
          </button>
        </div>

        {/* Model Pricing */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Model Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="font-semibold text-blue-900 dark:text-blue-100">{analysis.modelPricing.default.name}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Input: ${analysis.modelPricing.default.inputPer1K.toFixed(4)}/1K tokens
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Output: ${analysis.modelPricing.default.outputPer1K.toFixed(4)}/1K tokens
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">Used for: Main conversation</div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="font-semibold text-purple-900 dark:text-purple-100">
                {analysis.modelPricing.fallback.name}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                Input: ${analysis.modelPricing.fallback.inputPer1K.toFixed(4)}/1K tokens
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">
                Output: ${analysis.modelPricing.fallback.outputPer1K.toFixed(4)}/1K tokens
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-2">Used for: Alternative/Testing</div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="font-semibold text-green-900 dark:text-green-100">{analysis.modelPricing.mini.name}</div>
              <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                Input: ${analysis.modelPricing.mini.inputPer1K.toFixed(4)}/1K tokens
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">
                Output: ${analysis.modelPricing.mini.outputPer1K.toFixed(4)}/1K tokens
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                Used for: Analysis, memory, wellness
              </div>
            </div>
          </div>
        </div>

        {/* AI Operations */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            AI Operations (Auto-detected)
          </h2>
          <div className="space-y-4">
            {analysis.operations.map((op, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{op.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{op.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      ${op.costPerCall.toFixed(4)}
                    </div>
                    <div className="text-xs text-slate-500">per call</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">Frequency</div>
                    <div className="font-medium text-slate-700 dark:text-slate-300">
                      {op.frequency === "per_message" && "Every message"}
                      {op.frequency === "every_n_messages" && op.frequencyDetail}
                      {op.frequency === "on_demand" && "On demand"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Model</div>
                    <div className="font-medium text-slate-700 dark:text-slate-300">
                      {op.model === "default" ? "GPT-4o" : "GPT-4o-mini"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Input Tokens</div>
                    <div className="font-medium text-slate-700 dark:text-slate-300">~{op.estimatedInputTokens}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Output Tokens</div>
                    <div className="font-medium text-slate-700 dark:text-slate-300">~{op.estimatedOutputTokens}</div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 mt-2">Used in: {op.usedIn.join(", ")}</div>
              </div>
            ))}
          </div>
        </div>

        {/* User Behavior Models */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">
            User Behavior Models & Monthly Costs
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysis.userModels.map((model, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-lg border-2 ${
                  idx === 0
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                    : idx === 1
                      ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                      : idx === 2
                        ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"
                        : "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{model.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {model.sessionsPerMonth} sessions/month × {model.messagesPerSession} messages
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      ${model.totalMonthlyCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-slate-500">per month</div>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-white/50 dark:bg-slate-900/50 rounded">
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Cost per session:</span> ${model.costPerSession.toFixed(3)}
                  </div>
                </div>

                <div className="space-y-2">
                  {model.operations.map((op, opIdx) => (
                    <div key={opIdx} className="flex justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">
                        {op.operation} ({op.callsPerMonth.toFixed(0)} calls)
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        ${op.monthlyCost.toFixed(3)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monetization Insights */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 shadow-lg border border-purple-200 dark:border-purple-800">
          <h2 className="text-2xl font-semibold mb-4 text-slate-900 dark:text-slate-100">Monetization Insights</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/60 dark:bg-slate-900/60 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Minimum Viable Price</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${(analysis.userModels[1].totalMonthlyCost * 2).toFixed(2)}/mo
              </div>
              <div className="text-xs text-slate-500 mt-1">2x cost for moderate user</div>
            </div>

            <div className="p-4 bg-white/60 dark:bg-slate-900/60 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Sustainable Price</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${(analysis.userModels[1].totalMonthlyCost * 5).toFixed(2)}/mo
              </div>
              <div className="text-xs text-slate-500 mt-1">5x cost for profitability</div>
            </div>

            <div className="p-4 bg-white/60 dark:bg-slate-900/60 rounded-lg">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Premium Price</div>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                ${(analysis.userModels[2].totalMonthlyCost * 3).toFixed(2)}/mo
              </div>
              <div className="text-xs text-slate-500 mt-1">3x cost for heavy user</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white/80 dark:bg-slate-900/80 rounded-lg">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Recommendations</h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>
                  <strong>Tiered Pricing:</strong> Light ($
                  {(analysis.userModels[0].totalMonthlyCost * 3).toFixed(0)}), Standard ($
                  {(analysis.userModels[1].totalMonthlyCost * 4).toFixed(0)}), Premium ($
                  {(analysis.userModels[2].totalMonthlyCost * 3).toFixed(0)})
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>
                  <strong>Pay-as-you-go:</strong> ${(analysis.operations[0].costPerCall * 2).toFixed(3)} per message (2x
                  markup)
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>
                  <strong>Freemium:</strong> 10 free messages/month = $
                  {(analysis.operations[0].costPerCall * 10 + analysis.operations[1].costPerCall * 10).toFixed(2)} cost
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-slate-500 pb-8">
          <p>This analysis is generated automatically from your codebase.</p>
          <p className="mt-1">Token counts use tiktoken for accuracy. Costs update when .env changes.</p>
        </div>
      </div>
    </div>
  );
}
