"use client";

import React, { useState } from "react";
import { Lightbulb, Shield, TrendingUp } from "lucide-react";

import { ActionableInsight } from "@/domains/insights/actionable-insights.types";
import { AdvancedInsightsProfile } from "@/domains/insights/advanced-insights.types";
import { InsightsActionEngine } from "@/domains/insights/insights-action-engine";
import ActionableInsightsSection from "./actionable-insights-section";
import BehavioralWiringSection from "./behavioral-wiring-section";
import EmotionalTriggersSection from "./emotional-triggers-section";
import ProgressBlindSpotsSection from "./progress-blind-spots-section";

interface Props {
  insights: AdvancedInsightsProfile;
  isLoading?: boolean;
}

const AdvancedInsightsDashboard: React.FC<Props> = ({ insights, isLoading }) => {
  const [actionableInsights, setActionableInsights] = useState<ActionableInsight[]>([]);
  const [completedInsights, setCompletedInsights] = useState<ActionableInsight[]>([]);
  const [hasGeneratedActions, setHasGeneratedActions] = useState(false);

  // Generate actionable insights on first load
  React.useEffect(() => {
    if (!isLoading && !hasGeneratedActions) {
      const generatedActions = InsightsActionEngine.generateActionableInsights(
        insights.emotionalTriggers,
        insights.behavioralWiring,
        insights.avoidancePatterns,
        insights.recoverySignatures,
        insights.progressBlindSpots
      );
      setActionableInsights(generatedActions);
      setHasGeneratedActions(true);
    }
  }, [isLoading, insights, hasGeneratedActions]);

  const handleCompleteInsight = (insightId: string, rating?: number, notes?: string) => {
    const completedInsight = actionableInsights.find((insight) => insight.id === insightId);
    if (completedInsight) {
      const updatedInsight = {
        ...completedInsight,
        isCompleted: true,
        completedAt: new Date(),
        effectivenessRating: rating,
        userNotes: notes,
      };

      setActionableInsights((prev) => prev.filter((insight) => insight.id !== insightId));
      setCompletedInsights((prev) => [...prev, updatedInsight]);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-slate-200 rounded w-1/2 mx-auto"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-48 bg-slate-200 rounded"></div>
            <div className="h-48 bg-slate-200 rounded"></div>
            <div className="h-48 bg-slate-200 rounded"></div>
          </div>
          <div className="h-96 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header with confidence metrics */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Your Psychological Insights</h1>
        <p className="text-slate-600 text-lg mb-4">Patterns and discoveries about how your mind works</p>
        <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
          <span>Analyzed {insights.dataPointsAnalyzed} sessions</span>
          <span>•</span>
          <span>{insights.analysisConfidence}% confidence in patterns</span>
          <span>•</span>
          <span>Generated {new Date(insights.analysisDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Key Insights Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <Lightbulb className="size-6 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Your Biggest Pattern</h3>
          </div>
          <p className="text-blue-800 leading-relaxed">{insights.overallPattern}</p>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="size-6 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Hidden Strength</h3>
          </div>
          <p className="text-amber-800 leading-relaxed">{insights.hiddenStrength}</p>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="size-6 text-emerald-600" />
            <h3 className="font-semibold text-emerald-900">Unconscious Wisdom</h3>
          </div>
          <p className="text-emerald-800 leading-relaxed">{insights.unconsciousWisdom}</p>
        </div>
      </div>

      {/* Main Insights Sections */}
      <div className="space-y-8">
        {/* Emotional Triggers */}
        {insights.emotionalTriggers.length > 0 && <EmotionalTriggersSection triggers={insights.emotionalTriggers} />}

        {/* Behavioral Wiring */}
        {insights.behavioralWiring.length > 0 && <BehavioralWiringSection wiring={insights.behavioralWiring} />}

        {/* Progress Blind Spots */}
        {insights.progressBlindSpots.length > 0 && (
          <ProgressBlindSpotsSection blindSpots={insights.progressBlindSpots} />
        )}

        {/* Actionable Insights Section */}
        {hasGeneratedActions && (
          <ActionableInsightsSection
            insights={actionableInsights}
            completedInsights={completedInsights}
            onCompleteInsight={handleCompleteInsight}
          />
        )}
      </div>

      {/* Next Insights Recommendations */}
      {insights.recommendedNextInsights.length > 0 && (
        <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">What to explore next</h3>
          <div className="space-y-2">
            {insights.recommendedNextInsights.map((recommendation, index) => (
              <div key={index} className="flex items-center gap-3 text-slate-700">
                <div className="size-2 bg-slate-400 rounded-full"></div>
                <span>{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>How this works:</strong> These insights are generated by analyzing patterns in your conversations
          using advanced AI. They're designed for self-reflection and awareness, not clinical diagnosis. The patterns
          shown have high statistical confidence but should be viewed as starting points for exploration.
        </p>
      </div>
    </div>
  );
};

export default AdvancedInsightsDashboard;
