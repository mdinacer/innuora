import React, { useEffect, useState } from "react";
import { Bell, CheckCircle, Clock, Target, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DynamicNudge } from "@/domains/insights/adaptive-progression.types";

interface Props {
  nudges: DynamicNudge[];
  onDismissNudge: (nudgeId: string) => void;
  onActOnNudge: (nudgeId: string, actionId?: string) => void;
  onMarkAsRead: (nudgeId: string) => void;
}

const DynamicNudges: React.FC<Props> = ({ nudges, onDismissNudge, onActOnNudge, onMarkAsRead }) => {
  const [visibleNudges, setVisibleNudges] = useState<DynamicNudge[]>([]);

  useEffect(() => {
    // Show unread, non-expired, non-dismissed nudges
    const activeNudges = nudges.filter(
      (nudge) => !nudge.wasDismissed && !nudge.wasActedUpon && new Date() < new Date(nudge.expiresAt)
    );
    setVisibleNudges(activeNudges);

    // Mark as read after a brief delay
    activeNudges
      .filter((nudge) => !nudge.isRead)
      .forEach((nudge) => {
        setTimeout(() => onMarkAsRead(nudge.id), 2000);
      });
  }, [nudges, onMarkAsRead]);

  const getUrgencyColor = (urgency: "low" | "medium" | "high") => {
    switch (urgency) {
      case "high":
        return "border-red-200 bg-red-50";
      case "medium":
        return "border-amber-200 bg-amber-50";
      case "low":
        return "border-blue-200 bg-blue-50";
    }
  };

  const getUrgencyIcon = (urgency: "low" | "medium" | "high") => {
    switch (urgency) {
      case "high":
        return <Bell className="size-4 text-red-600" />;
      case "medium":
        return <Clock className="size-4 text-amber-600" />;
      case "low":
        return <Target className="size-4 text-blue-600" />;
    }
  };

  const handleDismiss = (nudgeId: string) => {
    setVisibleNudges((prev) => prev.filter((n) => n.id !== nudgeId));
    onDismissNudge(nudgeId);
  };

  const handleActOn = (nudge: DynamicNudge) => {
    setVisibleNudges((prev) => prev.filter((n) => n.id !== nudge.id));
    onActOnNudge(nudge.id, nudge.actionId);
  };

  if (visibleNudges.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
        <Bell className="size-4" />
        Gentle Nudges
      </h3>

      {visibleNudges.map((nudge) => (
        <Card
          key={nudge.id}
          className={`p-4 border-l-4 ${getUrgencyColor(nudge.urgency)} animate-in slide-in-from-left-5 duration-300`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getUrgencyIcon(nudge.urgency)}</div>

            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800 leading-relaxed">{nudge.message}</p>

              {/* Context hint */}
              <p className="text-xs text-slate-500 mt-1">
                {nudge.triggerCondition === "sunday_evening" && "Based on your Sunday evening pattern"}
                {nudge.triggerCondition === "family_topic_mentioned" && "Triggered by conversation content"}
                {nudge.triggerCondition === "perfectionism_spike" && "Detected perfectionist thoughts"}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {nudge.actionId && (
                <Button
                  size="sm"
                  onClick={() => handleActOn(nudge)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-1.5"
                >
                  <CheckCircle className="size-3 mr-1" />
                  Try This
                </Button>
              )}

              <button
                onClick={() => handleDismiss(nudge.id)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                title="Dismiss"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>

          {/* Time indicator */}
          <div className="flex justify-end mt-2">
            <span className="text-xs text-slate-400">
              Expires {new Date(nudge.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DynamicNudges;
