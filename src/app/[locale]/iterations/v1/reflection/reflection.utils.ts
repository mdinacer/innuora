import { Analysis } from "../analysis/analysis.types";
import { StagnationResult } from "../analysis/analysis.utils";
import { RelationalTrace } from "./reflection.types";

type DirectiveAngle = "naming" | "clarifying" | "exploring";

export interface ReflectionDirective {
  focus_point: string;
  angle: DirectiveAngle;
  cognitive_thread: string;

  allow_follow_up: boolean;
  allow_psychoeducation: boolean;
  allow_next_action: boolean;

  stance_adjustment: "keep" | "soften" | "steady_up" | "ground_more" | "lean_in";
  tone_hint: "warm" | "firm" | "calm" | "curious";

  stagnation_strategy: "none" | "name_rule" | "tighten_focus";
  instruction: string;
}

const FALLBACK_STAGNATION: StagnationResult = {
  stagnation: "none",
  score: 0,
  matched_rules: [],
  details: {
    categorical_repetition_count: 0,
    internal_logic_similarity: 0,
    intensity_flatness: 0,
  },
};

export function generateDirective(
  analysis: Analysis,
  relational: RelationalTrace,
  stagnation: StagnationResult = FALLBACK_STAGNATION
): ReflectionDirective {
  // ---------------------------------------------------------
  // 1. FOCUS POINT
  // ---------------------------------------------------------
  const focus_point =
    stagnation.stagnation === "high"
      ? "internal_logic"
      : analysis.distortion_category !== "none"
        ? analysis.distortion_category
        : analysis.pressure_pattern !== "none"
          ? analysis.pressure_pattern
          : "internal_logic";

  // ---------------------------------------------------------
  // 2. ANGLE
  // ---------------------------------------------------------
  let angle: DirectiveAngle;

  if (stagnation.stagnation === "high") {
    angle = "naming";
  } else if (analysis.readiness_level === "high") {
    angle = "exploring";
  } else if (analysis.readiness_level === "medium") {
    angle = "clarifying";
  } else {
    angle = "naming";
  }

  // ---------------------------------------------------------
  // 3. COGNITIVE THREAD (what reflection should *do*)
  // ---------------------------------------------------------
  const cognitive_thread =
    angle === "naming"
      ? "name the rule shaping the reaction"
      : angle === "clarifying"
        ? "clarify the consequence implied by the rule"
        : "use the micro_question to gently open one point";

  // ---------------------------------------------------------
  // 4. GATING (follow-up, education, next-action)
  // ---------------------------------------------------------
  const allow_follow_up = analysis.readiness_level === "high" && stagnation.stagnation !== "high";

  const allow_psychoeducation = analysis.allow_psychoeducation === "yes" && stagnation.stagnation !== "high";

  const allow_next_action =
    analysis.allow_next_action === "yes" && analysis.readiness_level !== "low" && stagnation.stagnation !== "high";

  // ---------------------------------------------------------
  // 5. RELATIONAL STANCE ADJUSTMENT
  // ---------------------------------------------------------
  const stance_adjustment =
    stagnation.stagnation === "high" ? "ground_more" : relational.resistance !== "none" ? "soften" : "keep";

  // ---------------------------------------------------------
  // 6. TONE HINT
  // ---------------------------------------------------------
  const tone_hint =
    stagnation.stagnation === "high" ? "firm" : analysis.readiness_level === "high" ? "curious" : "warm";

  // ---------------------------------------------------------
  // 7. STAGNATION STRATEGY
  // ---------------------------------------------------------
  const stagnation_strategy =
    stagnation.stagnation === "high" ? "name_rule" : stagnation.stagnation === "moderate" ? "tighten_focus" : "none";

  // ---------------------------------------------------------
  // 8. FINAL INSTRUCTION (what reflection must follow)
  // ---------------------------------------------------------
  const instruction = (() => {
    if (stagnation.stagnation === "high") {
      return "Stay tight on the rule driving the reaction. No broad exploration. No follow-up question.";
    }

    if (angle === "clarifying") {
      return "Clarify the consequence implied by the rule. Keep it grounded and simple.";
    }

    if (angle === "exploring") {
      return "If allowed, use a form of the micro-question to gently open one angle. Stay narrow and grounded.";
    }

    return "Name the rule shaping the reaction with a firm-warm tone.";
  })();

  // ---------------------------------------------------------
  // 9. RETURN DIRECTIVE
  // ---------------------------------------------------------
  return {
    focus_point,
    angle,
    cognitive_thread,

    allow_follow_up,
    allow_psychoeducation,
    allow_next_action,

    stance_adjustment,
    tone_hint,

    stagnation_strategy,
    instruction,
  };
}

export function buildReflectionPrompt(directive: ReflectionDirective) {
  // --- base instructions always included ---
  let instructions = `
You generate a grounded, lived, woman-to-woman reflection.
You are not a therapist or coach. You do not treat, fix, reassure, or normalize.

Your tone is firm-warm: plain, simple, direct. No metaphors. No poetic phrasing.

You produce exactly:
- a short reflection (1–3 sentences)
- one optional follow-up question
- one optional psychoeducation block
- one optional next_action block
- the next_relational_trace object

Use lived-experience language. Use I/we naturally. Show presence: you are part of the moment with her.

INPUTS YOU RECEIVE:
- user message
- the directive object
- previous messages
- previous relational trace

REFLECTION BEHAVIOR:
- Use directive.focus_point + directive.cognitive_thread as your internal guide.
- Use directive.stance_adjustment to adjust relational stance.
- Use directive.tone_hint to shape the tone.
- Use directive.stagnation_strategy to control narrowness or depth.
`;

  // --- conditional: follow-up question rules ---
  if (directive.allow_follow_up) {
    instructions += `
FOLLOW-UP QUESTION RULE:
Ask one only when the directive says follow_up is allowed.
Use the micro-question indirectly. Do not quote it. Keep it short.
`;
  } else {
    instructions += `
FOLLOW-UP QUESTION RULE:
Do NOT generate a follow-up question. It must be null.
`;
  }

  // --- conditional: psychoeducation block ---
  if (directive.allow_psychoeducation) {
    instructions += `
PSYCHOEDUCATION RULES:
- 1–2 plain sentences
- No jargon (no “distortion,” “pattern,” “cognitive”)
- Must reference a concrete phrase from the user's message
- Keep it lived, grounded, and simple
- If stagnation is high: extremely minimal explanation
`;
  } else {
    instructions += `
PSYCHOEDUCATION RULES:
Do NOT generate psychoeducation. Set it to null.
`;
  }

  // --- conditional: next_action ---
  if (directive.allow_next_action) {
    instructions += `
NEXT ACTION RULES:
- A single micro-step
- No journaling, no exercises, no therapeutic tasks
- Ultra-light, optional, grounded in real life
- Confidence between 0 and 1
`;
  } else {
    instructions += `
NEXT ACTION RULES:
Do NOT generate next_action. Set it to null.
`;
  }

  // --- relational trace rules ---
  instructions += `
RELATIONAL TRACE:
Maintain continuity unless directive.stance_adjustment forces a shift.
Focus should reflect directive.focus_point.
Tone should follow directive.tone_hint.
Avoid repeating lived lines if the previous trace used one.
`;

  instructions += `
PROHIBITIONS:
- No empathy phrases (“that sounds hard”)
- No emotional labeling (“you feel X”)
- No therapy language
- No advice
- No moralizing
- No metaphors or poetic lines
`;

  return instructions.trim();
}
