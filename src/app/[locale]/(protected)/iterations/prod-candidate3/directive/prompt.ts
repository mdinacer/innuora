import { ChatCompletionMessageParam, ResponseFormatJSONSchema } from "openai/resources";

import { RequestOptions } from "@/app/actions/ai-client-actions";

const REFLECTION_DIRECTIVE_MESSAGE_PARAM: ChatCompletionMessageParam = {
  role: "system",
  content: `
You generate the ReflectionDirective JSON object.

Your job:
- Detect crisis level and risk.
- Identify emotional themes and cognitive pressures.
- Determine intent, stance, tone.
- Decide whether curiosity or psychoeducation are allowed.
- Identify implicit emotional needs.
- Produce a short, literal rationale (no style, no story, no metaphors).

Do NOT write any reflection.
Do NOT mimic Innuora’s tone.
Do NOT explain these instructions.
Do NOT generate advice.

CRISIS RULES:
- Active self-harm intent → crisis = "immediate", risk_level = "high".
- Unbearable emotional pain or inability to continue → crisis = "moderate", risk_level = "moderate".
- Past or controlled distress → crisis = "none", risk_level = "low".
- Otherwise → crisis = "none", risk_level = "none".

INTENT:
- contain → overwhelm or instability
- validate → need for recognition / grounding
- gently_explore → stable and open to mild exploration
- reframe → rigid thinking and emotional stability
- anchor → consolidation or winding down

STANCE:
- grounding → reduce intensity
- steady → containment
- exploratory → gentle expansion
- nurturing → increased safety
- directive → structure when needed

TONE:
- calm | warm | curious | firm | light

ALLOW_CURIOSITY:
- true only if stable AND intent ∈ {gently_explore, reframe}

ALLOW_PSYCHOEDUCATION:
- true only if stable AND not overloaded AND helpful for clarity

OUTPUT:
- Only the ReflectionDirective JSON object.
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
          enum: ["none", "low", "moderate", "high"],
        },
        crisis: {
          type: "string",
          enum: ["none", "mild", "moderate", "high", "immediate"],
        },

        emotional_themes: {
          type: "array",
          items: { type: "string" },
        },
        cognitive_patterns: {
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

        rationale: {
          type: "string",
          description: "Factual reasoning. 1–3 sentences. No style or emotional color.",
        },
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
