"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Heart, TrendingUp } from "lucide-react";

import { getUserMoodEntries, MoodEntryWithSession } from "@/app/actions/mood-actions";
import { Session } from "@/domains/open-chat/open-chat.types";
import { cn } from "@/lib/utils";

interface Props {
  session: Session;
  className?: string;
}

const SessionDetailsMood: React.FC<Props> = ({ session, className }) => {
  const [sessionMood, setSessionMood] = useState<MoodEntryWithSession | null>(null);
  const [recentMoods, setRecentMoods] = useState<MoodEntryWithSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMoodData = async () => {
      if (!session.userId) {
        setLoading(false);
        return;
      }

      try {
        // Get recent mood entries to find session-linked mood and context
        const moods = await getUserMoodEntries(session.userId, { limit: 20, sortBy: "recent" });

        // Find mood entry linked to this specific session
        const linkedMood = moods.find((mood) => mood.sessionId === session.id);

        // Get moods around the session time for context
        const sessionTime = session.createdAt?.getTime() || Date.now();
        const dayBefore = sessionTime - 24 * 60 * 60 * 1000;
        const dayAfter = sessionTime + 24 * 60 * 60 * 1000;

        const contextualMoods = moods.filter((mood) => {
          const moodTime = mood.createdAt.getTime();
          return moodTime >= dayBefore && moodTime <= dayAfter;
        });

        setSessionMood(linkedMood || null);
        setRecentMoods(contextualMoods);
      } catch (error) {
        console.error("Failed to fetch mood data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMoodData();
  }, [session.id, session.userId, session.createdAt]);

  if (loading) {
    return (
      <div className={cn("bg-inn-bg-card rounded-xl border border-inn-border-light p-6", className)}>
        <div className="flex items-center gap-3 mb-4">
          <Heart className="size-5 text-inn-bg-accent" />
          <h3 className="text-lg font-semibold text-inn-text-primary">Mood Context</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-inn-bg-input rounded w-3/4"></div>
          <div className="h-4 bg-inn-bg-input rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!session.userId) {
    return null; // Don't show mood section for guest sessions
  }

  const getMoodColor = (value: number) => {
    if (value >= 8) return "text-green-600";
    if (value >= 6) return "text-green-500";
    if (value >= 5) return "text-yellow-500";
    if (value >= 3) return "text-orange-500";
    return "text-red-500";
  };

  const getMoodLabel = (value: number) => {
    if (value >= 8) return "Great";
    if (value >= 7) return "Good";
    if (value >= 6) return "Decent";
    if (value >= 5) return "Neutral";
    if (value >= 4) return "Challenging";
    if (value >= 3) return "Difficult";
    return "Very Difficult";
  };

  const formatEmotions = (emotions: string[]) => {
    return emotions.map((e) => e.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())).join(", ");
  };

  return (
    <div className={cn("bg-inn-bg-card rounded-xl border border-inn-border-light p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Heart className="size-5 text-inn-bg-accent" />
          <h3 className="text-lg font-semibold text-inn-text-primary">Mood Context</h3>
        </div>
      </div>

      <div className="space-y-4">
        {sessionMood ? (
          /* Session-specific mood */
          <div className="bg-inn-bg-subtle rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-inn-text-secondary">Post-Session Mood</span>
              <span className={cn("text-lg font-semibold", getMoodColor(sessionMood.moodValue))}>
                {sessionMood.moodValue}/10
              </span>
            </div>

            <div className="mb-2">
              <span className={cn("text-sm font-medium", getMoodColor(sessionMood.moodValue))}>
                {getMoodLabel(sessionMood.moodValue)}
              </span>
            </div>

            {sessionMood.emotions && sessionMood.emotions.length > 0 && (
              <div className="mb-2">
                <span className="text-xs text-inn-text-secondary">Emotions: </span>
                <span className="text-sm text-inn-text-primary">{formatEmotions(sessionMood.emotions)}</span>
              </div>
            )}

            {sessionMood.notes && (
              <div className="mt-3">
                <p className="text-sm text-inn-text-primary italic">"{sessionMood.notes}"</p>
              </div>
            )}

            <div className="mt-2 text-xs text-inn-text-secondary">
              Logged {format(sessionMood.createdAt, "MMM d, h:mm a")}
            </div>
          </div>
        ) : /* No session mood, show context from around that time */
        recentMoods.length > 0 ? (
          <div className="bg-inn-bg-subtle rounded-lg p-4">
            <div className="mb-3">
              <span className="text-sm font-medium text-inn-text-secondary">Mood Around This Time</span>
            </div>

            <div className="space-y-2">
              {recentMoods.slice(0, 3).map((mood) => (
                <div key={mood.id} className="flex items-center justify-between text-sm">
                  <span className="text-inn-text-primary">{format(mood.createdAt, "MMM d, h:mm a")}</span>
                  <div className="flex items-center gap-2">
                    {mood.emotions && mood.emotions.length > 0 && (
                      <span className="text-xs text-inn-text-secondary">
                        {formatEmotions(mood.emotions.slice(0, 2))}
                      </span>
                    )}
                    <span className={cn("font-medium", getMoodColor(mood.moodValue))}>{mood.moodValue}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-inn-bg-subtle rounded-lg p-4 text-center">
            <Heart className="size-8 text-inn-text-secondary mx-auto mb-2" />
            <p className="text-sm text-inn-text-secondary">No mood data available for this session period</p>
          </div>
        )}

        {/* Mood trend insight */}
        {recentMoods.length >= 3 && (
          <div className="border-t border-inn-border-light pt-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="size-4 text-inn-bg-accent" />
              <span className="text-sm font-medium text-inn-text-primary">Mood Trend</span>
            </div>

            <div className="text-sm text-inn-text-secondary">
              {(() => {
                const avgMood = recentMoods.reduce((sum, m) => sum + m.moodValue, 0) / recentMoods.length;
                const roundedAvg = Math.round(avgMood * 10) / 10;
                return `Average around this session: ${roundedAvg}/10 (${getMoodLabel(Math.round(avgMood))})`;
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionDetailsMood;
