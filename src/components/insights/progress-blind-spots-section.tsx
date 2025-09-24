import React from "react";
import { Eye, Sparkles, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ProgressBlindSpot } from "@/domains/insights/advanced-insights.types";

interface Props {
  blindSpots: ProgressBlindSpot[];
}

const ProgressBlindSpotsSection: React.FC<Props> = ({ blindSpots }) => {
  const getAwarenessColor = (awareness: string) => {
    switch (awareness) {
      case "unaware":
        return "text-emerald-700 bg-emerald-100";
      case "somewhat_aware":
        return "text-blue-700 bg-blue-100";
      case "aware":
        return "text-slate-700 bg-slate-100";
      default:
        return "text-slate-700 bg-slate-100";
    }
  };

  if (blindSpots.length === 0) {
    return (
      <Card className="p-6 text-center bg-slate-50">
        <p className="text-slate-600">
          Need more time to track your progress patterns. Check back in a few weeks for growth insights.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-slate-200">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Eye className="size-6 text-emerald-600" />
          <h2 className="text-xl font-semibold text-slate-900">Growth You Might Not See</h2>
        </div>
        <p className="text-slate-600 text-sm">Progress that's happening behind the scenes</p>
      </div>

      <div className="space-y-5">
        {blindSpots.map((spot, index) => (
          <div
            key={index}
            className="p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 relative overflow-hidden"
          >
            {/* Sparkle decoration for celebration */}
            <Sparkles className="absolute top-3 right-3 size-5 text-emerald-400" />

            {/* Awareness level indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-xs font-medium px-2 py-1 rounded ${getAwarenessColor(spot.userAwareness)}`}>
                {spot.userAwareness === "unaware"
                  ? "Hidden growth"
                  : spot.userAwareness === "somewhat_aware"
                    ? "Subtle progress"
                    : "Conscious development"}
              </span>
              <span className="text-xs text-slate-500">{spot.timeframe}</span>
            </div>

            {/* Progress comparison */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-xs font-medium text-slate-500 uppercase">Before</div>
                <div className="flex-1 h-px bg-slate-300"></div>
              </div>
              <p className="text-slate-700 mb-3 pl-2 border-l-2 border-slate-300">{spot.oldPattern}</p>

              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="size-4 text-emerald-600" />
                <div className="text-xs font-medium text-emerald-700 uppercase">Now</div>
                <div className="flex-1 h-px bg-emerald-300"></div>
              </div>
              <p className="text-slate-700 pl-2 border-l-2 border-emerald-400">{spot.newPattern}</p>
            </div>

            {/* AI-generated celebration */}
            <div className="mb-4 p-3 bg-white/70 rounded-lg">
              <p className="text-slate-800 font-medium leading-relaxed">{spot.aiGeneratedCelebration}</p>
            </div>

            {/* Improvement percentage */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">
                <strong>{spot.area}</strong>
              </span>
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-700">{spot.improvementPercentage}%</div>
                <div className="text-xs text-slate-500">improvement</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
        <p className="text-sm text-emerald-800">
          <strong>You're growing more than you know:</strong> Sometimes the most meaningful changes happen gradually,
          making them hard to notice day-to-day. These insights celebrate your progress.
        </p>
      </div>
    </Card>
  );
};

export default ProgressBlindSpotsSection;
