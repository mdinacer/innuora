/**
 * Session Dynamics Matrix Utilities
 * Computes multi-scale emotional state from analysis history
 * COPIED FROM: src/domains/session-dynamics/session-dynamics.utils.ts
 */

import type { InnuoraAnalysis, SessionDynamicsMatrix } from "./types";

// ========================================
// SESSION DYNAMICS CONFIGURATION
// ========================================

/** Phase Evolution Thresholds */
const PHASE_THRESHOLDS = {
  middlePhase: {
    adaptiveFactor: 0.45, // Transition to middle when adaptiveness reaches 45%
    minimumTurns: 3, // Require at least 3 turns before entering middle phase
  },
  closingPhase: {
    adaptiveFactor: 0.7, // Transition to closing when adaptiveness reaches 70%
    minimumTurns: 5, // Require at least 5 turns before entering closing phase
  },
  durationScalingTurns: 10, // Number of turns to reach full duration weight
};

/** Emotional Breadth Weights - how we combine diversity and stability */
const EMOTIONAL_BREADTH_WEIGHTS = {
  diversity: 0.6, // Weight given to emotional variety (60%)
  stability: 0.4, // Weight given to emotional consistency (40%)
};

/** Trend Detection Threshold - minimum change to detect rising/falling readiness */
const READINESS_TREND_THRESHOLD = 0.5; // On a 1-5 scale

/** Kalman-like Smoothing Factor - how much new data affects the aggregate */
const MACRO_SMOOTHING_ALPHA = 0.3; // 30% new data, 70% historical (prevents wild swings)

const DEFAULT_SDM: SessionDynamicsMatrix = {
  micro: {} as InnuoraAnalysis,
  meso: {
    dominant_shift: "",
    emotional_vector: { valence: 0, arousal: 0 },
    readiness_vector: 3,
    trend: "stabilizing",
  },
  macro: {
    session_phase: "early",
    dominant_axis: "emotional balance",
    adaptive_focus: "emotional balance",
    stability_index: 0.5,
    phase_confidence: 0.5,
    duration_weight: 0,
    emotional_diversity: 0,
  },
};

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
): { phase: "early" | "middle" | "closing"; confidence: number; durationWeight: number; diversity: number } {
  const n = history.length;
  const durationWeight = Math.min(1, n / PHASE_THRESHOLDS.durationScalingTurns);

  // emotional diversity = unique emotions / total turns
  const uniqueEmotions = new Set(history.map((a) => a.emotion)).size;
  const diversity = n > 0 ? Math.min(1, uniqueEmotions / n) : 0;

  // adaptive thresholds
  const openness = readinessAvg / 5;
  const emotionalBreadth =
    diversity * EMOTIONAL_BREADTH_WEIGHTS.diversity + stability * EMOTIONAL_BREADTH_WEIGHTS.stability;
  const adaptiveFactor = (openness + emotionalBreadth + durationWeight) / 3;

  // determine phase boundaries dynamically
  let phase: "early" | "middle" | "closing" = "early";
  if (adaptiveFactor > PHASE_THRESHOLDS.middlePhase.adaptiveFactor && n >= PHASE_THRESHOLDS.middlePhase.minimumTurns)
    phase = "middle";
  if (adaptiveFactor > PHASE_THRESHOLDS.closingPhase.adaptiveFactor && n >= PHASE_THRESHOLDS.closingPhase.minimumTurns)
    phase = "closing";

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
    trendDelta > READINESS_TREND_THRESHOLD
      ? "rising"
      : trendDelta < -READINESS_TREND_THRESHOLD
        ? "falling"
        : "stabilizing";

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
  const blendedStability =
    prevSDM.macro.stability_index * (1 - MACRO_SMOOTHING_ALPHA) + stability * MACRO_SMOOTHING_ALPHA;

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
