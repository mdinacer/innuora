import React from "react";
import { ArrowRight, Brain, Zap } from "lucide-react";

import { Card } from "@/components/ui/card";
import { BehavioralWiring } from "@/domains/insights/advanced-insights.types";

interface Props {
  wiring: BehavioralWiring[];
}

const BehavioralWiringSection: React.FC<Props> = ({ wiring }) => {
  if (wiring.length === 0) {
    return (
      <Card className="p-6 text-center bg-slate-50">
        <p className="text-slate-600">
          Building understanding of your behavioral patterns. More insights coming as we gather data.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-slate-200">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="size-6 text-purple-600" />
          <h2 className="text-xl font-semibold text-slate-900">How Your Mind is Wired</h2>
        </div>
        <p className="text-slate-600 text-sm">Automatic patterns you might not realize you have</p>
      </div>

      <div className="space-y-5">
        {wiring.slice(0, 2).map((pattern, index) => (
          <div
            key={pattern.id}
            className="p-5 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200"
          >
            {/* Unconscious indicator */}
            {pattern.unconsciousIndicator && (
              <div className="flex items-center gap-2 mb-3">
                <Zap className="size-4 text-amber-600" />
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded">
                  Likely unconscious pattern
                </span>
              </div>
            )}

            {/* Pattern flow visualization */}
            <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg border border-slate-200">
              <div className="text-center flex-1">
                <div className="text-xs font-medium text-slate-500 uppercase mb-1">Belief</div>
                <div className="font-medium text-slate-800">"{pattern.coreBeliefTrigger}"</div>
              </div>

              <ArrowRight className="size-5 text-slate-400 mx-3" />

              <div className="text-center flex-1">
                <div className="text-xs font-medium text-slate-500 uppercase mb-1">Automatic Response</div>
                <div className="font-medium text-slate-800">{pattern.automaticBehavior}</div>
              </div>
            </div>

            {/* Insight explanation */}
            <div className="mb-4">
              <p className="text-slate-700 leading-relaxed">{pattern.insight}</p>
            </div>

            {/* Statistics */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-slate-600">
                  <strong>{pattern.frequency}%</strong> of the time
                </span>
                <span className="text-slate-600">
                  <strong>{pattern.confidence}%</strong> confidence
                </span>
              </div>
              <span className="text-slate-500">Seen in {pattern.sessions.length} sessions</span>
            </div>
          </div>
        ))}
      </div>

      {wiring.length > 2 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Explore {wiring.length - 2} more patterns →
          </button>
        </div>
      )}

      <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
        <p className="text-sm text-purple-800">
          <strong>The power of awareness:</strong> Once you see these automatic patterns, you can choose to respond
          differently. Your brain is incredibly adaptable.
        </p>
      </div>
    </Card>
  );
};

export default BehavioralWiringSection;
