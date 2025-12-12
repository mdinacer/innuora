import { ContinuityAnalysis } from "../continuity/continuity.types";
import { Metadata } from "./reflection.types";

export function buildTruthMirrorDirective(meta: Metadata) {
  const depthText = {
    low: "Stay at low depth.",
    medium: "Continue at medium depth.",
    high: "Continue at high depth.",
  }[meta.depth];

  const moveText = {
    go_deeper:
      meta.depth === "high" ? "Gently push deeper but without escalating tone." : "Gently go one level deeper.",
    shift_angle: "Shift the angle of exploration without losing the thread.",
    stabilize: "Hold depth steady and prevent escalation.",
  }[meta.next_move];

  const questionText = meta.question_used ? "Do not ask a question this turn." : "A single short question is optional.";

  const topicText = `Stay focused on the topic: "${meta.topic}".`;

  return `${depthText} ${moveText} ${questionText} ${topicText}`;
}

export interface ReflectionDirective {
  topic: string;
  depth: "low" | "medium" | "high";
  allow_question: boolean;
  move: "go_deeper" | "shift_angle" | "stabilize";
}
export function buildReflectionDirective(continuity: ContinuityAnalysis, lastMetadata: Metadata): ReflectionDirective {
  // -------------------------------
  // 1. Choose Topic
  // -------------------------------
  const topic = continuity.recommended_topic || lastMetadata.topic;

  // -------------------------------
  // 2. Determine Depth
  // -------------------------------
  let depth: "low" | "medium" | "high" = continuity.recommended_depth;

  // Rule: never jump directly low → high or high → low
  if (lastMetadata.depth === "low" && depth === "high") depth = "medium";
  if (lastMetadata.depth === "high" && depth === "low") depth = "medium";

  // Rule: if stagnating → avoid going deeper (force stabilization)
  if (continuity.stagnation_flag !== "none" && depth === "high") {
    depth = "medium";
  }

  // -------------------------------
  // 3. Decide if a question is allowed
  // -------------------------------
  let allow_question = continuity.question_permission;

  // Prevent two consecutive questions during stagnation
  if (lastMetadata.question_used && continuity.stagnation_flag !== "none") {
    allow_question = false;
  }

  // -------------------------------
  // 4. Select movement (next_move)
  // -------------------------------
  let move: "go_deeper" | "shift_angle" | "stabilize";

  // priority: continuity suggestion
  move =
    continuity.recommended_depth === "high"
      ? "go_deeper"
      : continuity.recommended_depth === "low"
        ? "stabilize"
        : continuity.recommended_topic !== lastMetadata.topic
          ? "shift_angle"
          : continuity.recommended_depth === "medium"
            ? "shift_angle"
            : "stabilize";

  // If stagnation is present → force angle shift unless we're already shifting
  if (continuity.stagnation_flag !== "none" && move === "go_deeper") {
    move = "shift_angle";
  }

  // -------------------------------
  // 5. Return directive
  // -------------------------------
  return {
    topic,
    depth,
    allow_question,
    move,
  };
}
