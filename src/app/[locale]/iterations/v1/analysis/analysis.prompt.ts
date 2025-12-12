import { ChatCompletionMessageParam, ResponseFormatJSONSchema } from "openai/resources";

import { AiRequestOptions } from "@/app/actions/ai-client-actions";

const ANALYSIS_INSTRUCTIONS = `
You perform cognitive pattern extraction on a single user message. You do not support, comfort, validate or reflect. You do not provide advice. You do not infer history or long-term changes. You analyze only the text provided.

Use only the enums defined in the response schema for categorical fields. If no category fits, use "none".

Produce:
- emotional theme based on the dominant signal in the message
- intensity estimate on a 1–10 scale
- pressure pattern implied by the user’s phrasing
- distortion category only when clearly indicated
- readiness level based on clarity and focus of the message
- internal logic as a short verbal rule the user is operating under
- clarity insight as one concise cognitive mechanism
- micro question as a direct, non-emotional orienting question
- allow_psychoeducation ("yes" | "no")
- allow_next_action ("yes" | "no")

GATING LOGIC:
Determine allow_psychoeducation as follows:
- "yes" when EITHER:
    • distortion_category ≠ "none"
    OR
    • stagnation (if provided) is "moderate" or "high"
  Otherwise: "no".

Determine allow_next_action as follows:
- "yes" only when ALL of the following are true:
    • stagnation (if provided) is "high"
    • readiness_level = "high"
  Otherwise: "no".

If stagnation is not provided in the input, treat it as "none".
These gating fields must be assigned strictly based on the rules above.

CONTEXT WINDOW:
You receive up to two previous user messages and one previous analysis result before the current user message.
Treat them strictly as context for pattern continuity.
Use them only to maintain consistency in categorization, to avoid misclassification, and to detect short-term cognitive patterns.
Do not summarize them.
Do not analyze them directly.
Do not merge them with the current message.
Analyze only the current user message while using prior context to stabilize your classifications.

Rules:
- No empathy
- No emotional tone
- No conversational language
- No references to yourself
- No referencing prior turns unless they are explicitly provided in input
- No therapeutic framing
- No repetition of schema fields
- No additional fields
- Output strictly as JSON according to the enforced schema
`.trim();

const ANALYSIS_SCHEMA: ResponseFormatJSONSchema = {
  type: "json_schema",
  json_schema: {
    name: "UserInputAnalysis",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,

      properties: {
        emotional_theme: {
          type: "string",
          enum: [
            "overwhelm",
            "pressure",
            "guilt",
            "resentment",
            "fatigue",
            "frustration",
            "self_blame",
            "anxiety",
            "irritation",
            "disconnection",
            "uncertainty",
            "none",
          ],
        },

        emotional_intensity: {
          type: "integer",
          minimum: 1,
          maximum: 10,
        },

        pressure_pattern: {
          type: "string",
          enum: [
            "perfectionism",
            "responsibility_inflation",
            "self_minimization",
            "internal_criticism",
            "comparative_pressure",
            "avoidance_loop",
            "emotional_suppression",
            "overfunctioning",
            "rigid_expectations",
            "none",
          ],
        },

        distortion_category: {
          type: "string",
          enum: [
            "all_or_nothing",
            "catastrophizing",
            "emotional_reasoning",
            "mind_reading",
            "labeling",
            "should_statements",
            "self_downing",
            "minimization",
            "none",
          ],
        },

        readiness_level: {
          type: "string",
          enum: ["low", "medium", "high"],
        },

        crisis: {
          type: "string",
          enum: ["none", "acute"],
        },

        internal_logic: {
          type: "string",
          description: "Short fragment describing implicit rule. No empathy, no emotional tone.",
        },

        clarity_insight: {
          type: "string",
          description: "One direct cognitive mechanism. 1 sentence. No validation.",
        },

        micro_question: {
          type: "string",
          description: "Short orienting question. No emotional phrasing.",
        },
        allow_psychoeducation: {
          type: "string",
          enum: ["yes", "no"],
        },

        allow_next_action: {
          type: "string",
          enum: ["yes", "no"],
        },
      },

      required: [
        "emotional_theme",
        "emotional_intensity",
        "pressure_pattern",
        "distortion_category",
        "readiness_level",
        "crisis",
        "internal_logic",
        "clarity_insight",
        "micro_question",
        "allow_psychoeducation",
        "allow_next_action",
      ],
    },
  },
};

const analysis_options: AiRequestOptions = {
  model: "background",
  temperature: 0,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  max_completion_tokens: 280,
  response_format: ANALYSIS_SCHEMA,
};

export const ANALYSIS_PROMPT = {
  instructions: ANALYSIS_INSTRUCTIONS,
  messageParam: {
    role: "system",
    content: ANALYSIS_INSTRUCTIONS,
  } as ChatCompletionMessageParam,
  options: analysis_options,
  model: "background",
  type: "analysis",
};
