import React from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";

interface ProgressMetric {
  label: string;
  current: string | number;
  change: number;
  direction: "up" | "down" | "stable";
  isImprovement: boolean;
}

interface Props {
  timeframe: string;
  metrics: ProgressMetric[];
}

const ProgressOverview: React.FC<Props> = ({ timeframe, metrics }) => {
  const getTrendIcon = (direction: "up" | "down" | "stable", isImprovement: boolean) => {
    if (direction === "stable") {
      return <Minus className="size-4 text-slate-500" />;
    }

    const isPositiveTrend = (direction === "up" && isImprovement) || (direction === "down" && !isImprovement);

    if (direction === "up") {
      return <TrendingUp className={`size-4 ${isPositiveTrend ? "text-emerald-600" : "text-slate-500"}`} />;
    }

    return <TrendingDown className={`size-4 ${isPositiveTrend ? "text-emerald-600" : "text-slate-500"}`} />;
  };

  const getChangeColor = (direction: "up" | "down" | "stable", isImprovement: boolean) => {
    if (direction === "stable") return "text-slate-600";

    const isPositiveTrend = (direction === "up" && isImprovement) || (direction === "down" && !isImprovement);
    return isPositiveTrend ? "text-emerald-700" : "text-slate-600";
  };

  return (
    <Card className="p-6 bg-white border-slate-200">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-1">Your Emotional Clarity</h2>
        <p className="text-slate-600 text-sm">{timeframe}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
            <div className="flex-1">
              <h3 className="font-medium text-slate-900 mb-1">{metric.label}</h3>
              <div className="flex items-center gap-2">
                {getTrendIcon(metric.direction, metric.isImprovement)}
                <span className={`text-sm font-medium ${getChangeColor(metric.direction, metric.isImprovement)}`}>
                  {metric.direction !== "stable" && (
                    <>
                      {Math.abs(metric.change)}% {metric.direction === "up" ? "increase" : "decrease"}
                    </>
                  )}
                  {metric.direction === "stable" && "Stable"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-slate-900">{metric.current}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProgressOverview;
