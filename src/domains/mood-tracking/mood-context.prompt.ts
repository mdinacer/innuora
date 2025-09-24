import { EmotionCategory } from "@/domains/mood-tracking/mood-tracking.types";

// Base mood entry interface that works with both types
type MoodEntryBase = {
  moodValue: number;
  emotions: EmotionCategory[];
  notes?: string | null;
  createdAt: Date;
  sessionId?: string | null;
};

function getMoodDescription(moodValue: number): string {
  if (moodValue >= 8) return "excellent";
  if (moodValue >= 7) return "good";
  if (moodValue >= 6) return "decent";
  if (moodValue >= 5) return "neutral";
  if (moodValue >= 4) return "challenging";
  if (moodValue >= 3) return "difficult";
  return "very difficult";
}

function formatEmotions(emotions: EmotionCategory[]): string {
  if (!emotions || emotions.length === 0) return "";

  const emotionLabels: Record<EmotionCategory, string> = {
    joy: "joyful",
    gratitude: "grateful",
    calm: "calm",
    confident: "confident",
    neutral: "neutral",
    worried: "worried",
    sad: "sad",
    angry: "angry",
    overwhelmed: "overwhelmed",
    exhausted: "exhausted",
  };

  return emotions.map((e) => emotionLabels[e]).join(", ");
}

function getMoodTrend(moods: MoodEntryBase[]): string | null {
  if (moods.length < 3) return null;

  // Simple trend analysis - compare first half to second half
  const midpoint = Math.floor(moods.length / 2);
  const firstHalf = moods.slice(0, midpoint);
  const secondHalf = moods.slice(midpoint);

  const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.moodValue, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.moodValue, 0) / secondHalf.length;

  const difference = secondHalfAvg - firstHalfAvg;

  if (Math.abs(difference) < 0.5) return "stable";
  return difference > 0 ? "upward" : "downward";
}

function findDominantEmotions(moods: MoodEntryBase[]): EmotionCategory[] {
  if (moods.length === 0) return [];

  const emotionCounts: Record<string, number> = {};

  moods.forEach((mood) => {
    mood.emotions?.forEach((emotion) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
  });

  const totalMoods = moods.length;
  const threshold = Math.max(1, Math.floor(totalMoods * 0.3)); // At least 30% of entries

  return Object.entries(emotionCounts)
    .filter(([, count]) => count >= threshold)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3) // Top 3 emotions
    .map(([emotion]) => emotion as EmotionCategory);
}

/**
 * Builds AI context prompt from user's recent mood entries
 */
export function buildMoodContextPrompt(recentMoods: MoodEntryBase[]): string {
  if (!recentMoods || recentMoods.length === 0) {
    return "";
  }

  const now = Date.now();
  const todayMoods = recentMoods.filter(
    (m) => now - m.createdAt.getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
  );

  const recentMoods7Days = recentMoods.filter(
    (m) => now - m.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
  );

  const contextParts: string[] = [];

  // Today's mood context
  if (todayMoods.length > 0) {
    const latestToday = todayMoods[todayMoods.length - 1];
    const moodLevel = getMoodDescription(latestToday.moodValue);
    const emotions = formatEmotions(latestToday.emotions);

    contextParts.push(
      `Today's mood: ${moodLevel} (${latestToday.moodValue}/10)${emotions ? ` - feeling ${emotions}` : ""}`
    );

    if (latestToday.notes) {
      contextParts.push(`Current context: "${latestToday.notes}"`);
    }
  }

  // Weekly mood trend context
  if (recentMoods7Days.length > 1) {
    const avgMood = recentMoods7Days.reduce((sum, m) => sum + m.moodValue, 0) / recentMoods7Days.length;
    const trendDescription = getMoodTrend(recentMoods7Days);

    contextParts.push(
      `Recent mood pattern (7 days): ${getMoodDescription(Math.round(avgMood))} average (${Math.round(avgMood * 10) / 10}/10)${trendDescription ? `, trending ${trendDescription}` : ""}`
    );
  }

  // Dominant emotions pattern
  const dominantEmotions = findDominantEmotions(recentMoods7Days);
  if (dominantEmotions.length > 0) {
    contextParts.push(`Frequent emotions this week: ${formatEmotions(dominantEmotions)}`);
  }

  // Session-linked mood context
  const sessionLinkedMood = recentMoods.find((m) => m.sessionId);
  if (sessionLinkedMood && sessionLinkedMood.notes) {
    contextParts.push(`Previous session reflection: "${sessionLinkedMood.notes}"`);
  }

  if (contextParts.length === 0) {
    return "";
  }

  return `

## User's Current Emotional Context
${contextParts.join("\n")}

**Instructions for AI Response:**
- Be naturally aware of their current emotional state without explicitly mentioning mood tracking
- Adapt your therapeutic approach to their current mood level and emotional patterns
- If they're experiencing difficult emotions, be extra gentle and validating
- If they're doing well, you can explore growth opportunities more confidently
- Don't assume their mood unless they bring it up directly
- Use this context to personalize your CBT guidance and tone

`;
}
