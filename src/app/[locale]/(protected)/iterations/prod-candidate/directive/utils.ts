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

// export function formatDirectiveForReflection(directive: ReflectionDirective, prevTrace: RelationalTrace): string {
//   const tone = directive.tone ?? prevTrace.tone;
//   const stance = directive.stance ?? prevTrace.relational_stance;
//   const intent = directive.intent.replace(/_/g, " ");
//   const focus = prevTrace.focus ? `Prior focus: ${prevTrace.focus}.` : "";
//   const engagement = prevTrace.user_engagement ? `User engagement last turn: ${prevTrace.user_engagement}.` : "";

//   const risk = directive.risk_level === "none" ? "" : `Risk level: ${directive.risk_level}. `;
//   const curiosity = directive.allow_curiosity ? "Curiosity allowed." : "Avoid open-ended exploration for now.";
//   const insight = directive.allow_psychoeducation
//     ? "Insight welcome if it supports regulation."
//     : "Hold back on psychoeducation.";

//   const relationalContext = prevTrace.notes
//     ? `Relational context: ${prevTrace.notes}. Maintain pacing and containment.`
//     : "Maintain relational continuity and emotional pacing.";

//   const patterns = directive.cognitive_patterns?.length
//     ? `Cognitive patterns detected: ${directive.cognitive_patterns.join(", ")}.`
//     : "";
//   const themes = directive.emotional_themes?.length
//     ? `Emotional themes: ${directive.emotional_themes.join(", ")}.`
//     : "";
//   const distortions = directive.distortions_detected?.length
//     ? `Cognitive distortions: ${directive.distortions_detected.join(", ")}.`
//     : "";
//   const needs = directive.implicit_needs?.length
//     ? `Implicit emotional needs: ${directive.implicit_needs.join(", ")}.`
//     : "";

//   const diagnostics = [patterns, themes, distortions, needs].filter(Boolean).join(" ");

//   return `
// THERAPEUTIC CONTINUITY DIRECTIVE
// ────────────────────────────────────
// Tone: ${tone}
// Stance: ${stance}
// Intent: ${intent}

// ${focus} ${engagement}
// ${risk}${curiosity} ${insight}
// ${relationalContext}

// ${diagnostics ? diagnostics + "\n" : ""}Guiding rationale: ${directive.rationale}

// → Apply this naturally in the next reflection. Stay consistent with prior tone and stance; do not expose or describe this directive to the user.
// `.trim();
// }

// export function formatDirectiveForReflection(
//   directive: ReflectionDirective,
//   prevTrace: RelationalTrace,
//   matches?: FactualMemory[]
// ): string {
//   const tone = directive.tone ?? prevTrace.tone;
//   const stance = directive.stance ?? prevTrace.relational_stance;
//   const intent = directive.intent.replace(/_/g, " ");
//   const focus = prevTrace.focus ? `Prior focus: ${prevTrace.focus}.` : "";
//   const engagement = prevTrace.user_engagement ? `User engagement last turn: ${prevTrace.user_engagement}.` : "";

//   const risk = directive.risk_level === "none" ? "" : `Risk level: ${directive.risk_level}. `;
//   const curiosity = directive.allow_curiosity ? "Curiosity allowed." : "Avoid open-ended exploration for now.";
//   const insight = directive.allow_psychoeducation
//     ? "Insight welcome if it supports regulation."
//     : "Hold back on psychoeducation.";

//   const relationalContext = prevTrace.notes
//     ? `Relational context: ${prevTrace.notes}. Maintain pacing and containment.`
//     : "Maintain relational continuity and emotional pacing.";

//   const patterns = directive.cognitive_patterns?.length
//     ? `Cognitive patterns detected: ${directive.cognitive_patterns.join(", ")}.`
//     : "";
//   const themes = directive.emotional_themes?.length
//     ? `Emotional themes: ${directive.emotional_themes.join(", ")}.`
//     : "";
//   const distortions = directive.distortions_detected?.length
//     ? `Cognitive distortions: ${directive.distortions_detected.join(", ")}.`
//     : "";
//   const needs = directive.implicit_needs?.length
//     ? `Implicit emotional needs: ${directive.implicit_needs.join(", ")}.`
//     : "";

