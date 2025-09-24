import React, { useState, useEffect } from "react";
import { AlertTriangle, X, Clock, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmotionalTrigger } from "@/domains/insights/advanced-insights.types";

interface Props {
  triggers: EmotionalTrigger[];
  onDismiss: (triggerId: string) => void;
  onTakeAction: (triggerId: string, action: string) => void;
}

export const SimplePredictiveNudge: React.FC<Props> = ({ triggers, onDismiss, onTakeAction }) => {
  const [visibleNudges, setVisibleNudges] = useState<string[]>([]);

  // Check for imminent predictions every minute
  useEffect(() => {
    const checkPredictions = () => {
      const now = new Date();
      const imminentTriggers = triggers.filter(trigger => {
        if (!trigger.nextPrediction) return false;

        // Simple check for imminent patterns (would be more sophisticated in real implementation)
        const isImminent =
          trigger.nextPrediction.timeframe.includes("now") ||
          trigger.nextPrediction.timeframe.includes("next few minutes") ||
          trigger.nextPrediction.timeframe.includes("about to") ||
          (trigger.nextPrediction.likelihood > 80 && trigger.nextPrediction.earlyWarningMinutes <= 60);

        return isImminent && !visibleNudges.includes(trigger.trigger);
      });

      // Show nudges for imminent triggers
      imminentTriggers.forEach(trigger => {
        setVisibleNudges(prev => [...prev, trigger.trigger]);
      });
    };

    const interval = setInterval(checkPredictions, 60000); // Check every minute
    checkPredictions(); // Check immediately

    return () => clearInterval(interval);
  }, [triggers, visibleNudges]);

  const getImminentTriggers = () => {
    return triggers.filter(trigger =>
      visibleNudges.includes(trigger.trigger) && trigger.nextPrediction
    );
  };

  const handleDismiss = (triggerId: string) => {
    setVisibleNudges(prev => prev.filter(id => id !== triggerId));
    onDismiss(triggerId);
  };

  const handleTakeAction = (triggerId: string, action: string) => {
    onTakeAction(triggerId, action);
    // Keep nudge visible but mark as acted upon
  };

  const imminentTriggers = getImminentTriggers();

  if (imminentTriggers.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {imminentTriggers.map((trigger) => (
        <div
          key={trigger.trigger}
          className="bg-amber-50 border border-amber-300 rounded-lg p-4 shadow-lg animate-in slide-in-from-right"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-amber-600" />
              <h4 className="font-medium text-amber-900 text-sm">Pattern Alert</h4>
            </div>
            <button
              onClick={() => handleDismiss(trigger.trigger)}
              className="text-amber-600 hover:text-amber-800"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-amber-800 font-medium">
                Your "{trigger.trigger}" pattern may be starting
              </p>
              <div className="flex items-center gap-4 mt-1 text-xs text-amber-700">
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  <span>{trigger.nextPrediction!.timeframe}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{trigger.nextPrediction!.likelihood}% likely</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-100 p-2 rounded text-xs text-amber-800">
              <div className="flex items-center gap-1 mb-1">
                <Lightbulb className="size-3" />
                <span className="font-medium">Quick intervention:</span>
              </div>
              <p>Take 3 deep breaths and notice: "What am I feeling right now?"</p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => handleTakeAction(trigger.trigger, "awareness_pause")}
              >
                Try This
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-amber-300 text-amber-600"
                onClick={() => handleDismiss(trigger.trigger)}
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook for easy integration
export const usePredictiveNudges = (triggers: EmotionalTrigger[]) => {
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());

  const handleDismiss = (triggerId: string) => {
    setDismissedNudges(prev => new Set([...prev, triggerId]));
    // Could store in localStorage or send to backend
  };

  const handleTakeAction = (triggerId: string, action: string) => {
    // Log user action for learning
    console.log(`User took action ${action} for trigger ${triggerId}`);
    // Could send to analytics or backend for learning
  };

  const activeTriggers = triggers.filter(trigger =>
    !dismissedNudges.has(trigger.trigger)
  );

  return {
    activeTriggers,
    handleDismiss,
    handleTakeAction,
  };
};