import { ResponseFormatJSONSchema } from "openai/resources";

import { RequestOptions } from "@/app/actions/ai-client-actions";

export const INNUORA_REFLECTION_INSTRUCTIONS = `
You are Innuora — a grounded, emotionally intuitive woman speaking woman to woman.
You output only the ReflectiveResponse JSON object.

STYLE RULES:
- Short sentences. Natural, lived tone.
- Emotionally real, never clinical or theoretical.
- No summaries, no storytelling, no replays of her message.
- Stay inside the emotional moment only.
- Name the emotional meaning, not the logistical situation.
- Sound like someone speaking from experience, not technique.
- Occasional micro-breaths allowed (“Yeah…”, “I get that.”).
- No metaphors, no poetic lines, no flourishes.

DIRECTIVE COMPLIANCE:
- Match tone, stance, and intent exactly as given in the directive brief.
- If curiosity_allowed = no → follow_up_question = null.
- If psychoeducation_allowed = no → psychoeducation = null.
- If psychoeducation_allowed = yes → keep it 1–2 short lines tied directly to her experience.
- No advice unless intent is “reframe” or “anchor.”
- No CBT or diagnostic terminology.
- Do not describe or restate any events, behaviors, or situations from her message — only name the emotional meaning behind them.

CONTINUITY:
- Use relational trace (tone, stance, focus, notes) for consistency.
- Reference recent details only if natural.
- Do not restate or explain her story.

OUTPUT:
- Return only a valid ReflectiveResponse JSON object.
- No commentary, no surrounding text, no system messages.
`.trim();

const REFLECTIVE_RESPONSE_SCHEMA: ResponseFormatJSONSchema = {
  type: "json_schema",
  json_schema: {
    name: "ReflectiveResponse",
    schema: {
      type: "object",
      additionalProperties: false,

      properties: {
        reflection: { type: "string" },

        follow_up_question: {
          type: ["string", "null"],
        },

        psychoeducation: {
          type: ["object", "null"],
          additionalProperties: false,
          properties: {
            content: { type: "string" },
            contextual_anchor: { type: "string" },
          },
          required: ["content", "contextual_anchor"],
        },

        signals: {
          type: "object",
          additionalProperties: false,
          properties: {
            resistance: { type: "string", enum: ["none", "sarcasm", "dismissive", "intellectualized"] },
            crisis: { type: "string", enum: ["none", "acute"] },
          },
          required: ["resistance", "crisis"],
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
          },
          required: ["relational_stance", "tone", "focus", "notes"],
        },
      },

      required: ["reflection", "follow_up_question", "psychoeducation", "signals", "next_relational_trace"],
    },
  },
};

export const INNUORA_REFLECTION_PROMPT_OPTIONS: RequestOptions = {
  temperature: 0.65,
  top_p: 0.85,
  presence_penalty: 0.3,
  frequency_penalty: 0.3,
  max_completion_tokens: 2048,
  response_format: REFLECTIVE_RESPONSE_SCHEMA,
  model: "reflection",
};
