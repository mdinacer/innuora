"use client";

import React, { useState } from "react";
import { Heart, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  EMOTION_OPTIONS,
  EmotionCategory,
  EmotionOption,
  MoodContext,
  MoodValue,
} from "@/domains/mood-tracking/mood-tracking.types";
import { cn } from "@/lib/utils";

interface MoodCheckInProps {
  onComplete: (data: MoodCheckInData) => void;
  onCancel?: () => void;
  className?: string;
  sessionId?: string;
}

export interface MoodCheckInData {
  moodValue: MoodValue;
  emotions: EmotionCategory[];
  notes?: string;
  context?: Partial<MoodContext>;
  sessionId?: string;
}

export function MoodCheckIn({ onComplete, onCancel, className, sessionId }: MoodCheckInProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [moodValue, setMoodValue] = useState<MoodValue | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionCategory[]>([]);
  const [notes, setNotes] = useState("");
  const [context, setContext] = useState<Partial<MoodContext>>({});

  const steps = ["How are you feeling?", "What emotions describe this?", "Any thoughts to add?"];

  const handleMoodSelect = (value: MoodValue) => {
    setMoodValue(value);
  };

  const handleEmotionToggle = (emotion: EmotionCategory) => {
    setSelectedEmotions((prev) => (prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    if (!moodValue) return;

    // Auto-detect time of day
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";

    const data: MoodCheckInData = {
      moodValue,
      emotions: selectedEmotions,
      notes: notes.trim() || undefined,
      context: {
        ...context,
        timeOfDay,
        situation: sessionId ? "after_session" : "daily_checkin",
      },
      sessionId,
    };

    onComplete(data);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return moodValue !== null;
      case 1:
        return true; // Emotions are optional
      case 2:
        return true; // Notes are optional
      default:
        return false;
    }
  };

  const getMoodLabel = (value: MoodValue) => {
    if (value <= 3) return "Not great";
    if (value <= 5) return "Okay";
    if (value <= 7) return "Good";
    return "Excellent";
  };

  const getMoodColor = (value: MoodValue) => {
    if (value <= 3) return "text-red-500";
    if (value <= 5) return "text-yellow-500";
    if (value <= 7) return "text-blue-500";
    return "text-green-500";
  };

  return (
    <div className={cn("w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-inn-bg-accent" />
          <h2 className="text-lg font-semibold text-inn-text-primary">Mood Check-in</h2>
        </div>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Progress indicator */}
      <div className="flex mb-6">
        {steps.map((_, index) => (
          <div key={index} className="flex-1 flex items-center">
            <div className={cn("h-2 flex-1 rounded", index <= currentStep ? "bg-inn-bg-accent" : "bg-gray-200")} />
            {index < steps.length - 1 && <div className="w-2" />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="mb-6">
        <h3 className="text-base font-medium text-inn-text-primary mb-4">{steps[currentStep]}</h3>

        {/* Step 1: Mood Scale */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  onClick={() => handleMoodSelect(value as MoodValue)}
                  className={cn(
                    "aspect-square rounded-lg border-2 text-sm font-medium transition-all",
                    moodValue === value
                      ? "border-inn-bg-accent bg-inn-bg-accent text-white"
                      : "border-gray-200 hover:border-inn-bg-accent hover:bg-inn-bg-soft"
                  )}
                >
                  {value}
                </button>
              ))}
            </div>
            {moodValue && (
              <div className="text-center">
                <span className={cn("text-sm font-medium", getMoodColor(moodValue))}>{getMoodLabel(moodValue)}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Emotions */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-inn-text-secondary">Select all that apply (optional)</p>
            <div className="grid grid-cols-2 gap-2">
              {EMOTION_OPTIONS.map((emotion) => (
                <EmotionButton
                  key={emotion.id}
                  emotion={emotion}
                  isSelected={selectedEmotions.includes(emotion.id)}
                  onToggle={() => handleEmotionToggle(emotion.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Notes */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <p className="text-sm text-inn-text-secondary">Anything specific on your mind? (optional)</p>
            <Textarea
              placeholder="What's contributing to how you feel right now?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] resize-none"
              maxLength={200}
            />
            <div className="text-xs text-inn-text-secondary text-right">{notes.length}/200</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-inn-bg-accent hover:bg-inn-bg-accent-dark text-white"
        >
          {currentStep === steps.length - 1 ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  );
}

// Emotion selection button component
function EmotionButton({
  emotion,
  isSelected,
  onToggle,
}: {
  emotion: EmotionOption;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-all text-sm",
        isSelected ? "border-inn-bg-accent bg-inn-bg-soft" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      )}
    >
      <span className="text-lg">{emotion.emoji}</span>
      <span className="font-medium text-inn-text-primary">{emotion.label}</span>
    </button>
  );
}

// Quick mood check-in for floating prompt
export function QuickMoodCheckIn({
  onComplete,
  onDismiss,
}: {
  onComplete: (data: MoodCheckInData) => void;
  onDismiss: () => void;
}) {
  const [moodValue, setMoodValue] = useState<MoodValue | null>(null);

  const handleQuickComplete = () => {
    if (!moodValue) return;

    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : hour < 21 ? "evening" : "night";

    onComplete({
      moodValue,
      emotions: [],
      context: {
        timeOfDay,
        situation: "spontaneous",
      },
    });
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg border p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-inn-bg-accent" />
          <span className="text-sm font-medium">Quick mood check</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onDismiss} className="h-6 w-6 p-0">
          <X className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
          <button
            key={value}
            onClick={() => setMoodValue(value as MoodValue)}
            className={cn(
              "flex-1 aspect-square text-xs rounded border",
              moodValue === value
                ? "border-inn-bg-accent bg-inn-bg-accent text-white"
                : "border-gray-200 hover:border-inn-bg-accent"
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onDismiss} className="text-xs">
          Skip
        </Button>
        <Button
          size="sm"
          onClick={handleQuickComplete}
          disabled={!moodValue}
          className="bg-inn-bg-accent hover:bg-inn-bg-accent-dark text-white text-xs flex-1"
        >
          Save
        </Button>
      </div>
    </div>
  );
}
