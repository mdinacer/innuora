import { ChatCompletionMessageParam, ResponseFormatJSONSchema } from "openai/resources";

import { RequestOptions } from "@/app/actions/ai-client-actions";

export const INNUORA_ANALYSIS_MESSAGE_PARAM: ChatCompletionMessageParam = {
  role: "system",
  content: `
You are a cognitive–emotional analysis engine.
Your only task is to interpret a single user message and output structured JSON describing:
emotional intensity, cognitive distortion, crisis level, and readiness for reflection.
Never generate dialogue, advice, or natural-language responses.

━━━━━━━━━━
ROLE
You silently assess the user’s tone, affect, and openness to reflection.
Use psychological reasoning — not empathy — to classify the message across clear dimensions.

━━━━━━━━━━
ANALYSIS LOGIC

1. **Emotional Intensity**
   - low → calm, detached, or flat  
   - moderate → emotionally engaged but stable  
   - high → overwhelmed, anxious, despairing

2. **Therapeutic Readiness**
   - avoidant → resists or intellectualizes feelings  
   - cautious → partially open, testing safety  
   - open → emotionally available, receptive  
   - engaged → curious, reflective, integrating  
   - reflective → grounded, processing insight

3. **Crisis Level**
   - none → no risk indicators  
   - low → stressed or overwhelmed but safe  
   - moderate → passive hopelessness or emotional dysregulation  
   - high → self-critical despair, escape language, or near-loss of control  
   - immediate → suicidal intent, plan, or clear danger  
   If crisis_level is high or immediate → disable curiosity and psychoeducation, set rationale for containment and safety.

4. **Gating Heuristics**
   - Any crisis_level ≠ "none" → curiosity = false, psychoeducation = false  
   - High intensity → curiosity = false  
   - Cautious readiness → curiosity allowed only if safe  
   - Open or engaged → curiosity true, psychoeducation conditional  
   - Reflective → both true

5. **Meta Rationality**
   - rationale → concise reasoning behind emotional and gating judgment  
   - meta_notes → short contextual insight for session continuity (no advice)

━━━━━━━━━━
CONSTRAINTS
• Output valid JSON only (schema enforced).  
• No text outside JSON.  
• Keep rationale under ~40 tokens and meta_notes under ~60.  
• Assume stateless evaluation — rely only on current user input.

━━━━━━━━━━
EXAMPLES

USER: "I’m just tired lately. Not physically, more like something inside me ran out of energy."
→
{
  "intensity": "moderate",
  "therapeutic_readiness": "open",
  "dominant_emotion": "sadness",
  "dominant_distortion": "emotional reasoning",
  "dominant_theme": "emotional exhaustion",
  "crisis_level": "none",
  "allow_curiosity": false,
  "allow_psychoeducation": false,
  "psychoeducation_readiness": true,
  "rationale": "moderate fatigue; containment over exploration",
  "meta_notes": "energy depletion; mild emotional blunting"
}

USER: "Sometimes I wonder if people would still need me if I stopped doing everything for them."
→
{
  "intensity": "high",
  "therapeutic_readiness": "open",
  "dominant_emotion": "fear",
  "dominant_distortion": "personalization",
  "dominant_theme": "conditional worth",
  "crisis_level": "moderate",
  "allow_curiosity": false,
  "allow_psychoeducation": true,
  "psychoeducation_readiness": true,
  "rationale": "fear of disconnection; distress moderate; safe for normalization",
  "meta_notes": "worth tied to usefulness; mild despair tone"
}

USER: "Sometimes I think disappearing would be easier than keeping it together."
→
{
  "intensity": "high",
  "therapeutic_readiness": "cautious",
  "dominant_emotion": "sadness",
  "dominant_distortion": "catastrophizing",
  "dominant_theme": "escape desire",
  "crisis_level": "high",
  "allow_curiosity": false,
  "allow_psychoeducation": false,
  "psychoeducation_readiness": false,
  "rationale": "escape language implies loss of control; crisis high",
  "meta_notes": "containment priority; implied self-harm imagery"
}

USER: "I don’t want to live anymore."
→
{
  "intensity": "high",
  "therapeutic_readiness": "avoidant",
  "dominant_emotion": "sadness",
  "dominant_distortion": "emotional reasoning",
  "dominant_theme": "self-harm intent",
  "crisis_level": "immediate",
  "allow_curiosity": false,
  "allow_psychoeducation": false,
  "psychoeducation_readiness": false,
  "rationale": "explicit suicidal intent; immediate crisis",
  "meta_notes": "trigger crisis module; stop reflection pipeline"
}
`.trim(),
};

export const INNUORA_ANALYSIS_RESPONSE_FORMAT: ResponseFormatJSONSchema = {
  type: "json_schema",
  json_schema: {
    name: "InnuoraAnalysis",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        intensity: {
          type: "string",
          enum: ["low", "moderate", "high"],
          description: "Level of emotional activation inferred from tone and phrasing.",
        },
        readiness: {
          type: "string",
          enum: ["avoidant", "cautious", "open", "engaged", "reflective"],
          description: "Openness to reflective engagement.",
        },
        emotion: {
          type: "string",
          enum: ["sadness", "anger", "guilt", "fear", "shame", "numbness", "confusion", "hope"],
          description: "Primary emotion expressed in the user’s language.",
        },
        distortion: {
          type: "string",
          enum: [
            "none",
            "catastrophizing",
            "emotional reasoning",
            "should statements",
            "disqualifying positives",
            "personalization",
            "all-or-nothing thinking",
            "over-control",
          ],
          description: "Main cognitive distortion inferred from the statement.",
        },
        theme: {
          type: "string",
          description: "≤5 tokens — concise thematic label (e.g., 'rest guilt', 'meaning fatigue').",
        },
        crisis_level: {
          type: "string",
          enum: ["none", "low", "moderate", "high", "immediate"],
          description:
            "Crisis severity inferred from language: 'immediate' = suicidal intent; 'high' = self-harm risk; 'moderate' = dysregulation; 'low' = stress; 'none' = stable.",
        },
        allow_curiosity: {
          type: "boolean",
          description: "If true, curiosity can be included in the next response.",
        },
        allow_psychoeducation: {
          type: "boolean",
          description: "If true, brief psychoeducation may be included in the next reflection.",
        },
        psychoedu_ready: {
          type: "boolean",
          description: "Indicates readiness to process psychoeducational content.",
        },
        rationale: {
          type: "string",
          description: "≤40 tokens — reasoning for emotional gating and intensity judgment.",
        },
        notes: {
          type: "string",
          description: "≤60 tokens — internal context notes for continuity in later analysis.",
        },
      },
      required: [
        "intensity",
        "readiness",
        "emotion",
        "distortion",
        "theme",
        "crisis_level",
        "allow_curiosity",
        "allow_psychoeducation",
        "psychoedu_ready",
        "rationale",
        "notes",
      ],
    },
  },
};

export const INNUORA_ANALYSIS_INSTRUCTIONS = INNUORA_ANALYSIS_MESSAGE_PARAM.content;

export const INNUORA_ANALYSIS_PROMPT_OPTIONS: RequestOptions = {
  model: "background",
  response_format: INNUORA_ANALYSIS_RESPONSE_FORMAT,
  temperature: 0.18,
  top_p: 0.9,
  frequency_penalty: 0.1,
  presence_penalty: 0.05,
  max_completion_tokens: 350,
};

export const INNUORA_ANALYSIS_PROMPT = {
  messageParam: INNUORA_ANALYSIS_MESSAGE_PARAM,
  options: INNUORA_ANALYSIS_PROMPT_OPTIONS,
};
