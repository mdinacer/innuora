import React from "react";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmotionalTrigger } from "@/domains/insights/advanced-insights.types";

interface Props {
  triggers: EmotionalTrigger[];
}

const EmotionalTriggersSection: React.FC<Props> = ({ triggers }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-emerald-600 bg-emerald-50";
    if (confidence >= 60) return "text-amber-600 bg-amber-50";
    return "text-slate-600 bg-slate-50";
  };

  const getTriggerIcon = (response: string) => {
    switch (response) {
      case "intensity_spike":
        return <TrendingUp className="size-4 text-red-500" />;
      case "crisis_elevation":
        return <AlertTriangle className="size-4 text-orange-500" />;
      case "avoidance_behavior":
        return <Clock className="size-4 text-blue-500" />;
      default:
        return <AlertTriangle className="size-4 text-slate-500" />;
    }
  };

  const getResponseLabel = (response: string) => {
    switch (response) {
      case "intensity_spike":
        return "Emotional intensity rises";
      case "crisis_elevation":
        return "Stress level increases";
      case "avoidance_behavior":
        return "Triggers avoidance";
      default:
        return "Emotional response";
    }
  };

  if (triggers.length === 0) {
    return (
      <Card className="p-6 text-center bg-slate-50">
        <p className="text-slate-600">
          Not enough data yet to identify emotional triggers. Keep having conversations to unlock these insights.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-slate-200">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Your Hidden Emotional Triggers</h2>
        <p className="text-slate-600 text-sm">Patterns you might not have noticed consciously</p>
      </div>

      <div className="space-y-4">
        {triggers.slice(0, 3).map((trigger, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getTriggerIcon(trigger.emotionalResponse)}
                <div>
                  <h3 className="font-medium text-slate-900">When you mention "{trigger.trigger}"</h3>
                  <p className="text-sm text-slate-600">
                    {getResponseLabel(trigger.emotionalResponse)} within {trigger.averageDelay} messages
                  </p>
                </div>
              </div>

              <div className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(trigger.confidence)}`}>
                {trigger.confidence}% confident
              </div>
            </div>

            <div className="mb-3">
              <p className="text-sm text-slate-700 italic leading-relaxed">"{trigger.context}"</p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Observed {trigger.occurrences} times</span>
              <span>Last seen {new Date(trigger.lastSeen).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {triggers.length > 3 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            View {triggers.length - 3} more triggers →
          </button>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>What this means:</strong> These are unconscious emotional patterns your mind creates. Being aware of
          them gives you more choice in how you respond.
        </p>
      </div>
    </Card>
  );
};

export default EmotionalTriggersSection;
