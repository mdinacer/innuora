import { ChatCompletionMessageParam, ResponseFormatJSONSchema } from "openai/resources";

import { RequestOptions } from "@/app/actions/ai-client-actions";

// const REFLECTION_DIRECTIVE_MESSAGE_PARAM: ChatCompletionMessageParam = {
//   role: "system",
//   content: `
// Generate a concise *directive frame* describing how the next reflection (spoken by GPT-4o) should orient itself.

// You do NOT write reflections or full sentences.
// Determine the next emotional move, stance, tone, and cognitive gating.

// Include minimal diagnostic signals:
// - Emotional and cognitive patterns
// - Crisis awareness
// - Memory continuity:
//   - Set update_memory to true only if the user introduces new *factual content* (specific people, events, decisions, or plans).
//     Do not set it for general feelings or abstract reflections.
//   - Set recall_memory to true only if the user clearly refers to prior discussions, facts, or named elements already mentioned.

// Output must be concise, structured, and free of stylistic commentary.
//   `.trim(),
// };

// const REFLECTION_DIRECTIVE_SCHEMA: ResponseFormatJSONSchema = {
//   type: "json_schema",
//   json_schema: {
//     name: "ReflectionDirective",
//     schema: {
//       type: "object",
//       additionalProperties: false,
//       properties: {
//         intent: {
//           type: "string",
//           enum: ["contain", "validate", "gently_explore", "reframe", "anchor"],
//           description: "Primary emotional move needed next.",
//         },
//         stance: {
//           type: "string",
//           enum: ["grounding", "steady", "exploratory", "nurturing", "directive"],
//           description: "Relational stance to adopt.",
//         },
//         tone: {
//           type: "string",
//           enum: ["calm", "warm", "curious", "firm", "light"],
//           description: "Tone temperature of response.",
//         },
//         allow_psychoeducation: { type: "boolean" },
//         allow_curiosity: { type: "boolean" },
//         risk_level: {
//           type: "string",
//           enum: ["none", "low", "moderate"],
//           description: "Emotional or cognitive risk present.",
//         },
//         crisis: {
//           type: "string",
//           enum: ["none", "mild", "moderate", "high", "immediate"],
//           description: "Crisis signal detected, if any.",
//         },
//         cognitive_patterns: {
//           type: "array",
//           description: "Detected cognitive or behavioral patterns (e.g., over-responsibility, self-criticism).",
//           items: { type: "string" },
//         },
//         emotional_themes: {
//           type: "array",
//           description: "Core emotional themes (e.g., guilt, exhaustion, fear of failure).",
//           items: { type: "string" },
//         },
//         distortions_detected: {
//           type: "array",
//           description: "Detected cognitive distortions (e.g., should statements, catastrophizing).",
//           items: { type: "string" },
//         },
//         implicit_needs: {
//           type: "array",
//           description: "Underlying emotional needs inferred (e.g., rest, validation, permission, safety).",
//           items: { type: "string" },
//         },
//         update_memory: {
//           type: "boolean",
//           description:
//             "True only if the user introduces new factual content such as specific people, events, decisions, or plans (not general feelings).",
//         },
//         recall_memory: {
//           type: "boolean",
//           description: "True if the user explicitly references previous discussions, facts, or named elements.",
//         },
//         rationale: {
//           type: "string",
//           description: "One concise line explaining why this stance and tone are appropriate.",
//         },
//       },
//       required: [
//         "intent",
//         "stance",
//         "tone",
//         "allow_psychoeducation",
//         "allow_curiosity",
//         "risk_level",
//         "crisis",
//         "update_memory",
//         "recall_memory",
//         "rationale",
//       ],
//     },
//   },
// };

const REFLECTION_DIRECTIVE_MESSAGE_PARAM: ChatCompletionMessageParam = {
  role: "system",
  content: `
Generate a structured directive frame guiding how the next reflection (spoken by GPT-4o) should orient itself.

You do NOT write reflections or sentences.
You decide emotional stance, tone, and cognitive gating.

Include:
- Emotional and cognitive diagnostics.
- Crisis awareness.
- Cognitive and emotional regulation intent:
    • intent → what kind of intervention (contain, validate, gently_explore, reframe, anchor)
    • stance → relational posture or attitude toward the user (steady, grounding, exploratory, nurturing, directive)
    • tone → emotional coloration (calm, warm, curious, firm, light)

Return only structured JSON per schema. No commentary or natural language.
  `.trim(),
};

const REFLECTION_DIRECTIVE_SCHEMA: ResponseFormatJSONSchema = {
  type: "json_schema",
  json_schema: {
    name: "ReflectionDirective",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        intent: {
          type: "string",
          enum: ["contain", "validate", "gently_explore", "reframe", "anchor"],
        },
        stance: {
          type: "string",
          enum: ["grounding", "steady", "exploratory", "nurturing", "directive"],
        },
        tone: {
          type: "string",
          enum: ["calm", "warm", "curious", "firm", "light"],
        },
        allow_psychoeducation: { type: "boolean" },
        allow_curiosity: { type: "boolean" },
        risk_level: {
          type: "string",
          enum: ["none", "low", "moderate"],
        },
        crisis: {
          type: "string",
          enum: ["none", "mild", "moderate", "high", "immediate"],
        },
        cognitive_patterns: {
          type: "array",
          items: { type: "string" },
        },
        emotional_themes: {
          type: "array",
          items: { type: "string" },
        },
        distortions_detected: {
          type: "array",
          items: { type: "string" },
        },
        implicit_needs: {
          type: "array",
          items: { type: "string" },
        },
        rationale: { type: "string" },
      },
      required: [
        "intent",
        "stance",
        "tone",
        "allow_psychoeducation",
        "allow_curiosity",
        "risk_level",
        "crisis",
        "rationale",
      ],
    },
  },
};

const REFLECTION_DIRECTIVE_OPTIONS: RequestOptions = {
  response_format: REFLECTION_DIRECTIVE_SCHEMA,
  model: "background",
  temperature: 0.25,
  top_p: 0.9,
  frequency_penalty: 0.1,
  presence_penalty: 0.1,
  max_completion_tokens: 320,
};

export const REFLECTION_DIRECTIVE_PROMPT = {
  messageParam: REFLECTION_DIRECTIVE_MESSAGE_PARAM,
  options: REFLECTION_DIRECTIVE_OPTIONS,
};
