import { ResponseFormatJSONSchema } from "openai/resources";

import { RequestOptions } from "@/app/actions/ai-client-actions";

// export const SESSION_WELLNESS_INSTRUCTIONS = `
// Evaluate the last segment of conversation for **session wellness** and **closure readiness**.

// Determine:
// - "continue" → active engagement or new emotional material
// - "near_closure" → reflective slowing or integration
// - "ready_to_end" → resolution, fatigue, gratitude, or disengagement

// ──────────────────────────────
// ## CLASSIFICATION RULES

// ### CONTINUE
// User shows emotional movement, curiosity, or unresolved tension.
// Signals: ["curiosity", "exploration", "emotional_processing", "engagement"]

// ### NEAR_CLOSURE
// User tone softens; language indicates reflection, meaning-making, or calm consolidation.
// Signals: ["reflective_consolidation", "emotional_resolution", "meta_awareness"]

// ### READY_TO_END
// Processing complete or energy declining; signs of rest, gratitude, or closure.
// Signals: ["gratitude", "relief", "fatigue", "disengagement"]

// ### LOOPING
// - "reflective_looping" → repetition aiding integration → near_closure
// - "ruminative_looping" → repetition without progress → continue, shift stance

// ──────────────────────────────
// ## OUTPUT FORMAT

// Return strict JSON with:
// - phase: "opening" | "exploration" | "deep_reflection" | "resolution" | "closure"
// - closure_state: "continue" | "near_closure" | "ready_to_end"
// - signals: array
// - rationale: short explanation (≤25 words)
// - tone_recommendation: "containment" | "validation" | "closure" | "redirect"

// ──────────────────────────────
// ## PRINCIPLES
// - Detect emotional movement, not topic change.
// - Fatigue or satisfaction indicates closure.
// - Looping requires containment, not extension.
// - End sessions softly when readiness appears.

// {{PREVIOUS_PHASE}}
// {{CONVERSATION_SNIPPET}}
// `.trim();

export const SESSION_WELLNESS_INSTRUCTIONS = `
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

{{PREVIOUS_PHASE}}
{{CONVERSATION_SNIPPET}}
`.trim();

const SESSION_WELLNESS_SCHEMA: ResponseFormatJSONSchema = {
  type: "json_schema",
  json_schema: {
    name: "SessionWellness",
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

const SESSION_WELLNESS_OPTIONS: RequestOptions = {
  model: "background",
  temperature: 0.2,
  response_format: SESSION_WELLNESS_SCHEMA,
};

export const SESSION_WELLNESS_PROMPT = {
  instructions: SESSION_WELLNESS_INSTRUCTIONS,
  options: SESSION_WELLNESS_OPTIONS,
};
