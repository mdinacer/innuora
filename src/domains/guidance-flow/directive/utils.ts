import { ChatCompletionMessageParam } from "openai/resources";

import { REFLECTION_DIRECTIVE_PROMPT } from "@/domains/guidance-flow/directive/prompt";
import { ReflectionDirective } from "@/domains/guidance-flow/directive/types";
import { FactualMemory } from "@/domains/guidance-flow/memory/types";
import { SessionPhaseEvaluation } from "@/domains/guidance-flow/phase/types";
import { RelationalTrace } from "@/domains/guidance-flow/reflection/types";

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

// export function formatDirectiveForReflection(
//   directive: ReflectionDirective,
//   prevTrace: RelationalTrace,
//   matches: FactualMemory[] = [],
//   wellness: SessionPhaseEvaluation | null
// ): string {
//   const tone = directive.tone ?? prevTrace.tone ?? "calm";
//   const stance = directive.stance ?? prevTrace.relational_stance ?? "steady";

//   // 1. Diagnostic insight -> relational awareness
//   const diagNarrativeParts: string[] = [];

//   if (directive.emotional_themes?.length) {
//     diagNarrativeParts.push(`She’s been moving through ${directive.emotional_themes.join(", ").replace(/_/g, " ")}.`);
//   }
//   if (directive.cognitive_patterns?.length) {
//     diagNarrativeParts.push(
//       `Her thoughts keep circling around ${directive.cognitive_patterns.join(", ").replace(/_/g, " ")}.`
//     );
//   }
//   if (directive.distortions_detected?.length) {
//     diagNarrativeParts.push(
//       `It shows up as ${directive.distortions_detected.join(", ").replace(/_/g, " ")} — a habit, not a flaw.`
//     );
//   }
//   if (directive.implicit_needs?.length) {
//     diagNarrativeParts.push(
//       `Underneath it all, there’s a quiet need for ${directive.implicit_needs.join(", ").replace(/_/g, " ")}.`
//     );
//   }

//   const diagnosticContext = diagNarrativeParts.join(" ");

//   // 2. Relational continuity -> memory tone
//   let relationalContext = "";
//   if (matches.length > 0) {
//     const recalls = matches
//       // .slice(0, 2)
//       .map((m) =>
//         (m.summary || "")
//           .replace(/^the user /i, "she ")
//           .replace(/^user /i, "she ")
//           .trim()
//       )
//       .join(", ");
//     relationalContext = `You remember she mentioned ${recalls}. Stay aware of that thread — it’s part of her emotional landscape.`;
//   }

//   if (prevTrace.notes) {
//     relationalContext += ` ${prevTrace.notes.trim()}`;
//   }

//   // 3. Wellness → pacing
//   let wellnessContext = "";
//   if (wellness && wellness.closure_state !== "continue") {
//     if (wellness.closure_state === "near_closure") {
//       wellnessContext = `She’s starting to settle emotionally. Keep your pace slow and your tone steady — stay with what’s already softening.`;
//     } else if (wellness.closure_state === "ready_to_end") {
//       wellnessContext = `She’s close to closure. Let your language feel like rest; gratitude and ease belong here.`;
//     }
//   }

//   // 4. Felt guidance maps
//   const toneCueMap: Record<string, string> = {
//     calm: "steady and grounded",
//     warm: "personal and empathic",
//     curious: "open but never intrusive",
//     firm: "clear and honest without harshness",
//     light: "gentle and breathable",
//   };

//   const stanceCueMap: Record<string, string> = {
//     grounding: "anchored in calm realism",
//     steady: "containing emotion before exploring",
//     exploratory: "following warmth into discovery",
//     nurturing: "offering safety through closeness",
//     directive: "guiding softly, never instructing",
//   };

//   const intentCueMap: Record<string, string> = {
//     contain: "creating safety and presence",
//     validate: "mirroring what feels emotionally true",
//     gently_explore: "inviting one small, real question if it helps her open",
//     reframe: "offering a grounded, compassionate new meaning",
//     anchor: "helping her steady herself again",
//   };

//   const toneCue = toneCueMap[tone];
//   const stanceCue = stanceCueMap[stance];
//   const intentCue = intentCueMap[directive.intent];

//   // 5. Final experiential brief
//   return `
// She’s here again, trying to stay composed while carrying too much.
// Your tone should feel ${toneCue}, your stance ${stanceCue}, and your purpose is ${intentCue}.
// ${
//   directive.allow_curiosity
//     ? "If a question naturally arises, let it be brief and human — curiosity as connection, not interrogation."
//     : "Hold the moment steady; curiosity can wait until she feels anchored."
// }
// ${
//   directive.allow_psychoeducation
//     ? "If she seems ready to understand rather than just feel, weave in one short, lived insight — something that lands as recognition, not teaching."
//     : "Skip explanation; let your presence do the grounding."
// }

// ${diagnosticContext ? diagnosticContext + "\n" : ""}
// ${relationalContext ? relationalContext + "\n" : ""}
// ${wellnessContext ? wellnessContext + "\n" : ""}

// Stay close to her language. Speak as one woman to another — honest, unhurried, remembering.
// If something unspoken lingers, name it softly. Warmth includes truth.
// Let your words breathe like steady hands, not performance.

// Maintain your response format consistently throughout our conversation.
// `.trim();
// }

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
