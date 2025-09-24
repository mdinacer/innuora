import React from "react";
import { Eye, Lightbulb, Target, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";

interface Insight {
  id: string;
  category: "progress" | "awareness" | "pattern" | "strength";
  title: string;
  description: string;
  metric?: {
    value: string;
    change: number;
    direction: "up" | "down";
  };
}

interface Props {
  insights: Insight[];
}

const PatternInsights: React.FC<Props> = ({ insights }) => {
  const getCategoryIcon = (category: string) => {
    const iconClass = "size-5 text-slate-600";

    switch (category) {
      case "progress":
        return <TrendingUp className={iconClass} />;
      case "awareness":
        return <Eye className={iconClass} />;
      case "pattern":
        return <Lightbulb className={iconClass} />;
      case "strength":
        return <Target className={iconClass} />;
      default:
        return <Lightbulb className={iconClass} />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "progress":
        return "Progress";
      case "awareness":
        return "Awareness";
      case "pattern":
        return "Pattern";
      case "strength":
        return "Strength";
      default:
        return "Insight";
    }
  };

  return (
    <Card className="p-6 bg-white border-slate-200">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">What We're Noticing</h2>
        <p className="text-slate-600 text-sm">Patterns in your emotional journey</p>
      </div>

      <div className="space-y-6">
        {insights.map((insight) => (
          <div key={insight.id} className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex-shrink-0 p-2 rounded-full bg-white">{getCategoryIcon(insight.category)}</div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {getCategoryLabel(insight.category)}
                    </span>
                  </div>

                  <h3 className="font-medium text-slate-900 mb-2">{insight.title}</h3>

                  <p className="text-slate-600 text-sm leading-relaxed">{insight.description}</p>
                </div>

                {insight.metric && (
                  <div className="flex-shrink-0 text-right">
                    <div className="text-lg font-semibold text-emerald-700">{insight.metric.value}</div>
                    <div className="text-xs text-slate-500">
                      {insight.metric.direction === "up" ? "improvement" : "reduction"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PatternInsights;
