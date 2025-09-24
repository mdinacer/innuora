import React, { useState } from "react";
import { CheckCircle2, Circle, Clock, Target, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActionableInsight } from "@/domains/insights/actionable-insights.types";
import ActionableInsightCard from "./actionable-insight-card";

interface Props {
  insights: ActionableInsight[];
  completedInsights: ActionableInsight[];
  onCompleteInsight: (insightId: string, rating?: number, notes?: string) => void;
  onUpdateProgress?: (insightId: string, progress: Partial<ActionableInsight>) => void;
}

const ActionableInsightsSection: React.FC<Props> = ({
  insights,
  completedInsights,
  onCompleteInsight,
  onUpdateProgress,
}) => {
  const [activeTab, setActiveTab] = useState<"todo" | "completed">("todo");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredInsights = insights.filter((insight) => {
    const difficultyMatch = selectedDifficulty === "all" || insight.difficulty === selectedDifficulty;
    const typeMatch = selectedType === "all" || insight.actionType === selectedType;
    return difficultyMatch && typeMatch;
  });

  const getProgressStats = () => {
    const total = insights.length + completedInsights.length;
    const completed = completedInsights.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const averageRating =
      completedInsights.length > 0
        ? Math.round(
            (completedInsights.reduce((sum, insight) => sum + (insight.effectivenessRating || 0), 0) /
              completedInsights.length) *
              10
          ) / 10
        : 0;

    return { total, completed, completionRate, averageRating };
  };

  const stats = getProgressStats();

  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case "exercise":
        return "Exercise";
      case "awareness_practice":
        return "Awareness";
      case "behavioral_experiment":
        return "Experiment";
      case "reflection":
        return "Reflection";
      case "educational_reading":
        return "Reading";
      default:
        return type;
    }
  };

  if (insights.length === 0 && completedInsights.length === 0) {
    return (
      <Card className="p-8 bg-white border-slate-200 text-center">
        <Target className="size-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Actions Generated Yet</h3>
        <p className="text-slate-600">Complete some sessions to receive personalized actionable insights</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Progress Stats */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Action Plan</h2>
          <p className="text-slate-600">Personalized steps to strengthen your emotional clarity</p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-slate-200">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-sm text-slate-600">Total Actions</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="size-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
                <p className="text-sm text-slate-600">Completed</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.completionRate}%</p>
                <p className="text-sm text-slate-600">Progress</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white border-slate-200">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="size-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.averageRating || "--"}</p>
                <p className="text-sm text-slate-600">Avg Rating</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("todo")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "todo" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Circle className="size-4" />
            To Try ({insights.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "completed" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            Completed ({completedInsights.length})
          </div>
        </button>
      </div>

      {/* Filters (only show for todo tab) */}
      {activeTab === "todo" && insights.length > 3 && (
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <label htmlFor="difficulty-select" className="text-sm font-medium text-slate-700">
              Difficulty:
            </label>
            <select
              id="difficulty-select"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="type-select" className="text-sm font-medium text-slate-700">
              Type:
            </label>
            <select
              id="type-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All types</option>
              <option value="awareness_practice">Awareness</option>
              <option value="exercise">Exercise</option>
              <option value="behavioral_experiment">Experiment</option>
              <option value="reflection">Reflection</option>
            </select>
          </div>
        </div>
      )}

      {/* Insights List */}
      <div className="space-y-4">
        {activeTab === "todo" && (
          <>
            {filteredInsights.length === 0 ? (
              <Card className="p-6 bg-white border-slate-200 text-center">
                <p className="text-slate-600">No actions match your current filters</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedDifficulty("all");
                    setSelectedType("all");
                  }}
                  className="mt-3"
                >
                  Clear filters
                </Button>
              </Card>
            ) : (
              filteredInsights.map((insight) => (
                <ActionableInsightCard
                  key={insight.id}
                  insight={insight}
                  onComplete={onCompleteInsight}
                  onUpdateProgress={onUpdateProgress}
                />
              ))
            )}
          </>
        )}

        {activeTab === "completed" && (
          <>
            {completedInsights.length === 0 ? (
              <Card className="p-6 bg-white border-slate-200 text-center">
                <CheckCircle2 className="size-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No completed actions yet. Try an action from your to-do list!</p>
              </Card>
            ) : (
              completedInsights.map((insight) => (
                <ActionableInsightCard
                  key={insight.id}
                  insight={insight}
                  onComplete={onCompleteInsight}
                  onUpdateProgress={onUpdateProgress}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActionableInsightsSection;
