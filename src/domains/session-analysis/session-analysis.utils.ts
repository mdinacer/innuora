import { SessionAnalysis } from "@/domains/session-analysis/session-analysis.types";
import {
  CrisisLevel,
  EmotionalIntensity,
  TherapeuticAnalysis,
} from "@/domains/therapeutic-analysis/therapeutic-analysis.types";

export function combineToSessionAnalysis(analyses: TherapeuticAnalysis[]): SessionAnalysis {
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

  // helper: aggregate array of objects by specific key fields
  function aggregateBy<T extends { [key: string]: any }>(items: T[], keyField: string): (T & { count: number })[] {
    const map = new Map<string, { item: T; count: number }>();

    for (const item of items) {
      const id = String(item[keyField]); // use specific field as unique key
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
    distortions: aggregateBy(
      analyses.flatMap((a) => a.distortions),
      "type"
    ),
    themes: aggregateBy(
      analyses.flatMap((a) => a.themes),
      "theme"
    ),
    core_beliefs: aggregateBy(
      analyses.flatMap((a) => a.core_beliefs),
      "belief"
    ),
    silent_rules: aggregateBy(
      analyses.flatMap((a) => a.silent_rules),
      "rule"
    ),
  };
}