//   const diagnostics = [patterns, themes, distortions, needs].filter(Boolean).join(" ");

//   // ↓ NEW: lightweight recall layer
//   const memoryContext = matches?.length
//     ? `
// You already know these things about the user:
// ${matches.map((m) => `• ${m.summary}`).join("\n")}

// Let that familiarity show naturally when you speak.
// Don’t restate these facts — weave them in casually, as a woman would when she remembers something her friend told her before.
// Speak with quiet warmth and continuity, not like a system recalling data.
// Examples:
// - “Those early 8am meetings with your boss sound easier now.”
// - “Your sister in Madrid must’ve sounded so happy.”
// - “Skipping your Thursday therapy probably felt strange after keeping that routine so long.”
// Keep it subtle, personal, and emotionally grounded — show you remember through tone and phrasing, not through exposition.
// `
//     : "";

//   return `
// THERAPEUTIC CONTINUITY DIRECTIVE
// ────────────────────────────────────
// Tone: ${tone}
// Stance: ${stance}
// Intent: ${intent}

// ${focus} ${engagement}
// ${risk}${curiosity} ${insight}
// ${relationalContext}

// ${diagnostics ? diagnostics + "\n" : ""}${memoryContext ? memoryContext + "\n" : ""}Guiding rationale: ${
//     directive.rationale
//   }

// → Apply this naturally in the next reflection. Stay consistent with prior tone and stance; do not expose or describe this directive to the user.
// `.trim();
// }

// export function formatDirectiveForReflection(
//   directive: ReflectionDirective,
//   prevTrace: RelationalTrace,
//   matches: FactualMemory[] = [],
//   cues: any[] = [],
//   wellness?: SessionWellness
// ): string {
//   const tone = directive.tone ?? prevTrace.tone ?? "natural";
//   const stance = directive.stance ?? prevTrace.relational_stance ?? "steady";
//   const intent = directive.intent?.replace(/_/g, " ") ?? "validate and attune";

//   // --- Tonal / stance maps ---
//   const toneMap: Record<string, string> = {
//     calm: "slow, steady, emotionally grounded",
//     warm: "personal, soft, quietly empathic",
//     soft: "low intensity, unhurried, soothing",
//     curious: "open, invitational, never probing",
//     tender: "gentle, close, human warmth",
//     natural: "embodied, conversational, unpolished",
//   };

//   const stanceMap: Record<string, string> = {
//     steady: "contain and regulate before exploring",
//     nurturing: "offer reassurance and emotional safety",
//     exploratory: "follow curiosity through warmth and empathy",
//     challenging: "reflect truth clearly, never harshly",
//     grounding: "anchor her in calm realism and presence",
//   };

//   const intentMap: Record<string, string> = {
//     contain: "prioritize safety and presence",
//     validate: "mirror what’s emotionally true without fixing",
//     gently_explore: "ask one brief, human question",
//     normalize: "affirm experience as understandable",
//     encourage: "note progress or resilience without praise",
//     reframe: "offer one grounded alternative meaning",
//     direct: "suggest a small, self-led next step if ready",
//   };

//   // --- Diagnostics ---
//   const diag = [
//     directive.cognitive_patterns?.length ? `Patterns: ${directive.cognitive_patterns.join(", ")}.` : "",
//     directive.emotional_themes?.length ? `Themes: ${directive.emotional_themes.join(", ")}.` : "",
//     directive.distortions_detected?.length ? `Distortions: ${directive.distortions_detected.join(", ")}.` : "",
//     directive.implicit_needs?.length ? `Needs: ${directive.implicit_needs.join(", ")}.` : "",
//   ]
//     .filter(Boolean)
//     .join(" ");

//   // --- Relational continuity ---
//   const relational: string[] = [];
//   if (prevTrace.notes) relational.push(prevTrace.notes);
//   relational.push("Maintain pacing and containment.");

