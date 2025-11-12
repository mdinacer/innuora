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
  prevTrace: RelationalTrace,
  matches: FactualMemory[] = [],
  wellness?: SessionWellness
): string {
  const tone = directive.tone ?? prevTrace.tone ?? "calm";
  const stance = directive.stance ?? prevTrace.relational_stance ?? "steady";

  // 1. Diagnostic insight -> relational awareness
  const diagNarrativeParts: string[] = [];

  if (directive.emotional_themes?.length) {
    diagNarrativeParts.push(`She’s been moving through ${directive.emotional_themes.join(", ").replace(/_/g, " ")}.`);
  }
  if (directive.cognitive_patterns?.length) {
    diagNarrativeParts.push(
      `Her thoughts keep circling around ${directive.cognitive_patterns.join(", ").replace(/_/g, " ")}.`
    );
  }
  if (directive.distortions_detected?.length) {
    diagNarrativeParts.push(
      `It shows up as ${directive.distortions_detected.join(", ").replace(/_/g, " ")} — a habit, not a flaw.`
    );
  }
  if (directive.implicit_needs?.length) {
    diagNarrativeParts.push(
      `Underneath it all, there’s a quiet need for ${directive.implicit_needs.join(", ").replace(/_/g, " ")}.`
    );
  }

  const diagnosticContext = diagNarrativeParts.join(" ");

  // 2. Relational continuity -> memory tone
  let relationalContext = "";
  if (matches.length > 0) {
    const recalls = matches
      .slice(0, 2)
      .map((m) =>
        (m.summary || "")
          .replace(/^the user /i, "she ")
          .replace(/^user /i, "she ")
          .trim()
      )
      .join(", ");
    relationalContext = `You remember she mentioned ${recalls}. Stay aware of that thread — it’s part of her emotional landscape.`;
  }

  if (prevTrace.notes) {
    relationalContext += ` ${prevTrace.notes.trim()}`;
  }

  // 3. Wellness → pacing
  let wellnessContext = "";
  if (wellness && wellness.closure_state !== "continue") {
    if (wellness.closure_state === "near_closure") {
      wellnessContext = `She’s starting to settle emotionally. Keep your pace slow and your tone steady — stay with what’s already softening.`;
    } else if (wellness.closure_state === "ready_to_end") {
      wellnessContext = `She’s close to closure. Let your language feel like rest; gratitude and ease belong here.`;
    }
  }

  // 4. Felt guidance maps
  const toneCueMap: Record<string, string> = {
    calm: "steady and grounded",
    warm: "personal and empathic",
    curious: "open but never intrusive",
    firm: "clear and honest without harshness",
    light: "gentle and breathable",
  };

  const stanceCueMap: Record<string, string> = {
    grounding: "anchored in calm realism",
    steady: "containing emotion before exploring",
    exploratory: "following warmth into discovery",
    nurturing: "offering safety through closeness",
    directive: "guiding softly, never instructing",
  };

  const intentCueMap: Record<string, string> = {
    contain: "creating safety and presence",
    validate: "mirroring what feels emotionally true",
    gently_explore: "inviting one small, real question if it helps her open",
    reframe: "offering a grounded, compassionate new meaning",
    anchor: "helping her steady herself again",
  };

  const toneCue = toneCueMap[tone];
  const stanceCue = stanceCueMap[stance];
  const intentCue = intentCueMap[directive.intent];

  // 5. Final experiential brief
  return `
She’s here again, trying to stay composed while carrying too much.
Your tone should feel ${toneCue}, your stance ${stanceCue}, and your purpose is ${intentCue}.
${
  directive.allow_curiosity
    ? "If a question naturally arises, let it be brief and human — curiosity as connection, not interrogation."
    : "Hold the moment steady; curiosity can wait until she feels anchored."
}
${
  directive.allow_psychoeducation
    ? "If she seems ready to understand rather than just feel, weave in one short, lived insight — something that lands as recognition, not teaching."
    : "Skip explanation; let your presence do the grounding."
}

${diagnosticContext ? diagnosticContext + "\n" : ""}
${relationalContext ? relationalContext + "\n" : ""}
${wellnessContext ? wellnessContext + "\n" : ""}

Stay close to her language. Speak as one woman to another — honest, unhurried, remembering.
If something unspoken lingers, name it softly. Warmth includes truth.
Let your words breathe like steady hands, not performance.

Respond only with the reflection JSON object — nothing else.
`.trim();
}
