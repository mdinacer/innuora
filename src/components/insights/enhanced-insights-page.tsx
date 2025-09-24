import React, { useEffect, useState } from "react";
import { EmotionalTrigger, AdvancedInsightsProfile } from "@/domains/insights/advanced-insights.types";
import { ActionableInsight } from "@/domains/insights/actionable-insights.types";
import { SimpleProgressVisual } from "./simple-progress-visual";
import { SimplePredictiveNudge, usePredictiveNudges } from "./simple-predictive-nudge";
import ActionableInsightCard from "./actionable-insight-card";

interface Props {
  userId: string;
  insightsProfile: AdvancedInsightsProfile;
  actionableInsights: ActionableInsight[];
}

/**
 * Enhanced insights page that shows PREDICTIVE insights instead of just reactive analysis
 * This is the simple, efficient implementation that transforms the user experience
 */
export const EnhancedInsightsPage: React.FC<Props> = ({
  userId,
  insightsProfile,
  actionableInsights,
}) => {
  const {
    activeTriggers,
    handleDismiss,
    handleTakeAction,
  } = usePredictiveNudges(insightsProfile.emotionalTriggers);

  // Get predictions that are happening soon for immediate display
  const upcomingPredictions = insightsProfile.emotionalTriggers.filter(
    trigger => trigger.nextPrediction && trigger.nextPrediction.likelihood > 50
  );

  return (
    <div className="space-y-6 p-4">
      {/* Predictive Nudges - Float on top when patterns are imminent */}
      <SimplePredictiveNudge
        triggers={activeTriggers}
        onDismiss={handleDismiss}
        onTakeAction={handleTakeAction}
      />

      {/* Hero Section - Show Predictive Nature */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Your Emotional Intelligence
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {insightsProfile.emotionalTriggers.length}
            </div>
            <div className="text-sm text-slate-600">Patterns Identified</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {upcomingPredictions.length}
            </div>
            <div className="text-sm text-slate-600">Predictions Active</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              {insightsProfile.progressBlindSpots.length}
            </div>
            <div className="text-sm text-slate-600">Growth Areas Spotted</div>
          </div>
        </div>
      </div>

      {/* Visual Progress - The "wow factor" that makes it feel different */}
      <SimpleProgressVisual
        emotionalTriggers={insightsProfile.emotionalTriggers}
        progressBlindSpots={insightsProfile.progressBlindSpots}
      />

      {/* Upcoming Predictions Section - This is what differentiates from competitors */}
      {upcomingPredictions.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              Pattern Predictions
            </h2>
            <span className="text-sm text-slate-500">
              Based on your conversation patterns
            </span>
          </div>
          <div className="space-y-3">
            {upcomingPredictions.slice(0, 3).map((trigger, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900">{trigger.trigger}</p>
                  <p className="text-sm text-slate-600">
                    {trigger.nextPrediction!.likelihood}% likely {trigger.nextPrediction!.timeframe}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-emerald-600">
                    {trigger.nextPrediction!.preventionOpportunity}% preventable
                  </div>
                  <div className="text-xs text-slate-500">
                    {trigger.nextPrediction!.earlyWarningMinutes}min warning
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Actionable Insights - Enhanced with predictive context */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          Personalized Actions
        </h2>
        {actionableInsights.map((insight) => (
          <ActionableInsightCard
            key={insight.id}
            insight={insight}
            onComplete={(id, rating, notes) => {
              console.log("Insight completed:", { id, rating, notes });
              // This feedback feeds back into the learning system
            }}
          />
        ))}
      </div>

      {/* Hidden Strengths - From progress blind spots */}
      {insightsProfile.progressBlindSpots.length > 0 && (
        <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-6">
          <h2 className="text-lg font-semibold text-emerald-900 mb-4">
            Growth You Might Not See
          </h2>
          <div className="space-y-3">
            {insightsProfile.progressBlindSpots.slice(0, 2).map((blindspot, index) => (
              <div key={index} className="bg-white p-4 rounded-lg">
                <h3 className="font-medium text-emerald-800 mb-2">{blindspot.area}</h3>
                <p className="text-sm text-emerald-700 mb-2">{blindspot.aiGeneratedCelebration}</p>
                <div className="flex items-center justify-between text-xs text-emerald-600">
                  <span>Before: {blindspot.oldPattern}</span>
                  <span>→</span>
                  <span>Now: {blindspot.newPattern}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Simple hook to integrate predictive insights into existing pages
 * Usage: const { predictions, nudges } = usePredictiveInsights(userId);
 */
export const usePredictiveInsights = (userId: string) => {
  const [predictions, setPredictions] = useState<EmotionalTrigger[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // This would call your enhanced AI insight engine
    const loadPredictions = async () => {
      setLoading(true);
      try {
        // Call your enhanced AIInsightEngine.detectEmotionalTriggers
        // with the new predictive prompts
        const triggers = await fetch(`/api/insights/predictive/${userId}`)
          .then(res => res.json());
        setPredictions(triggers);
      } catch (error) {
        console.error("Failed to load predictions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPredictions();
  }, [userId]);

  const imminentPredictions = predictions.filter(
    p => p.nextPrediction && p.nextPrediction.likelihood > 70
  );

  return {
    predictions,
    imminentPredictions,
    loading,
  };
};