import { StateAnalysis } from "../state-analysis/state-analysis.schema";
import { CrisisLevel, EmotionalIntensity } from "../state-analysis/state-analysis.types";
import { SessionAnalysis } from "./session-analysis.types";

export function combineToSessionAnalysis(analyses: StateAnalysis[]): SessionAnalysis {
  if (analyses.length === 0) {
    throw new Error("No analyses provided");
  }

  const intensityRank: Record<EmotionalIntensity, number> = {
    low: 1,
    moderate: 2,
    high: 3,
  };

  const crisisRank: Record<CrisisLevel, number> = {
    none: 0,
    mild: 1,
    moderate: 2,
    high: 3,
    immediate: 4,
  };

  const mergeUnique = (key: keyof StateAnalysis): string[] =>
    Array.from(new Set(analyses.flatMap((a) => (Array.isArray(a[key]) ? (a[key] as string[]) : []))));

  return {
    intensity: analyses.reduce<EmotionalIntensity>(
      (max, a) => (intensityRank[a.intensity] > intensityRank[max] ? a.intensity : max),
      "low"
    ),
    crisis: analyses.reduce<CrisisLevel>((max, a) => (crisisRank[a.crisis] > crisisRank[max] ? a.crisis : max), "none"),
    distortions: mergeUnique("distortions"),
    themes: mergeUnique("themes"),
    core_beliefs: mergeUnique("core_beliefs"),
    silent_rules: mergeUnique("silent_rules"),
  };
}
