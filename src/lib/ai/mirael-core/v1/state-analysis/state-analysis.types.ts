import { StateAnalysis } from "@/lib/ai/mirael-core/v1/state-analysis/state-analysis.schema";
import { SessionModule } from "@/lib/ai/shared/session-modules";
import { ModelTokenUsage } from "@/types/ai-model.types";

// === Maps and Types ===
export const USER_STATE_MAP = {
  firstTime: "first_time",
  returning: "returning",
  established: "established",
} as const;

export type UserState = (typeof USER_STATE_MAP)[keyof typeof USER_STATE_MAP];

export const CRISIS_LEVEL_MAP = {
  none: "none",
  mild: "mild",
  moderate: "moderate",
  high: "high",
  immediate: "immediate",
} as const;

export type CrisisLevel = (typeof CRISIS_LEVEL_MAP)[keyof typeof CRISIS_LEVEL_MAP];

export const EMOTION_INTENSITY_MAP = {
  low: "low",
  moderate: "moderate",
  high: "high",
} as const;

export type EmotionalIntensity = (typeof EMOTION_INTENSITY_MAP)[keyof typeof EMOTION_INTENSITY_MAP];

export type AnalysisContextItem = {
  primary_module: SessionModule;
  secondary_module: SessionModule | null;
  intensity: EmotionalIntensity;
};

export type AnalysisContext = {
  recentAnalyses: AnalysisContextItem[];
  recurringThemes: string[];
  distortions: string[];
};

export interface AnalysisResult {
  analysis: StateAnalysis;
  modelTokenUsage: ModelTokenUsage | null;
}
