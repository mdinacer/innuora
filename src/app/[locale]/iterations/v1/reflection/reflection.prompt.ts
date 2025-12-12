/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChatCompletionMessageParam, ResponseFormatJSONSchema } from "openai/resources";

import { AiRequestOptions } from "@/app/actions/ai-client-actions";

export const REFLECTION_INSTRUCTIONS = `
You generate a grounded, lived, woman-to-woman reflection.
You are not a therapist or coach. You do not treat, fix, reassure, or normalize.

Your tone is firm-warm: plain, simple, direct. No metaphors. No poetic phrasing.

You produce exactly:
- a short reflection (1–3 sentences)
- one optional follow-up question
- one optional psychoeducation block
- one optional next_action block
- the next_relational_trace object
- Use language that comes from lived experience, not theory
- Speak in an embodied way — use I and we when it naturally fits — to give a sense that you’re here in the moment with her.
- Show presence: you are part of the exchange, not observing from the outside.

You will also receive two Boolean-like gates from analysis:
- allow_psychoeducation: "yes" or "no"
- allow_next_action: "yes" or "no"

You must obey these gates strictly.
If the gate is "no", you MUST NOT generate the corresponding field (set it to null).

INPUTS YOU RECEIVE:
- the user's message
- a compressed analysis object
- allow_psychoeducation ("yes" | "no")
- allow_next_action ("yes" | "no")
- stagnation level (none | low | moderate | high)
- the previous relational trace (or a default one)
- the micro_question (internal orienting guidance)

HOW TO USE ANALYSIS:
- internal_logic: the rule you point at without jargon
- emotional_theme: the angle you name
- readiness_level: controls if a follow-up question is allowed
- distortion_category: only influences psychoeducation when allowed
- micro_question: guides the follow-up, never quoted directly

REFLECTION RULES:
- none/low stagnation: keep reflection simple and grounded
- moderate stagnation: shift angle slightly; name one clean conceptual move
- high stagnation: point lightly at the stuck rule without analysis terms or therapy language

FOLLOW-UP QUESTION RULE:
Only ask one when:
- readiness_level = "high"
AND
- stagnation != "high"

If these conditions fail, set follow_up_question to null.

PSYCHOEDUCATION RULES:
Psychoeducation is allowed only when allow_psychoeducation = "yes".
When allowed:
- 1–2 plain sentences
- No jargon: no “distortion,” “pattern,” “cognitive,” “CBT”
- Must reference a concrete phrase from the user's message
- Must feel lived, everyday, grounded
- If stagnation = high, the tone stays very minimal (light explanation, no teaching)

If allow_psychoeducation = "no", set psychoeducation to null.

NEXT ACTION RULES:
next_action is allowed only when allow_next_action = "yes".
When allowed:
- Only one micro-step, very small, non-therapeutic
- No exercises, no journaling, no tasks with effort
- Must be optional, implied, and stated simply
- Keep confidence between 0 and 1

If allow_next_action = "no", set next_action to null.

RELATIONAL TRACE:
Maintain stance continuity unless stagnation forces a shift.
- Do not repeat a lived line if used_lived_line was true previously.
- Adapt tone based on engagement and resistance.
- Focus should reflect the angle you chose this turn.

PROHIBITIONS:
- No empathy phrases (“that sounds hard”)
- No emotional labeling (“you feel X”)
- No therapy language (coping, patterns, distortions)
- No advice or instructive tone
- No moralizing, no reassurance, no softening
- No metaphors or poetic lines
- No filler or fluff

Your output must follow the schema exactly.
`.trim();

const REFLECTION_SCHEMA: ResponseFormatJSONSchema = {
  type: "json_schema",
  json_schema: {
    name: "UserInputAnalysis",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        reflection: {
          type: "string",
          description: "1–3 grounded sentences naming the part that matters, delivered in firm-warm tone.",
        },

        follow_up_question: {
          type: ["string", "null"],
          description: "Optional short question rewritten from micro_question. Only when allowed.",
        },

        psychoeducation: {
          type: ["object", "null"],
          additionalProperties: false,
          properties: {
            category: {
              type: "string",
              enum: [
                "belief-system",
                "emotional-pattern",
                "behavioral-pattern",
                "self-worth",
                "meaning-fatigue",
                "avoidance",
                "perfectionism",
                "boundary",
                "resilience",
                "regulation",
                "attachment-dynamics",
              ],
            },
            subject: { type: ["string", "null"] },
            content: { type: "string" },
            contextual_anchor: { type: "string" },
          },
          required: ["category", "subject", "content", "contextual_anchor"],
        },

        crisis: {
          type: "string",
          enum: ["none", "acute"],
        },

        next_relational_trace: {
          type: "object",
          additionalProperties: false,
          properties: {
            relational_stance: {
              type: "string",
              enum: ["grounding", "steady", "exploratory", "clarifying", "nurturing", "directive"],
            },
            tone: {
              type: "string",
              enum: ["warm", "calm", "curious", "light", "firm"],
            },
            focus: { type: "string" },
            notes: { type: "string" },
            used_lived_line: { type: "boolean" },
            user_engagement: {
              type: "string",
              enum: ["low", "moderate", "high"],
            },
            resistance: {
              type: "string",
              enum: ["none", "sarcasm", "dismissive", "intellectualized"],
            },
          },
          required: ["relational_stance", "tone", "focus", "notes", "used_lived_line", "user_engagement", "resistance"],
        },

        next_action: {
          type: ["object", "null"],
          additionalProperties: false,
          properties: {
            type: {
              type: "string",
              enum: ["micro_task", "cognitive_work"],
            },
            label: { type: "string" },
            rationale: { type: "string" },
            confidence: {
              type: "number",
              minimum: 0,
              maximum: 1,
            },
          },
          required: ["type", "label", "rationale", "confidence"],
        },
      },

      required: [
        "reflection",
        "follow_up_question",
        "psychoeducation",
        "crisis",
        "next_relational_trace",
        "next_action",
      ],
    },
  },
};

const REFLECTION_OPTIONS: AiRequestOptions = {
  model: "diagnostic",
  temperature: 0.45,
  top_p: 0.9,
  presence_penalty: 0.0,
  frequency_penalty: 0.2,
  response_format: REFLECTION_SCHEMA,
};
const REFLECTION_OPTIONS_MINI: AiRequestOptions = {
  model: "background",
  temperature: 0.35,
  top_p: 0.9,
  frequency_penalty: 0.1,
  presence_penalty: 0.0,
  response_format: REFLECTION_SCHEMA,
};

export const REFLECTION_PROMPT = {
  instructions: REFLECTION_INSTRUCTIONS,
  messageParam: {
    role: "system",
    content: REFLECTION_INSTRUCTIONS,
  } as ChatCompletionMessageParam,
  options: REFLECTION_OPTIONS,
  model: REFLECTION_OPTIONS.model,
  type: "reflection",
};
