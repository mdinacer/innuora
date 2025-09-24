import React from "react";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";

import { EmotionalTrigger, ProgressBlindSpot } from "@/domains/insights/advanced-insights.types";

interface Props {
  emotionalTriggers: EmotionalTrigger[];
  progressBlindSpots: ProgressBlindSpot[];
}

export const SimpleProgressVisual: React.FC<Props> = ({ emotionalTriggers, progressBlindSpots }) => {
  // Get predictions that are happening soon (next 24 hours)
  const upcomingPredictions = emotionalTriggers.filter(
    (trigger) =>
      (trigger.nextPrediction &&
        trigger.nextPrediction.likelihood > 60 &&
        trigger.nextPrediction.timeframe.includes("today")) ||
      trigger.nextPrediction?.timeframe.includes("tomorrow") ||
      trigger.nextPrediction?.timeframe.includes("next few hours")
  );

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="size-5 text-emerald-600" />
          <h3 className="font-semibold text-emerald-900">Your Growth</h3>
        </div>
        <div className="space-y-2">
          {progressBlindSpots.slice(0, 2).map((blindspot, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800">{blindspot.area}</p>
                <p className="text-xs text-emerald-600">
                  {blindspot.improvementPercentage}% better {blindspot.timeframe}
                </p>
              </div>
              <div className="w-16 bg-emerald-200 rounded-full h-2">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, blindspot.improvementPercentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Patterns */}
      {upcomingPredictions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Upcoming Patterns</h3>
          </div>
          <div className="space-y-2">
            {upcomingPredictions.slice(0, 2).map((trigger, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">{trigger.trigger}</p>
                  <p className="text-xs text-amber-600">
                    {trigger.nextPrediction!.likelihood}% likely {trigger.nextPrediction!.timeframe}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-700">
                  <AlertTriangle className="size-3" />
                  {trigger.nextPrediction!.preventionOpportunity}% preventable
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simple Pattern Timeline */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h3 className="font-semibold text-slate-900 mb-3">Pattern Timeline</h3>
        <div className="space-y-1">
          {emotionalTriggers.slice(0, 3).map((trigger, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-700">{trigger.trigger}</span>
              <span className="text-slate-500 text-xs ml-auto">{trigger.occurrences} times</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
