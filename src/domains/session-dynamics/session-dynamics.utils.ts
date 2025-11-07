/**
 * Session Dynamics Matrix Utilities
 * Computes multi-scale emotional state from analysis history
 */

import { InnuoraAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { DEFAULT_SDM, SessionDynamicsMatrix, SessionPhase } from "./session-dynamics.types";

/** --- Helper: map emotion to valence/arousal space --- */
function mapEmotion(emotion?: string | null): [number, number] {
  if (!emotion) return [0, 0];
  const e = emotion.toLowerCase();
  const map: Record<string, [number, number]> = {
    sadness: [-0.7, 0.4],
    fear: [-0.8, 0.6],
    guilt: [-0.6, 0.5],
    anger: [-0.4, 0.7],
    numbness: [-0.3, 0.2],
    hope: [0.4, 0.5],
    calm: [0.6, 0.2],
    joy: [0.9, 0.6],
  };
  return map[e] ?? [0, 0];
}

/** --- Helper: map readiness to scalar --- */
function mapReadiness(level?: string | null): number {
  const m: Record<string, number> = {
    avoidant: 1,
    cautious: 2,
    open: 3,
    engaged: 4,
    reflective: 5,
  };
  return m[level ?? "open"] ?? 3;
}

/** --- Helper: derive dominant emotional shift --- */
function deriveShift(history: InnuoraAnalysis[]): string {
  if (history.length < 2) return "";
  const last = history.at(-1)!;
  const prev = history.at(-2)!;
  if (last.emotion === prev.emotion) return "";
  return `${prev.emotion} → ${last.emotion}`;
}

/** --- Phase evolution and recalibration --- */
function evolveSessionPhase(
  history: InnuoraAnalysis[],
  readinessAvg: number,
  stability: number
): { phase: SessionPhase; confidence: number; durationWeight: number; diversity: number } {
  const n = history.length;
  const durationWeight = Math.min(1, n / 10); // scales to 1 after ~10 turns

  // emotional diversity = unique emotions / total turns
  const uniqueEmotions = new Set(history.map((a) => a.emotion)).size;
  const diversity = n > 0 ? Math.min(1, uniqueEmotions / n) : 0;

  // adaptive thresholds
  const openness = readinessAvg / 5;
  const emotionalBreadth = diversity * 0.6 + stability * 0.4;
  const adaptiveFactor = (openness + emotionalBreadth + durationWeight) / 3;

  // determine phase boundaries dynamically
  let phase: SessionPhase = "early";
  if (adaptiveFactor > 0.45 && n >= 3) phase = "middle";
  if (adaptiveFactor > 0.7 && n >= 5) phase = "closing";

  const confidence = Number(Math.min(1, Math.abs(adaptiveFactor - 0.5) * 2).toFixed(2));

  return { phase, confidence, durationWeight, diversity };
}

/** --- Core Update Function --- */
export function updateSessionDynamicsMatrix(
  history: InnuoraAnalysis[],
  prevSDM: SessionDynamicsMatrix = DEFAULT_SDM
): SessionDynamicsMatrix {
  if (!history.length) return DEFAULT_SDM;

  const recent = history.slice(-5);
  const latest = recent.at(-1)!;

  /** --- Compute Meso Emotional Vector (smoothed) --- */
  const vectors = recent.map((a) => mapEmotion(a.emotion));
  const avgValence = vectors.reduce((s, v) => s + v[0], 0) / vectors.length;
  const avgArousal = vectors.reduce((s, v) => s + v[1], 0) / vectors.length;

  /** --- Readiness smoothing --- */
  const readinessVals = recent.map((a) => mapReadiness(a.readiness));
  const readinessAvg = readinessVals.reduce((a, b) => a + b, 0) / readinessVals.length;

  /** --- Determine short-term trend --- */
  const trendDelta = readinessVals.at(-1)! - readinessVals[0];
  const trend: "rising" | "falling" | "stabilizing" =
    trendDelta > 0.5 ? "rising" : trendDelta < -0.5 ? "falling" : "stabilizing";

  /** --- Compute Macro Stability (variance-based) --- */
  const valenceVar = vectors.reduce((s, v) => s + Math.pow(v[0] - avgValence, 2), 0) / vectors.length;
  const arousalVar = vectors.reduce((s, v) => s + Math.pow(v[1] - avgArousal, 2), 0) / vectors.length;
  const stability = 1 - Math.min(1, (valenceVar + arousalVar) / 2);

  /** --- Phase evolution recalibration --- */
  const evolved = evolveSessionPhase(history, readinessAvg, stability);

  /** --- Dominant Axis and Focus --- */
  const dominant_axis = latest.theme || prevSDM.macro.dominant_axis || "emotional balance";
  const adaptive_focus = `${dominant_axis} in relation to ${latest.emotion}`;

  /** --- Blend old and new macro states (Kalman-like smoothing) --- */
  const alpha = 0.3; // responsiveness factor
  const blendedStability = prevSDM.macro.stability_index * (1 - alpha) + stability * alpha;

  /** --- Construct New SDM --- */
  return {
    micro: latest,
    meso: {
      dominant_shift: deriveShift(recent),
      emotional_vector: { valence: avgValence, arousal: avgArousal },
      readiness_vector: readinessAvg,
      trend,
    },
    macro: {
      session_phase: evolved.phase,
      dominant_axis,
      adaptive_focus,
      stability_index: Number(blendedStability.toFixed(2)),
      phase_confidence: evolved.confidence,
      duration_weight: evolved.durationWeight,
      emotional_diversity: evolved.diversity,
    },
  };
}
