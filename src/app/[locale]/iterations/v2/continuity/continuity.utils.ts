import { ContinuityAnalysis } from "./continuity.types";

export function extractAngleHistory(lastMetadata: { topic: string }[]): string[] {
  return lastMetadata.slice(-4).map((m) => m.topic);
}

export function deriveDepth(
  recommended: ContinuityAnalysis["recommended_depth"],
  previousDepth: "low" | "medium" | "high"
): "low" | "medium" | "high" {
  // no jumps from low → high or high → low
  if (recommended === "high" && previousDepth === "low") return "medium";
  if (recommended === "low" && previousDepth === "high") return "medium";
  return recommended;
}

export function decideQuestionUse(continuity: ContinuityAnalysis, lastMetadata: { question_used: boolean }[]): boolean {
  if (!continuity.question_permission) return false;

  // Avoid repeating question two times in a row if stagnating
  const last = lastMetadata[lastMetadata.length - 1];
  if (last && last.question_used && continuity.stagnation_flag !== "none") {
    return false;
  }

  return true;
}
