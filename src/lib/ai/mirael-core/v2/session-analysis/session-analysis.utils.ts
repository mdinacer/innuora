import { SessionAnalysis } from "@/lib/ai/mirael-core/v2/session-analysis/session-analysis.types";
import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { CrisisLevel, EmotionalIntensity } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.types";

export function combineToSessionAnalysis(analyses: StateAnalysis[]): SessionAnalysis {
  if (!analyses || analyses.length === 0) {
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

  // helper: aggregate array of objects by key
  function aggregateBy<T extends { [key: string]: any }>(items: T[]): (T & { count: number })[] {
    const map = new Map<string, { item: T; count: number }>();

    for (const item of items) {
      const id = JSON.stringify(item); // stringify whole object as unique key
      if (map.has(id)) {
        map.get(id)!.count++;
      } else {
        map.set(id, { item, count: 1 });
      }
    }

    return Array.from(map.values()).map(({ item, count }) => ({
      ...item,
      count,
    }));
  }

  return {
    intensity: analyses.reduce<EmotionalIntensity>(
      (max, a) => (intensityRank[a.intensity] > intensityRank[max] ? a.intensity : max),
      "low"
    ),
    crisis: analyses.reduce<CrisisLevel>((max, a) => (crisisRank[a.crisis] > crisisRank[max] ? a.crisis : max), "none"),
    distortions: aggregateBy(analyses.flatMap((a) => a.distortions)),
    themes: aggregateBy(analyses.flatMap((a) => a.themes)),
    core_beliefs: aggregateBy(analyses.flatMap((a) => a.core_beliefs)),
    silent_rules: aggregateBy(analyses.flatMap((a) => a.silent_rules)),
  };
}
