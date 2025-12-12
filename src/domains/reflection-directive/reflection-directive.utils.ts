import { ChatCompletionMessageParam } from "openai/resources";

import { RelationalTrace } from "@/domains/shared-types";
import { FactualMemory } from "../memory-analysis/memory-analysis.types";
import { SessionPhaseEvaluation } from "../phase-evaluation/phase-evaluation.types";
import { REFLECTION_DIRECTIVE_PROMPT } from "./reflection-directive.prompts";
import { ReflectionDirective } from "./reflection-directive.types";

export const buildReflectionDirectivePrompt = (
  userInput: string,
  relationalTrace: RelationalTrace
): ChatCompletionMessageParam[] => [
  REFLECTION_DIRECTIVE_PROMPT.messageParam,
  {
    role: "user",
    content: JSON.stringify(
      {
        user_input: userInput,
        previous_relational_trace: relationalTrace,
      },
      null,
      2
    ),
  },
];

export function formatDirectiveForReflection(
  directive: ReflectionDirective,
  prevTrace: RelationalTrace,
  matches: FactualMemory[] = [],
  wellness: SessionPhaseEvaluation | null
): string {
  const tone = directive.tone ?? prevTrace.tone ?? "calm";
  const stance = directive.stance ?? prevTrace.relational_stance ?? "steady";

  // Derived gates based on prior usage
  const curiosityRecentlyUsed = prevTrace.curiosity_last_turn === true;
  const psychoeduRecentlyUsed = prevTrace.psychoeducation_last_turn === true;
  const intentIsContainLike = directive.intent === "contain" || directive.intent === "anchor";

  const curiosityAllowed = directive.allow_curiosity && !curiosityRecentlyUsed && prevTrace.user_engagement !== "low";
  const psychoeduAllowed = directive.allow_psychoeducation && !psychoeduRecentlyUsed;
  const nextActionAllowed = !intentIsContainLike && prevTrace.user_engagement !== "low";
  const memoryRecalls =
    matches
      .slice(0, 2)
      .map((m) =>
        (m.summary || "")
          .replace(/^the user /i, "she ")
          .replace(/^user /i, "she ")
          .trim()
      )
      .filter(Boolean)
      .join("; ") || "";

  const diagParts: string[] = [];
  if (directive.emotional_themes?.length) diagParts.push(`Themes: ${directive.emotional_themes.join(", ")}`);
  if (directive.cognitive_patterns?.length) diagParts.push(`Patterns: ${directive.cognitive_patterns.join(", ")}`);
  if (directive.distortions_detected?.length)
    diagParts.push(`Distortions: ${directive.distortions_detected.join(", ")}`);
  if (directive.implicit_needs?.length) diagParts.push(`Needs: ${directive.implicit_needs.join(", ")}`);

  const relationalLines: string[] = [];
  relationalLines.push(`Previous focus: ${prevTrace.focus || "not specified"}.`);
  if (prevTrace.notes) relationalLines.push(`Relational notes: ${prevTrace.notes.trim()}.`);
  relationalLines.push(`Engagement: ${prevTrace.user_engagement}.`);
  if (prevTrace.resistance && prevTrace.resistance !== "none") {
    relationalLines.push(`Resistance signal last turn: ${prevTrace.resistance}.`);
  }
  if (prevTrace.used_lived_line) {
    relationalLines.push("You used a lived micro-line last turn; vary cadence this time.");
  }
  if (memoryRecalls) {
    relationalLines.push(`Memory recalls: ${memoryRecalls}.`);
  }

  let wellnessLine = "";
  if (wellness && wellness.closure_state !== "continue") {
    wellnessLine =
      wellness.closure_state === "near_closure"
        ? "She’s softening toward closure — slow your cadence, stay gentle."
        : "She’s ready_to_end — keep language easy, let her rest.";
  }

  return [
    "ADDENDUM — keep persona instructions; this is continuity context only.",
    `Intent=${directive.intent}; Stance=${stance}; Tone=${tone}.`,
    diagParts.length ? diagParts.join(" | ") : "",
    relationalLines.filter(Boolean).join(" "),
    wellnessLine,
    curiosityAllowed
      ? "Curiosity open: offer at most one short, human question if it deepens connection."
      : `Curiosity closed: ${
          curiosityRecentlyUsed
            ? "you just used a question last turn; let her lead."
            : intentIsContainLike
              ? "contain/anchor intent wants steadiness."
              : "follow her pace without inviting exploration."
        }`,
    psychoeduAllowed
      ? "Psychoeducation open: one grounded insight max, tied to her words."
      : `Psychoeducation closed: ${
          psychoeduRecentlyUsed
            ? "you offered insight last turn; keep this one purely relational."
            : "stay with presence."
        }`,
    nextActionAllowed
      ? "Next action optional — only include if the core eligibility rules are met."
      : "Next action closed — hold steady; no action prompt this turn.",
    "OUTPUT CONTRACT: Return one JSON object per the schema. When curiosity is closed set follow_up_question=null. When psychoeducation is closed return psychoeducation=null. Emit next_action only when allowed. Update next_relational_trace with fresh stance, tone, focus, notes, user_engagement, resistance, and *_last_turn flags based on whether you actually used curiosity or psychoeducation this turn.",
  ]
    .filter(Boolean)
    .join("\n");
}
