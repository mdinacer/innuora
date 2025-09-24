"use client";

import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";

import { createMoodEntry } from "@/app/actions/mood-actions";
import { MoodCheckInData, QuickMoodCheckIn } from "./mood-check-in";

interface PostSessionMoodPromptProps {
  sessionId: string;
  onComplete?: () => void;
  onDismiss?: () => void;
}

export function PostSessionMoodPrompt({ sessionId, onComplete, onDismiss }: PostSessionMoodPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Show mood prompt 3 seconds after session ends
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleMoodComplete = async (data: MoodCheckInData) => {
    try {
      setIsSubmitting(true);
      await createMoodEntry({
        ...data,
        sessionId,
      });
      setIsVisible(false);
      onComplete?.();
    } catch (error) {
      console.error("Failed to save post-session mood:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
    // Remember dismissal for this session
    sessionStorage.setItem(`mood-prompt-dismissed-${sessionId}`, "true");
  };

  // Don't show if already dismissed for this session
  if (sessionStorage.getItem(`mood-prompt-dismissed-${sessionId}`)) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return <QuickMoodCheckIn onComplete={handleMoodComplete} onDismiss={handleDismiss} />;
}

// Hook for daily mood reminders
export function useDailyMoodReminder() {
  const [shouldShowReminder, setShouldShowReminder] = useState(false);

  useEffect(() => {
    const checkDailyReminder = () => {
      const lastMoodEntry = localStorage.getItem("lastMoodEntry");
      const today = new Date().toDateString();

      if (!lastMoodEntry || lastMoodEntry !== today) {
        // Show reminder if no mood entry today and it's afternoon/evening
        const hour = new Date().getHours();
        if (hour >= 14 && hour <= 21) {
          // 2 PM to 9 PM
          setShouldShowReminder(true);
        }
      }
    };

    checkDailyReminder();

    // Check every hour
    const interval = setInterval(checkDailyReminder, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const completeMoodEntry = () => {
    const today = new Date().toDateString();
    localStorage.setItem("lastMoodEntry", today);
    setShouldShowReminder(false);
  };

  const dismissReminder = () => {
    setShouldShowReminder(false);
    // Don't show again today
    const today = new Date().toDateString();
    localStorage.setItem(`moodReminderDismissed-${today}`, "true");
  };

  return {
    shouldShowReminder,
    completeMoodEntry,
    dismissReminder,
  };
}

// Floating daily mood reminder component
export function DailyMoodReminder() {
  const { shouldShowReminder, completeMoodEntry, dismissReminder } = useDailyMoodReminder();

  const handleMoodComplete = async (data: MoodCheckInData) => {
    try {
      await createMoodEntry(data);
      completeMoodEntry();
    } catch (error) {
      console.error("Failed to save daily mood:", error);
    }
  };

  if (!shouldShowReminder) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-inn-bg-accent to-inn-bg-accent-dark rounded-lg shadow-lg p-4 z-50 text-white">
      <div className="flex items-center gap-3">
        <Heart className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium text-sm">Daily Mood Check-in</h4>
          <p className="text-xs opacity-90">
            How are you feeling today? Quick check-in helps track your emotional patterns.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={dismissReminder}
            className="text-xs px-3 py-1 rounded bg-white/20 hover:bg-white/30 transition"
          >
            Later
          </button>
          <QuickMoodCheckIn onComplete={handleMoodComplete} onDismiss={dismissReminder} />
        </div>
      </div>
    </div>
  );
}

// Context provider for mood tracking across the app
export interface MoodTrackingContextType {
  triggerPostSessionMood: (sessionId: string) => void;
  showDailyReminder: boolean;
}

const MoodTrackingContext = React.createContext<MoodTrackingContextType | null>(null);

export function MoodTrackingProvider({ children }: { children: React.ReactNode }) {
  const [postSessionPrompts, setPostSessionPrompts] = useState<string[]>([]);
  const { shouldShowReminder } = useDailyMoodReminder();

  const triggerPostSessionMood = (sessionId: string) => {
    setPostSessionPrompts((prev) => [...prev, sessionId]);
  };

  const handlePostSessionComplete = (sessionId: string) => {
    setPostSessionPrompts((prev) => prev.filter((id) => id !== sessionId));
  };

  return (
    <MoodTrackingContext.Provider
      value={{
        triggerPostSessionMood,
        showDailyReminder: shouldShowReminder,
      }}
    >
      {children}

      {/* Render post-session mood prompts */}
      {postSessionPrompts.map((sessionId) => (
        <PostSessionMoodPrompt
          key={sessionId}
          sessionId={sessionId}
          onComplete={() => handlePostSessionComplete(sessionId)}
          onDismiss={() => handlePostSessionComplete(sessionId)}
        />
      ))}

      {/* Daily mood reminder */}
      <DailyMoodReminder />
    </MoodTrackingContext.Provider>
  );
}

export function useMoodTracking() {
  const context = React.useContext(MoodTrackingContext);
  if (!context) {
    throw new Error("useMoodTracking must be used within MoodTrackingProvider");
  }
  return context;
}
