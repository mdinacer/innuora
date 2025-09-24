import React, { useState } from "react";
import { Check, ChevronDown, ChevronRight, Clock, Star, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActionableInsight } from "@/domains/insights/actionable-insights.types";

interface Props {
  insight: ActionableInsight;
  onComplete: (insightId: string, rating?: number, notes?: string) => void;
  onUpdateProgress?: (insightId: string, progress: Partial<ActionableInsight>) => void;
}

const ActionableInsightCard: React.FC<Props> = ({ insight, onComplete, onUpdateProgress }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionRating, setCompletionRating] = useState<number>(0);
  const [completionNotes, setCompletionNotes] = useState<string>("");

  const getActionTypeIcon = () => {
    switch (insight.actionType) {
      case "exercise":
        return <Target className="size-4" />;
      case "awareness_practice":
        return <Star className="size-4" />;
      case "behavioral_experiment":
        return <Target className="size-4" />;
      case "reflection":
        return <Star className="size-4" />;
      default:
        return <Clock className="size-4" />;
    }
  };

  const getActionTypeColor = () => {
    switch (insight.actionType) {
      case "exercise":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "awareness_practice":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "behavioral_experiment":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "reflection":
        return "text-amber-600 bg-amber-50 border-amber-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
    }
  };

  const getDifficultyColor = () => {
    switch (insight.difficulty) {
      case "beginner":
        return "text-emerald-700 bg-emerald-100";
      case "intermediate":
        return "text-amber-700 bg-amber-100";
      case "advanced":
        return "text-red-700 bg-red-100";
      default:
        return "text-slate-700 bg-slate-100";
    }
  };

  const handleComplete = () => {
    if (completionRating === 0) {
      setIsCompleting(true);
      return;
    }

    onComplete(insight.id, completionRating, completionNotes);
    setIsCompleting(false);
  };

  const handleRatingClick = (rating: number) => {
    setCompletionRating(rating);
  };

  if (insight.isCompleted) {
    return (
      <Card className="p-4 bg-emerald-50 border-emerald-200">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="size-8 rounded-full bg-emerald-600 flex items-center justify-center">
              <Check className="size-4 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">{insight.title}</h3>
            <p className="text-slate-600 text-sm mb-2">{insight.description}</p>
            {insight.effectivenessRating && (
              <div className="flex items-center gap-1 text-sm text-emerald-700">
                <Star className="size-3 fill-current" />
                <span>You rated this {insight.effectivenessRating}/10 effective</span>
              </div>
            )}
            {insight.userNotes && <p className="text-slate-600 text-sm mt-2 italic">"{insight.userNotes}"</p>}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 bg-white border-slate-200 hover:border-slate-300 transition-colors">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getActionTypeColor()}`}
              >
                {getActionTypeIcon()}
                <span className="capitalize">{insight.actionType.replace("_", " ")}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor()}`}>
                {insight.difficulty}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="size-3" />
                {insight.timeCommitment}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{insight.title}</h3>
            <p className="text-slate-600">{insight.description}</p>
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className="flex-shrink-0 p-1 hover:bg-slate-100 rounded">
            {isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
        </div>

        {/* Quick Summary - Always Visible */}
        <div className="bg-slate-50 p-3 rounded-lg">
          <p className="text-sm text-slate-700 font-medium mb-1">Why this helps:</p>
          <p className="text-sm text-slate-600">{insight.rationale}</p>
        </div>

        {/* Quick Preview of First Step - Always Visible */}
        <div className="bg-blue-50 border-l-3 border-blue-400 p-3 rounded-r-lg">
          <p className="text-sm text-blue-800 font-medium mb-1">Start here:</p>
          <p className="text-sm text-blue-700">{insight.instructions[0]?.instruction}</p>
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
            >
              See full instructions →
            </button>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            {/* Instructions */}
            <div>
              <h4 className="font-medium text-slate-900 mb-3">How to do this:</h4>
              <div className="space-y-3">
                {insight.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="size-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-700">
                        {instruction.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-800 mb-1">{instruction.instruction}</p>
                      {instruction.example && (
                        <p className="text-xs text-slate-600 italic">Example: {instruction.example}</p>
                      )}
                      {instruction.tip && <p className="text-xs text-purple-600 mt-1">💡 {instruction.tip}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected outcome */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">What to expect:</p>
              <p className="text-sm text-blue-700">{insight.expectedOutcome}</p>
            </div>

            {/* Tracking metrics */}
            {insight.trackingMetrics && insight.trackingMetrics.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-900 mb-2">Keep track of:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {insight.trackingMetrics.map((metric, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-slate-400 mt-1">•</span>
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Burns reference */}
            {insight.burnsReference && (
              <div className="text-xs text-slate-500 border-l-2 border-slate-200 pl-3">
                <span className="font-medium">David Burns reference:</span> {insight.burnsReference}
              </div>
            )}
          </div>
        )}

        {/* Completion section */}
        {isCompleting ? (
          <div className="bg-slate-50 p-4 rounded-lg space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-900 mb-3">How effective was this for you?</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingClick(rating)}
                    className={`size-8 rounded text-xs font-medium transition-colors ${
                      completionRating >= rating
                        ? "bg-amber-400 text-white"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">1 = not helpful, 10 = very helpful</p>
            </div>

            <div>
              <label htmlFor="notes" className="text-sm font-medium text-slate-900 block mb-2">
                Any thoughts or observations? (optional)
              </label>
              <textarea
                id="notes"
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="What did you notice? How did it feel?"
                className="w-full p-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleComplete} disabled={completionRating === 0} className="flex-1">
                Mark Complete
              </Button>
              <Button variant="outline" onClick={() => setIsCompleting(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <Button onClick={() => setIsCompleting(true)} className="bg-slate-900 hover:bg-slate-800">
              I tried this
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ActionableInsightCard;
