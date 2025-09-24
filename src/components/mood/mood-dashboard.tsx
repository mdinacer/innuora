"use client";

import React, { useEffect, useState } from "react";
import { eachDayOfInterval, format, subDays } from "date-fns";
import { Calendar, Heart, Target, TrendingDown, TrendingUp, Zap } from "lucide-react";

import { getMoodStats, getMoodTrends, getUserMoodEntries, MoodEntryWithSession } from "@/app/actions/mood-actions";
import { Button } from "@/components/ui/button";
import { EMOTION_OPTIONS, EmotionCategory, MoodTrend } from "@/domains/mood-tracking/mood-tracking.types";
import { cn } from "@/lib/utils";

interface MoodDashboardProps {
  className?: string;
  onStartCheckIn?: () => void;
}

interface MoodStats {
  totalEntries: number;
  currentStreak: number;
  entriesLast7Days: number;
  averageMoodLast7Days: number;
  lastEntryDate: Date | null;
}

// MoodEntryWithSession is now imported from mood-actions

export function MoodDashboard({ className, onStartCheckIn }: MoodDashboardProps) {
  const [trends, setTrends] = useState<MoodTrend | null>(null);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [recentEntries, setRecentEntries] = useState<MoodEntryWithSession[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "3months">("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [trendsData, statsData, entriesData] = await Promise.all([
        getMoodTrends(selectedPeriod),
        getMoodStats(),
        getUserMoodEntries(7), // Last 7 entries
      ]);

      setTrends(trendsData);
      setStats(statsData);
      setRecentEntries(entriesData);
    } catch (error) {
      console.error("Failed to load mood data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats || stats.totalEntries === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <Heart className="h-16 w-16 text-inn-bg-accent mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-inn-text-primary mb-2">Start tracking your mood</h3>
        <p className="text-inn-text-secondary mb-6 max-w-md mx-auto">
          Regular mood tracking helps you understand patterns, identify triggers, and celebrate progress in your
          emotional journey.
        </p>
        <Button onClick={onStartCheckIn} className="bg-inn-bg-accent hover:bg-inn-bg-accent-dark text-white">
          <Heart className="mr-2 h-4 w-4" />
          Start First Check-in
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<Target className="h-5 w-5" />}
          title="Current Streak"
          value={`${stats.currentStreak} days`}
          subtitle="Consecutive tracking"
          color="text-green-600"
        />
        <StatCard
          icon={<Zap className="h-5 w-5" />}
          title="Recent Average"
          value={stats.averageMoodLast7Days.toFixed(1)}
          subtitle="Last 7 days"
          color={getMoodColor(stats.averageMoodLast7Days)}
        />
        <StatCard
          icon={<Calendar className="h-5 w-5" />}
          title="Total Entries"
          value={stats.totalEntries.toString()}
          subtitle="All time"
          color="text-inn-bg-accent"
        />
      </div>

      {/* Period Selection */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-inn-text-primary">Mood Trends</h3>
        <div className="flex rounded-lg border border-gray-200">
          {(["week", "month", "3months"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-lg transition-colors",
                selectedPeriod === period
                  ? "bg-inn-bg-accent text-white"
                  : "text-inn-text-secondary hover:text-inn-text-primary"
              )}
            >
              {period === "3months" ? "3 Months" : period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Trends Overview */}
      {trends && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average & Improvement */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={cn("text-2xl font-bold", getMoodColor(trends.averageMood))}>
                  {trends.averageMood}/10
                </div>
                <div className="flex items-center gap-1">
                  {trends.improvement > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : trends.improvement < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : null}
                  <span
                    className={cn(
                      "text-sm font-medium",
                      trends.improvement > 0
                        ? "text-green-600"
                        : trends.improvement < 0
                          ? "text-red-600"
                          : "text-gray-500"
                    )}
                  >
                    {trends.improvement > 0 && "+"}
                    {trends.improvement.toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-inn-text-secondary">Average mood for the last {trends.period}</p>
            </div>

            {/* Most Common Emotions */}
            <div>
              <h4 className="text-sm font-medium text-inn-text-primary mb-3">Most Common Emotions</h4>
              <div className="flex gap-2">
                {trends.mostCommonEmotions.slice(0, 3).map((emotionId) => {
                  const emotion = EMOTION_OPTIONS.find((e) => e.id === emotionId);
                  return emotion ? (
                    <div
                      key={emotion.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                      style={{ backgroundColor: emotion.color + "20", color: emotion.color }}
                    >
                      <span>{emotion.emoji}</span>
                      <span className="font-medium">{emotion.label}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          {/* Insights */}
          {trends.insights.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-medium text-inn-text-primary mb-2">Insights</h4>
              <ul className="space-y-1">
                {trends.insights.map((insight, index) => (
                  <li key={index} className="text-sm text-inn-text-secondary flex items-start gap-2">
                    <span className="text-inn-bg-accent mt-1">•</span>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h4 className="text-sm font-medium text-inn-text-primary mb-4">Recent Check-ins</h4>
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white",
                      getMoodBackground(entry.moodValue)
                    )}
                  >
                    {entry.moodValue}
                  </div>
                  <div>
                    <div className="text-sm text-inn-text-primary">
                      {format(new Date(entry.createdAt), "MMM d, h:mm a")}
                    </div>
                    {entry.emotions.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {entry.emotions.slice(0, 3).map((emotionId) => {
                          const emotion = EMOTION_OPTIONS.find((e) => e.id === emotionId);
                          return emotion ? (
                            <span key={emotion.id} className="text-xs">
                              {emotion.emoji}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>
                {entry.session && <div className="text-xs text-inn-text-secondary">After session</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check-in CTA */}
      <div className="text-center">
        <Button onClick={onStartCheckIn} className="bg-inn-bg-accent hover:bg-inn-bg-accent-dark text-white">
          <Heart className="mr-2 h-4 w-4" />
          New Mood Check-in
        </Button>
      </div>
    </div>
  );
}

// Helper components and functions
function StatCard({
  icon,
  title,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("", color)}>{icon}</div>
        <span className="text-sm font-medium text-inn-text-secondary">{title}</span>
      </div>
      <div className={cn("text-xl font-bold", color)}>{value}</div>
      <div className="text-xs text-inn-text-secondary">{subtitle}</div>
    </div>
  );
}

function getMoodColor(value: number) {
  if (value <= 3) return "text-red-500";
  if (value <= 5) return "text-yellow-500";
  if (value <= 7) return "text-blue-500";
  return "text-green-500";
}

function getMoodBackground(value: number) {
  if (value <= 3) return "bg-red-500";
  if (value <= 5) return "bg-yellow-500";
  if (value <= 7) return "bg-blue-500";
  return "bg-green-500";
}
