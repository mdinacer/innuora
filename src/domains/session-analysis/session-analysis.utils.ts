import { SessionAnalysis } from "@/domains/session-analysis/session-analysis.types";
import {
  AnalysisValue,
  CrisisLevel,
  EmotionalIntensity,
  TherapeuticAnalysis,
  TherapeuticAnalysisWithMessageId,
} from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { AnalysisChartPoint } from "@/types/session-analysis-chart";

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

export function mapAnalysesToChartData(analyses: TherapeuticAnalysisWithMessageId[]): AnalysisChartPoint[] {
  const intensityScale: Record<EmotionalIntensity, number> = {
    low: 1.0,
    moderate: 2.0,
    high: 3.0,
  };

  const crisisWeight: Record<CrisisLevel, number> = {
    none: 0.0,
    mild: 0.2,
    moderate: 0.4,
    high: 0.7,
    immediate: 1.0,
  };

  const readinessScale: Record<TherapeuticAnalysis["therapeutic_readiness"], number> = {
    resistant: 0.2,
    ambivalent: 0.4,
    ready: 0.7,
    engaged: 1.0,
  };

  const analysisValueScale: Record<AnalysisValue, number> = {
    low: 0.3,
    medium: 0.6,
    high: 1.0,
  };

  return analyses.map((a, idx): AnalysisChartPoint => {
    // Emotional intensity (2–3 → scaled down to ~1–3 range)
    const emotionalIntensity = intensityScale[a.intensity];

    // Cognitive load approximated by average of crisis level & analysis value
    const cognitiveLoad = (crisisWeight[a.crisis] * 3 + analysisValueScale[a.analysis_value] * 2) / 2;

    // Readiness directly mapped
    const readiness = readinessScale[a.therapeutic_readiness];

    // Integration heuristic:
    // 1 if process_module or utility_module defined and crisis is low,
    // 0 otherwise.
    const integration = (a.process_module || a.utility_module) && a.crisis === "none" ? 1 : 0;

    return {
      step: idx + 1,
      signalA: emotionalIntensity,
      signalB: cognitiveLoad,
      signalC: readiness,
      signalD: integration,
    };
  });
}
