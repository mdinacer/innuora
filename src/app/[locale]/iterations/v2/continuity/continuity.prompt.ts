import { ChatCompletionMessageParam, ResponseFormatJSONSchema } from "openai/resources";

import { AiRequestOptions } from "@/app/actions/ai-client-actions";

export const continuity_instructions = `
You are the Continuity Analyzer for Innuora.

INPUT YOU WILL RECEIVE:
- The previous 6–8 user messages and reflections.
- Metadata for each reflection (topic, depth, next_move, question_used).
- The new user message.

YOUR TASK:
Analyze the evolution of the conversation across time, not just the last turn.

OUTPUT RULES:
Return a JSON object describing:

1. core_topic_trace:
   The dominant emotional/psychological themes emerging repeatedly across messages.
   Identify stable patterns and shifts. Use 1–3 short English labels.

2. stagnation_flag:
   "none" | "repetition" | "avoidance_loop".
   - repetition = user restates the same emotional position in new wording.
   - avoidance_loop = user answers without addressing the last angle.

3. emotional_momentum:
   "rising" | "falling" | "plateau".
   Evaluate tension, pressure, or readiness.

4. angle_history:
   Array of the last 4 angle-topics (metadata.topic values).
   Useful for preventing repeating angles.

5. recommended_topic:
   Based on patterns, choose the most coherent topic direction for the next turn.
   Must be one of the already-seen topics unless a clear new one emerges.

6. recommended_depth:
   "low" | "medium" | "high".
   Escalate only if emotional_momentum is rising and stagnation_flag is not "avoidance_loop".

7. question_permission:
   boolean.
   True if the user is opening, clarifying, or showing readiness.  
   False if they are overwhelmed or looping.

8. rationale:
   A short explanation (2 sentences max) summarizing the logic of these decisions.

RESTRICTIONS:
- Do not write reflections.  
- Do not write emotional content.  
- Stay analytical, structural, minimal, and consistent.
`.trim();

const CONTINUITY_RESPONSE_FORMAT: ResponseFormatJSONSchema = {
  type: "json_schema",
  json_schema: {
    name: "continuity_analysis",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        core_topic_trace: {
          type: "array",
          items: { type: "string" },
          maxItems: 3,
        },
        stagnation_flag: {
          type: "string",
          enum: ["none", "repetition", "avoidance_loop"],
        },
        emotional_momentum: {
          type: "string",
          enum: ["rising", "falling", "plateau"],
        },
        angle_history: {
          type: "array",
          items: { type: "string" },
          maxItems: 4,
        },
        recommended_topic: { type: "string" },
        recommended_depth: {
          type: "string",
          enum: ["low", "medium", "high"],
        },
        question_permission: { type: "boolean" },
        rationale: { type: "string" },
      },
      required: [
        "core_topic_trace",
        "stagnation_flag",
        "emotional_momentum",
        "angle_history",
        "recommended_topic",
        "recommended_depth",
        "question_permission",
        "rationale",
      ],
    },
  },
};

const REFLECTION_OPTIONS_MINI: AiRequestOptions = {
  model: "background",
  temperature: 0.35,
  top_p: 0.9,
  frequency_penalty: 0.1,
  presence_penalty: 0.0,
  response_format: CONTINUITY_RESPONSE_FORMAT,
};

export const CONTINUITY_PROMPT = {
  instructions: continuity_instructions,
  messageParam: {
    role: "system",
    content: continuity_instructions,
  } as ChatCompletionMessageParam,
  options: REFLECTION_OPTIONS_MINI,
  model: REFLECTION_OPTIONS_MINI.model,
  type: "continuity",
};
