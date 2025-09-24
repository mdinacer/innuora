import React from "react";

import { CrossSessionInsights } from "@/domains/insights/insights.types";
import PatternInsights from "./pattern-insights";
import ProgressOverview from "./progress-overview";

interface Props {
  insights: CrossSessionInsights;
  isLoading?: boolean;
}

const InsightsDashboard: React.FC<Props> = ({ insights, isLoading }) => {
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-48 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Transform insights data into component props
  const progressMetrics = [
    {
      label: "Overwhelm Management",
      current:
        insights.emotionalIntensity.current === "low"
          ? "Well Managed"
          : insights.emotionalIntensity.current === "moderate"
            ? "Improving"
            : "Needs Attention",
      change: Math.abs(insights.emotionalIntensity.improvement),
      direction:
        insights.emotionalIntensity.improvement > 0
          ? ("down" as const)
          : insights.emotionalIntensity.improvement < 0
            ? ("up" as const)
            : ("stable" as const),
      isImprovement: false, // Lower intensity is better
    },
    {
      label: "Emotional Intensity",
      current: insights.emotionalIntensity.current,
      change: Math.abs(insights.emotionalIntensity.improvement),
      direction:
        insights.emotionalIntensity.improvement > 0
          ? ("down" as const)
          : insights.emotionalIntensity.improvement < 0
            ? ("up" as const)
            : ("stable" as const),
      isImprovement: false,
    },
    {
      label: "Session Clarity Rate",
      current: `${insights.sessionOutcomes.clarityRate}%`,
      change: 25, // Mock improvement
      direction: "up" as const,
      isImprovement: true,
    },
    {
      label: "Total Sessions",
      current: insights.sessionOutcomes.totalSessions,
      change: 15, // Mock increase
      direction: "up" as const,
      isImprovement: true,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Your Inner World</h1>
        <p className="text-slate-600">Understanding your emotional patterns and growth</p>
      </div>

      {/* Progress Overview */}
      <ProgressOverview timeframe="Past 30 Days" metrics={progressMetrics} />

      {/* Pattern Insights */}
      <PatternInsights insights={insights.keyInsights} />

      {/* Additional Context */}
      {insights.distortionPatterns.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Thought Pattern Changes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.distortionPatterns.slice(0, 4).map((pattern) => (
              <div key={pattern.type} className="flex items-center justify-between p-3 bg-white rounded border">
                <span className="text-sm font-medium text-slate-700">
                  {pattern.type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-emerald-600">↓{pattern.reduction}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsDashboard;
