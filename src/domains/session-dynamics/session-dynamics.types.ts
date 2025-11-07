/**
 * Session Dynamics Matrix
 * Multi-scale emotional tracking (micro/meso/macro)
 */

import { InnuoraAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";

/** --- Lightweight Emotional Vector Types --- */
export type EmotionalVector = {
  valence: number; // -1 (negative) to +1 (positive)
  arousal: number; // 0 (calm) to 1 (activated)
};

export type ReadinessValue = 1 | 2 | 3 | 4 | 5;

/** --- Macro Session Phase --- */
export type SessionPhase = "early" | "middle" | "closing";

/** --- Session Dynamics Matrix --- */
export interface SessionDynamicsMatrix {
  micro: InnuoraAnalysis;
  meso: {
    dominant_shift: string;
    emotional_vector: EmotionalVector;
    readiness_vector: number;
    trend: "rising" | "falling" | "stabilizing";
  };
  macro: {
    session_phase: SessionPhase;
    dominant_axis: string;
    adaptive_focus: string;
    stability_index: number;
    phase_confidence: number; // 0–1: certainty of current phase
    duration_weight: number; // normalized 0–1: session length effect
    emotional_diversity: number; // 0–1: emotional variability across session
  };
}

/** --- Default Empty Session Dynamics Matrix --- */
export const DEFAULT_SDM: SessionDynamicsMatrix = {
  micro: {} as InnuoraAnalysis,

  meso: {
    dominant_shift: "",
    emotional_vector: { valence: 0, arousal: 0 },
    readiness_vector: 3, // neutral openness baseline
    trend: "stabilizing",
  },

  macro: {
    session_phase: "early",
    dominant_axis: "emotional balance",
    adaptive_focus: "establishing baseline connection",
    stability_index: 0.5, // neutral midpoint stability
    phase_confidence: 0.25, // low confidence at session start
    duration_weight: 0, // no history yet
    emotional_diversity: 0, // no emotional data yet
  },
};
