"use client";

import React, { useState } from "react";
import { Brain, Heart, TrendingUp } from "lucide-react";

import { createMoodEntry } from "@/app/actions/mood-actions";
import { MoodCheckIn, MoodCheckInData } from "@/components/mood/mood-check-in";
import { MoodDashboard } from "@/components/mood/mood-dashboard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdvancedInsightsProfile } from "@/domains/insights/advanced-insights.types";
import { cn } from "@/lib/utils";
import AdvancedInsightsDashboard from "./advanced-insights-dashboard";

interface IntegratedInsightsPageProps {
  insights: AdvancedInsightsProfile;
  className?: string;
}

export default function IntegratedInsightsPage({ insights, className }: IntegratedInsightsPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
  const [isSubmittingMood, setIsSubmittingMood] = useState(false);

  const handleMoodCheckInComplete = async (data: MoodCheckInData) => {
    try {
      setIsSubmittingMood(true);
      await createMoodEntry(data);
      setShowMoodCheckIn(false);
      // Optionally refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error("Failed to save mood entry:", error);
      // You could show a toast notification here
    } finally {
      setIsSubmittingMood(false);
    }
  };

  if (showMoodCheckIn) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <MoodCheckIn
          onComplete={handleMoodCheckInComplete}
          onCancel={() => setShowMoodCheckIn(false)}
          className="max-w-lg"
        />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-slate-50", className)}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-inn-text-primary mb-2">Your Insights</h1>
              <p className="text-inn-text-secondary">
                Discover patterns in your emotional journey and therapeutic progress
              </p>
            </div>
            <Button
              onClick={() => setShowMoodCheckIn(true)}
              className="bg-inn-bg-accent hover:bg-inn-bg-accent-dark text-white"
            >
              <Heart className="mr-2 h-4 w-4" />
              Mood Check-in
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 sr-only sm:not-sr-only" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="mood" className="flex items-center gap-2">
              <Heart className="h-4 w-4 sr-only sm:not-sr-only" />
              Mood Tracking
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Brain className="h-4 w-4 sr-only sm:not-sr-only" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mood Overview Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-inn-text-primary">Recent Mood Trends</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("mood")}>
                    View Details
                  </Button>
                </div>
                <div className="space-y-4">
                  <MoodDashboard onStartCheckIn={() => setShowMoodCheckIn(true)} />
                </div>
              </div>

              {/* AI Insights Preview Card */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-inn-text-primary">AI Pattern Recognition</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("patterns")}>
                    Explore Patterns
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="text-sm text-inn-text-secondary">
                    <p className="mb-3">Latest insights from your conversations:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-inn-bg-accent mt-1">•</span>
                        <span>
                          <strong>Emotional Trigger Detected:</strong> Sunday evenings consistently trigger anticipatory
                          stress
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-inn-bg-accent mt-1">•</span>
                        <span>
                          <strong>Recovery Pattern:</strong> Values-based reflection helps you recover from overwhelm
                          84% faster
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-inn-bg-accent mt-1">•</span>
                        <span>
                          <strong>Hidden Progress:</strong> Self-compassion has improved 75% over 3 months
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-inn-text-primary mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => setShowMoodCheckIn(true)}
                  className="bg-inn-bg-accent hover:bg-inn-bg-accent-dark text-white"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Log Current Mood
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("patterns")}>
                  <Brain className="mr-2 h-4 w-4" />
                  Review AI Insights
                </Button>
                <Button variant="outline" onClick={() => setActiveTab("mood")}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Mood Trends
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Mood Tracking Tab */}
          <TabsContent value="mood">
            <MoodDashboard
              onStartCheckIn={() => setShowMoodCheckIn(true)}
              className="bg-white rounded-lg p-6 shadow-sm border"
            />
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="patterns">
            <AdvancedInsightsDashboard insights={insights} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
