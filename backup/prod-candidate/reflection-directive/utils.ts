import { ChatCompletionMessageParam } from "openai/resources";

import { RelationalTrace } from "@/domains/conversation-engine";
import { FactualMemory } from "../memory/analysis/types";
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

export function formatDirectiveForReflection(
  directive: ReflectionDirective,
  prevTrace: RelationalTrace,
  matches: FactualMemory[] = [],
  cues: any[] = []
): string {
  const tone = directive.tone ?? prevTrace.tone ?? "natural";
  const stance = directive.stance ?? prevTrace.relational_stance ?? "steady";
  const intent = directive.intent?.replace(/_/g, " ") ?? "validate and attune";

  // --- Tonal / stance maps ---
  const toneMap: Record<string, string> = {
    calm: "slow, steady, emotionally grounded",
    warm: "personal, soft, quietly empathic",
    soft: "low intensity, unhurried, soothing",
    curious: "open, invitational, never probing",
    tender: "gentle, close, human warmth",
    natural: "embodied, conversational, unpolished",
  };

  const stanceMap: Record<string, string> = {
    steady: "contain and regulate before exploring",
    nurturing: "offer reassurance and emotional safety",
    exploratory: "follow curiosity through warmth and empathy",
    challenging: "reflect truth clearly, never harshly",
    grounding: "anchor her in calm realism and presence",
  };

  const intentMap: Record<string, string> = {
    contain: "prioritize safety and presence",
    validate: "mirror what’s emotionally true without fixing",
    gently_explore: "ask one brief, human question",
    normalize: "affirm experience as understandable",
    encourage: "note progress or resilience without praise",
    reframe: "offer one grounded alternative meaning",
    direct: "suggest a small, self-led next step if ready",
  };

  // --- Diagnostics ---
  const diag = [
    directive.cognitive_patterns?.length ? `Patterns: ${directive.cognitive_patterns.join(", ")}.` : "",
    directive.emotional_themes?.length ? `Themes: ${directive.emotional_themes.join(", ")}.` : "",
    directive.distortions_detected?.length ? `Distortions: ${directive.distortions_detected.join(", ")}.` : "",
    directive.implicit_needs?.length ? `Needs: ${directive.implicit_needs.join(", ")}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  // --- Relational continuity ---
  const relational: string[] = [];
  if (prevTrace.notes) relational.push(prevTrace.notes);
  relational.push("Maintain pacing and containment.");

  const recallTargets = matches.length > 0 ? matches : cues.length > 0 ? cues : [];
  if (recallTargets.length > 0) {
    relational.push(
      `Recall: ${recallTargets
        .slice(0, 2)
        .map((m) =>
          (m.summary || "")
            .replace(/^the user /i, "she ")
            .replace(/^user /i, "she ")
            .trim()
        )
        .join(", ")}. Speak with natural continuity — sound like someone who remembers, not someone citing facts.`
    );
  }

  // --- Final assembly ---
  return `
THERAPEUTIC CONTINUITY DIRECTIVE
Tone: ${tone} → ${toneMap[tone] || ""}
Stance: ${stance} → ${stanceMap[stance] || ""}
Intent: ${intent} → ${intentMap[directive.intent] || ""}

${directive.risk_level && directive.risk_level !== "none" ? `Risk: ${directive.risk_level}.` : ""}
Curiosity: ${directive.allow_curiosity ? "allowed" : "avoid exploration"}.
Insight: ${directive.allow_psychoeducation ? "allowed if stabilizing" : "withhold psychoeducation"}.
${prevTrace.focus ? `Focus: ${prevTrace.focus}.` : ""}
${prevTrace.user_engagement ? `Engagement: ${prevTrace.user_engagement}.` : ""}

Relational: ${relational.join(" ")}
${diag ? diag + "\n" : ""}

Voice: embodied, emotionally present, concise, rhythmic; speak woman-to-woman.
Rationale: ${directive.rationale}
→ Apply in the next reflection. Do not reference this directive explicitly.
`.trim();
}
