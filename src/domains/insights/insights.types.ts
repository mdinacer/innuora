export interface EmotionalIntensityTrend {
  period: string; // "week", "month"
  current: "low" | "moderate" | "high";
  previous: "low" | "moderate" | "high";
  improvement: number; // percentage change
  trend: "improving" | "stable" | "concerning";
}

export interface DistortionPattern {
  type: string;
  currentFrequency: number;
  previousFrequency: number;
  reduction: number; // percentage reduction
  trend: "improving" | "stable" | "increasing";
}

export interface PatternInsight {
  id: string;
  category: "progress" | "awareness" | "pattern" | "strength";
  title: string;
  description: string;
  metric?: {
    value: string;
    change: number;
    direction: "up" | "down";
  };
}

export interface SessionOutcomeTrend {
  totalSessions: number;
  clarityRate: number; // percentage ending with clarity
  overwhelmReduction: number;
  solutionFocusIncrease: number;
}

export interface CrossSessionInsights {
  emotionalIntensity: EmotionalIntensityTrend;
  distortionPatterns: DistortionPattern[];
  sessionOutcomes: SessionOutcomeTrend;
  keyInsights: PatternInsight[];
  timeframe: {
    current: Date;
    comparison: Date;
  };
}
