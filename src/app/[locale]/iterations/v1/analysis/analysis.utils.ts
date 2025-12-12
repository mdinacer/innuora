import { Analysis } from "./analysis.types";

export type StagnationLevel = "none" | "low" | "moderate" | "high";

export interface StagnationResult {
  stagnation: StagnationLevel;
  score: number;
  matched_rules: string[];
  details: {
    categorical_repetition_count: number;
    internal_logic_similarity: number; // always 0 now for multilingual safety
    intensity_flatness: number;
  };
}

//
// ----------- Utility Functions ------------------------
//

/** Helper to check exact repetition across A0, A1, A2 */
function allEqual(a0: any, a1: any, a2: any): boolean {
  return a0 === a1 && a1 === a2;
}

//
// ----------- Main Stagnation Detection ----------------
//

export function detectStagnation(analyses: Analysis[]): StagnationResult {
  const prevAnalyses = analyses.slice(-3);

  // Need 3 analyses to compute stagnation
  if (prevAnalyses.length < 3) {
    return {
      stagnation: "none",
      score: 0,
      matched_rules: [],
      details: {
        categorical_repetition_count: 0,
        internal_logic_similarity: 0,
        intensity_flatness: 0,
      },
    };
  }

  const [A0, A1, A2] = prevAnalyses;

  let score = 0;
  const matched: string[] = [];

  //
  // -------- Rule 1: Categorical Repetition --------
  //
  let categoricalMatches = 0;

  const categoricalFields = ["emotional_theme", "pressure_pattern", "distortion_category", "readiness_level", "crisis"];

  for (const field of categoricalFields) {
    if (allEqual(A0[field as keyof Analysis], A1[field as keyof Analysis], A2[field as keyof Analysis])) {
      categoricalMatches += 1;
    }
  }

  if (categoricalMatches >= 3) {
    score += 2;
    matched.push("categorical_repetition");
  } else if (categoricalMatches === 2) {
    score += 1;
    matched.push("categorical_partial_repetition");
  }

  //
  // -------- Rule: Distortion Cluster Stability ------
  //
  const COMMON_DISTORTIONS = new Set([
    "should_statements",
    "all_or_nothing",
    "minimization",
    "emotional_reasoning",
    "self_downing",
  ]);

  let distortionRepeats = 0;
  [A0, A1, A2].forEach((A) => {
    if (COMMON_DISTORTIONS.has(A.distortion_category)) distortionRepeats += 1;
  });

  if (distortionRepeats >= 2) {
    score += 1;
    matched.push("distortion_cluster");
  }

  //
  // -------- Rule: Emotional Intensity Flatline ------
  //
  const intensities = [A0.emotional_intensity, A1.emotional_intensity, A2.emotional_intensity];
  const flatness = Math.max(...intensities) - Math.min(...intensities);

  if (flatness <= 1) {
    score += 1;
    matched.push("intensity_flatline");
  }

  //
  // -------- REMOVED internal logic similarity (language-unsafe) ------
  //
  const internalLogicSimilarity = 0; // always 0 for multilingual consistency

  //
  // -------- Rule: Emotional Theme Cluster ---------
  //
  const CLUSTER_GUILT = new Set(["guilt", "self_blame"]);
  const CLUSTER_PRESSURE = new Set(["pressure", "responsibility_inflation", "perfectionism", "overwhelm"]);
  const CLUSTER_FATIGUE = new Set(["fatigue", "irritation", "disconnection"]);

  function cluster(theme: string): string {
    if (CLUSTER_GUILT.has(theme)) return "guilt";
    if (CLUSTER_PRESSURE.has(theme)) return "pressure";
    if (CLUSTER_FATIGUE.has(theme)) return "fatigue";
    return "other";
  }

  const c0 = cluster(A0.emotional_theme);
  const c1 = cluster(A1.emotional_theme);
  const c2 = cluster(A2.emotional_theme);

  if (c0 === c1 && c1 === c2) {
    score += 1;
    matched.push("emotional_theme_cluster_stagnation");
  }

  //
  // -------- Rule: Readiness-Level Stagnation -------
  //
  if (A0.readiness_level === A1.readiness_level && A1.readiness_level === A2.readiness_level) {
    score += 1;
    matched.push("readiness_stagnation");
  }

  //
  // -------- Determine Stagnation Level ---------------
  //
  let stagnation: StagnationLevel = "none";

  if (score >= 6) stagnation = "high";
  else if (score >= 4) stagnation = "moderate";
  else if (score >= 2) stagnation = "low";

  //
  // -------- RETURN RESULT ---------------------------
  //
  return {
    stagnation,
    score,
    matched_rules: matched,
    details: {
      categorical_repetition_count: categoricalMatches,
      internal_logic_similarity: internalLogicSimilarity,
      intensity_flatness: flatness,
    },
  };
}