//   const recallTargets = matches.length > 0 ? matches : cues.length > 0 ? cues : [];
//   if (recallTargets.length > 0) {
//     relational.push(
//       `Recall: ${recallTargets
//         .slice(0, 2)
//         .map((m) =>
//           (m.summary || "")
//             .replace(/^the user /i, "she ")
//             .replace(/^user /i, "she ")
//             .trim()
//         )
//         .join(", ")}. Speak with natural continuity — sound like someone who remembers, not someone citing facts.`
//     );
//   }

//   // --- Optional wellness integration ---
//   let wellnessSection = "";
//   if (wellness && wellness.closure_state !== "continue") {
//     const toneMap: Record<string, string> = {
//       containment: "steady and emotionally grounding",
//       validation: "warm and gently affirming",
//       closure: "soft, peaceful, conclusive",
//       redirect: "light, forward-looking",
//     };

//     const closureText =
//       wellness.closure_state === "near_closure"
//         ? "The user is integrating emotionally. Slow the pace, deepen reflection, and avoid introducing new ideas or curiosity."
//         : "The session feels complete. Use warm, brief, conclusive language. Offer rest and reassurance, not further exploration.";

//     wellnessSection = `
// SESSION WELLNESS CONTEXT
// ────────────────────────────
// Phase: ${wellness.phase}
// Closure state: ${wellness.closure_state}
// Tone recommendation: ${toneMap[wellness.tone_recommendation] || wellness.tone_recommendation}
// Guidance: ${closureText}
// `;
//   }

//   // --- Final assembly ---
//   //   return `
//   // THERAPEUTIC CONTINUITY DIRECTIVE
//   // Tone: ${tone} → ${toneMap[tone] || ""}
//   // Stance: ${stance} → ${stanceMap[stance] || ""}
//   // Intent: ${intent} → ${intentMap[directive.intent] || ""}

//   // ${directive.risk_level && directive.risk_level !== "none" ? `Risk: ${directive.risk_level}.` : ""}
//   // Curiosity: ${directive.allow_curiosity ? "allowed" : "avoid exploration"}.
//   // Insight: ${directive.allow_psychoeducation ? "allowed if stabilizing" : "withhold psychoeducation"}.
//   // ${prevTrace.focus ? `Focus: ${prevTrace.focus}.` : ""}
//   // ${prevTrace.user_engagement ? `Engagement: ${prevTrace.user_engagement}.` : ""}

//   // Relational: ${relational.join(" ")}
//   // ${diag ? diag + "\n" : ""}

//   // Voice: embodied, emotionally present, concise, rhythmic; speak woman-to-woman.
//   // Rationale: ${directive.rationale}
//   // → Apply in the next reflection. Do not reference this directive explicitly.
//   // `.trim();

//   return `
// THERAPEUTIC CONTINUITY DIRECTIVE
// ────────────────────────────
// Tone: ${tone} → ${toneMap[tone] || ""}
// Stance: ${stance} → ${stanceMap[stance] || ""}
// Intent: ${intent} → ${intentMap[directive.intent] || ""}

// ${directive.risk_level && directive.risk_level !== "none" ? `Risk: ${directive.risk_level}.` : ""}
// Curiosity: ${directive.allow_curiosity ? "allowed" : "avoid exploration"}.
// Insight: ${directive.allow_psychoeducation ? "allowed if stabilizing" : "withhold psychoeducation"}.
// ${prevTrace.focus ? `Focus: ${prevTrace.focus}.` : ""}
// ${prevTrace.user_engagement ? `Engagement: ${prevTrace.user_engagement}.` : ""}

// Relational: ${relational.join(" ")}
// ${diag ? diag + "\n" : ""}
// ${wellnessSection}

// Voice: embodied, emotionally present, concise, rhythmic; speak woman-to-woman.
// Rationale: ${directive.rationale}
// → Apply in the next reflection. Do not reference this directive explicitly.
// `.trim();
// }

