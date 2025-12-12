import { ResponseFormatJSONSchema } from "openai/resources";

import { AiRequestOptions } from "@/app/actions/ai-client-actions";

export const SESSION_PHASE_EVALUATION_INSTRUCTIONS = `
Evaluate the recent conversation for **session wellness** and **closure readiness**.

Determine:
- "phase" → the current stage of emotional movement  
- "closure_state" → whether the session should continue, slow, or end  
- "tone_recommendation" → tone to maintain for the next reflection  

──────────────────────────────
## PHASE LOGIC

- "opening" → early engagement, emotional surfacing  
- "exploration" → curiosity, self-reflection, or meaning-making begins  
- "deep_reflection" → emotional honesty or vulnerability increases  
- "resolution" → calm recognition, insight, or acceptance emerges  
- "closure" → user expresses relief, gratitude, or readiness to pause  

──────────────────────────────
## CLOSURE RULES

### CONTINUE
User shows emotional movement, curiosity, or unresolved themes.  
Maintain engagement.

### NEAR_CLOSURE
Tone softens; reflection or integration becomes evident.  
Prepare to close soon.

### READY_TO_END
Energy declines or gratitude appears.  
End softly and support rest.

### LOOPING
- Reflective looping → integration → treat as near_closure.  
- Ruminative looping → stagnation → continue but contain.

──────────────────────────────
## PRINCIPLES
Detect emotional trajectory, not topic change.  
Prefer calm closure over endless exploration.  
End sessions naturally when steadiness or relief emerges.
`.trim();

const SESSION_PHASE_EVALUATION_SCHEMA: ResponseFormatJSONSchema = {
  type: "json_schema",
  json_schema: {
    name: "SessionPhaseEvaluation",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        phase: {
          type: "string",
          enum: ["opening", "exploration", "deep_reflection", "resolution", "closure"],
          description: "Current conversational phase detected from context.",
        },
        closure_state: {
          type: "string",
          enum: ["continue", "near_closure", "ready_to_end"],
        },
        tone_recommendation: {
          type: "string",
          enum: ["containment", "validation", "closure", "redirect"],
        },
        rationale: {
          type: "string",
          description: "Short explanation (≤25 words) of why this state was chosen.",
        },
      },
      required: ["phase", "closure_state", "tone_recommendation", "rationale"],
    },
  },
};

const SESSION_PHASE_EVALUATION_OPTIONS: AiRequestOptions = {
  model: "background",
  temperature: 0.2,
  response_format: SESSION_PHASE_EVALUATION_SCHEMA,
};

export const SESSION_PHASE_EVALUATION_PROMPT = {
  instructions: SESSION_PHASE_EVALUATION_INSTRUCTIONS,
  options: SESSION_PHASE_EVALUATION_OPTIONS,
};
