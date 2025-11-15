import { ChatCompletionMessageParam } from "openai/resources";

import { FactualMemory } from "../memory/types";
import { RelationalTrace } from "../reflection/types";
import { SessionWellness } from "../wellness/types";
import { REFLECTION_DIRECTIVE_PROMPT } from "./prompt";
import { ReflectionDirective } from "./types";

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
  prev: RelationalTrace,
  matches: FactualMemory[] = [],
  wellness?: SessionWellness
): string {
  const tone = directive.tone ?? prev.tone ?? "calm";
  const stance = directive.stance ?? prev.relational_stance ?? "steady";

  // Memory continuity: factual + minimal
  let memoryRef = "none";
  if (matches.length > 0) {
    memoryRef = matches
      .slice(0, 2)
      .map((m) =>
        (m.summary || "")
          .replace(/^the user /i, "she ")
          .replace(/^user /i, "she ")
          .trim()
      )
      .join("; ");
  }

  // Wellness pacing
  let pacing = "normal";
  if (wellness) {
    if (wellness.closure_state === "near_closure") pacing = "slow";
    if (wellness.closure_state === "ready_to_end") pacing = "end";
  }

  // Minimal operational brief → optimized for GPT-4o
  return `
TONE: ${tone}
STANCE: ${stance}
INTENT: ${directive.intent}

CURIOSITY_ALLOWED: ${directive.allow_curiosity ? "yes" : "no"}
PSYCHOEDUCATION_ALLOWED: ${directive.allow_psychoeducation ? "yes" : "no"}

IMPLICIT_NEEDS: ${directive.implicit_needs.join(", ") || "none"}

TRACE_TONE: ${prev.tone}
TRACE_STANCE: ${prev.relational_stance}
TRACE_FOCUS: ${prev.focus}
TRACE_NOTES: ${prev.notes}

MEMORY_CONTINUITY: ${memoryRef}

PACING: ${pacing}

RULES:
- Do not retell or summarize her message.
- Reflect only the emotional meaning.
- Stay aligned with tone, stance, and intent.
- If curiosity_allowed = no → follow_up_question = null.
- If psychoeducation_allowed = no → psychoeducation = null.
- If psychoeducation_allowed = yes → keep it one or two short lines tied directly to her emotional state.
- No advice unless intent = "reframe" or "anchor".
- No diagnostic or analytic terminology.
- Output only ReflectiveResponse JSON.

OUTPUT_FORMAT: ReflectiveResponse JSON only.
  `.trim();
}
