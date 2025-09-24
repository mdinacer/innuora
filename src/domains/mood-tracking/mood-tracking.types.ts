// Mood tracking system for user engagement and insights
export type MoodValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type EmotionCategory =
  | "joy"
  | "gratitude"
  | "calm"
  | "confident"
  | "neutral"
  | "worried"
  | "sad"
  | "angry"
  | "overwhelmed"
  | "exhausted";

export interface EmotionOption {
  id: EmotionCategory;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

export interface MoodEntry {
  id: string;
  userId: string;
  moodValue: MoodValue;
  emotions: EmotionCategory[];
  notes?: string;
  context?: MoodContext;
  sessionId?: string; // Link to conversation session if relevant
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodContext {
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  location?: "home" | "work" | "travel" | "social" | "other";
  situation?: "before_session" | "after_session" | "daily_checkin" | "spontaneous";
  energy: 1 | 2 | 3 | 4 | 5;
  stress: 1 | 2 | 3 | 4 | 5;
}

export interface MoodTrend {
  period: "week" | "month" | "3months";
  averageMood: number;
  moodVariability: number;
  mostCommonEmotions: EmotionCategory[];
  improvement: number; // Percentage change from previous period
  insights: string[];
}

export interface MoodPattern {
  type: "time_of_day" | "day_of_week" | "session_related" | "stress_correlation";
  pattern: string;
  confidence: number;
  actionableInsight?: string;
}

export interface MoodCheckInPrompt {
  id: string;
  question: string;
  type: "scale" | "emotion" | "context" | "reflection";
  required: boolean;
  followUp?: MoodCheckInPrompt[];
}

// Predefined emotion options for quick selection
export const EMOTION_OPTIONS: EmotionOption[] = [
  {
    id: "joy",
    label: "Joyful",
    emoji: "😊",
    color: "#10b981", // emerald-500
    description: "Happy, content, positive energy",
  },
  {
    id: "gratitude",
    label: "Grateful",
    emoji: "🙏",
    color: "#8b5cf6", // violet-500
    description: "Appreciative, thankful, blessed",
  },
  {
    id: "calm",
    label: "Calm",
    emoji: "😌",
    color: "#06b6d4", // cyan-500
    description: "Peaceful, relaxed, centered",
  },
  {
    id: "confident",
    label: "Confident",
    emoji: "💪",
    color: "#f59e0b", // amber-500
    description: "Self-assured, capable, strong",
  },
  {
    id: "neutral",
    label: "Neutral",
    emoji: "😐",
    color: "#6b7280", // gray-500
    description: "Balanced, neither positive nor negative",
  },
  {
    id: "worried",
    label: "Worried",
    emoji: "😰",
    color: "#eab308", // yellow-500
    description: "Anxious, concerned, uncertain",
  },
  {
    id: "sad",
    label: "Sad",
    emoji: "😢",
    color: "#3b82f6", // blue-500
    description: "Down, melancholy, low energy",
  },
  {
    id: "angry",
    label: "Angry",
    emoji: "😡",
    color: "#ef4444", // red-500
    description: "Frustrated, irritated, mad",
  },
  {
    id: "overwhelmed",
    label: "Overwhelmed",
    emoji: "😵",
    color: "#f97316", // orange-500
    description: "Too much, stressed, can't cope",
  },
  {
    id: "exhausted",
    label: "Exhausted",
    emoji: "😴",
    color: "#64748b", // slate-500
    description: "Drained, tired, burnt out",
  },
];

// Default mood check-in flow
export const MOOD_CHECK_IN_FLOW: MoodCheckInPrompt[] = [
  {
    id: "mood_scale",
    question: "How are you feeling right now?",
    type: "scale",
    required: true,
  },
  {
    id: "emotions",
    question: "Which emotions best describe how you're feeling?",
    type: "emotion",
    required: false,
  },
  {
    id: "context",
    question: "What's your current situation?",
    type: "context",
    required: false,
  },
  {
    id: "reflection",
    question: "Anything specific on your mind? (optional)",
    type: "reflection",
    required: false,
  },
];

// Mood insights generation helpers
export type MoodInsightType =
  | "improvement_trend"
  | "pattern_recognition"
  | "emotional_awareness"
  | "coping_strategy"
  | "self_care_reminder";

export interface MoodInsight {
  type: MoodInsightType;
  title: string;
  message: string;
  actionable: boolean;
  suggestedAction?: string;
  confidence: number;
}