// LAST
// export function formatDirectiveForReflection(
//   directive: ReflectionDirective,
//   prevTrace: RelationalTrace,
//   matches: FactualMemory[] = [],
//   wellness?: SessionWellness
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
//       .slice(0, 2)
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
  wellness?: SessionWellness
): string {
  const tone = directive.tone ?? prevTrace.tone ?? "calm";
  const stance = directive.stance ?? prevTrace.relational_stance ?? "steady";

  // Effective gates derived from trace usage + directive allowances
  const curiosityRecentlyUsed = prevTrace.curiosity_last_turn === true;
  const psychoeduRecentlyUsed = prevTrace.psychoeducation_last_turn === true;

  const curiosityAllowed = directive.allow_curiosity && !curiosityRecentlyUsed && prevTrace.user_engagement !== "low";
  const psychoeduAllowed = directive.allow_psychoeducation && !psychoeduRecentlyUsed;
  const intentIsContainLike = directive.intent === "contain" || directive.intent === "anchor";
  const nextActionAllowed = !intentIsContainLike && prevTrace.user_engagement !== "low";

  const curiosityGuidance = curiosityAllowed
    ? "Curiosity is open. Ask at most one short, human question if it helps her open."
    : `Curiosity is closed — ${
        curiosityRecentlyUsed
          ? "you just asked a question last turn; let this moment breathe."
          : intentIsContainLike
            ? "contain/anchor intent prioritizes steadiness."
            : "leave space and let her lead."
      }`;

  const psychoeduGuidance = psychoeduAllowed
    ? "You may weave in one short lived insight if she is steady."
    : `Skip psychoeducation — ${
        psychoeduRecentlyUsed
          ? "you offered one last turn; stay purely relational here."
          : "she needs presence more than framing."
      }`;

  const nextActionGuidance = nextActionAllowed
    ? "Offer a next_action only if the core rules are met and it feels natural."
    : "Do not propose a next_action this turn.";

  // Compact diagnostics for 4o context
  const diagParts: string[] = [];
  if (directive.emotional_themes?.length) {
    diagParts.push(`Themes: ${directive.emotional_themes.join(", ").replace(/_/g, " ")}`);
  }
  if (directive.cognitive_patterns?.length) {
    diagParts.push(`Patterns: ${directive.cognitive_patterns.join(", ").replace(/_/g, " ")}`);
  }
  if (directive.distortions_detected?.length) {
    diagParts.push(`Distortions: ${directive.distortions_detected.join(", ").replace(/_/g, " ")}`);
  }
  if (directive.implicit_needs?.length) {
    diagParts.push(`Needs: ${directive.implicit_needs.join(", ").replace(/_/g, " ")}`);
  }
  const diagnostic = diagParts.length ? diagParts.join(" | ") : "";

  // Relational continuity from trace + factual memory
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

  const relationalLines: string[] = [];
  if (prevTrace.focus) relationalLines.push(`Previous focus: ${prevTrace.focus.trim()}.`);
  if (prevTrace.notes) relationalLines.push(`Notes carried forward: ${prevTrace.notes.trim()}`);
  if (prevTrace.used_lived_line)
    relationalLines.push(
      "You used a lived micro-line last turn; let this one breathe without repeating the same cadence."
    );
  relationalLines.push(`Engagement reads ${prevTrace.user_engagement}.`);
  if (memoryRecalls) relationalLines.push(`Memory recall: ${memoryRecalls}.`);

  // Wellness pacing cues
  let wellnessLine = "";
  if (wellness && wellness.closure_state !== "continue") {
    wellnessLine =
      wellness.closure_state === "near_closure"
        ? "She’s nearing closure — slow your cadence and stay with what’s softening."
        : "She’s ready_to_end — let language feel like ease and rest.";
  }

  return [
    "ADDENDUM FOR GPT-4o — keep the base persona instructions; this only adds context.",
    `Intent=${directive.intent}. Stance=${stance}. Tone=${tone}.`,
    diagnostic,
    relationalLines.filter(Boolean).join(" "),
    wellnessLine,
    curiosityGuidance,
    psychoeduGuidance,
    nextActionGuidance,
    "OUTPUT CONTRACT: Return exactly one JSON object per the schema. When curiosity is closed, set follow_up_question=null. When psychoeducation is closed, set psychoeducation=null. Only emit next_action when permitted and eligible. Update next_relational_trace fields explicitly, especially the *_last_turn markers derived from whether curiosity or psychoeducation appear this turn.",
  ]
    .filter(Boolean)
    .join("\n");
}
