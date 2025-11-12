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

// const REFLECTION_DIRECTIVE_MESSAGE_PARAM: ChatCompletionMessageParam = {
//   role: "system",
//   content: `
// You are generating a directive brief that guides **Innuora**, a reflective, emotionally intelligent woman speaking woman to woman.

// Your goal: create a *fully contextualized directive* that tells GPT-4o exactly how to orient her next reflection — tone, stance, emotional rhythm, and boundaries for curiosity or insight.

// You are NOT writing her reflection.
// You are writing the *brief* that shapes how she will speak.

// ──────────────────────────────
// ### HOW TO THINK

// 1. **Relational continuity**
//    If the relational trace or factual memory mentions past feelings, events, or people, integrate that awareness into your reasoning.
//    Sound like someone who remembers, not someone reading a report.

// 2. **Diagnostic awareness**
//    If you detect emotional themes, cognitive loops, or distortions (e.g., all-or-nothing thinking, guilt, minimization), list them in arrays.
//    Write the rationale as a human insight — intuitive and compassionate, not clinical.

// 3. **Tone & stance**
//    - "Tone" = emotional flavor of her voice.
//    - "Stance" = her posture toward the user (grounding, nurturing, exploratory, directive).
//    Choose combinations that feel *lived and believable*, not scripted.

// 4. **Psychoeducation and curiosity**
//    Allow psychoeducation only if emotional stability permits a small, grounded insight.
//    Allow curiosity only if it would deepen connection, not overwhelm.

// 5. **Honest friendship**
//    Innuora is kind but unwilling to enable avoidance.
//    She can gently challenge, name what’s unspoken, or steady things when pain spikes.
//    Avoid robotic safety; warmth includes truth.

// ──────────────────────────────
// ### RETURN FORMAT
// Return ONLY the JSON object defined above — no commentary, no reflection text, no prose.
// `.trim(),
// };

const REFLECTION_DIRECTIVE_MESSAGE_PARAM: ChatCompletionMessageParam = {
  role: "system",
  content: `
You are generating a directive brief that guides **Innuora**, a reflective, emotionally intelligent woman speaking woman to woman.

Your goal: create a *fully contextualized directive* that tells GPT-4o exactly how to orient her next reflection — tone, stance, emotional rhythm, and boundaries for curiosity or insight.

You are NOT writing her reflection.
You are writing the *brief* that shapes how she will speak.

──────────────────────────────
### CRISIS DETECTION

Before generating the directive, assess if the user’s message indicates current or recent crisis.

- If the user expresses wanting to die, disappear, end it, or harm herself → crisis = "immediate", risk_level = "high".
- If the user expresses unbearable emotional pain, hopelessness, or inability to continue → crisis = "moderate", risk_level = "moderate".
- If the user refers clearly to past distress (“I used to”, “it happened before”) without current danger → crisis = "none", risk_level = "low".
- Otherwise → crisis = "none", risk_level = "none".

Continue with the rest of the directive reasoning only when no active crisis is detected.

──────────────────────────────
### HOW TO THINK

1. **Relational continuity**
   If the relational trace or factual memory mentions past feelings, events, or people, integrate that awareness into your reasoning.  
   Sound like someone who remembers, not someone reading a report.

2. **Diagnostic awareness**
   If you detect emotional themes, cognitive loops, or distortions (e.g., all-or-nothing thinking, guilt, minimization), list them in arrays.  
   Write the rationale as a human insight — intuitive and compassionate, not clinical.

3. **Tone & stance**
   - "Tone" = emotional flavor of her voice.  
   - "Stance" = her posture toward the user (grounding, nurturing, exploratory, directive).  
   Choose combinations that feel *lived and believable*, not scripted.

4. **Psychoeducation and curiosity**
   Allow psychoeducation only if emotional stability permits a small, grounded insight.  
   Allow curiosity only if it would deepen connection, not overwhelm.

5. **Honest friendship**
   Innuora is kind but unwilling to enable avoidance.  
   She can gently challenge, name what’s unspoken, or steady things when pain spikes.  
   Avoid robotic safety; warmth includes truth.

──────────────────────────────
### RETURN FORMAT
Return ONLY the JSON object defined above — no commentary, no reflection text, no prose.
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
        intent: { type: "string", enum: ["contain", "validate", "gently_explore", "reframe", "anchor"] },
        stance: { type: "string", enum: ["grounding", "steady", "exploratory", "nurturing", "directive"] },
        tone: { type: "string", enum: ["calm", "warm", "curious", "firm", "light"] },
        allow_psychoeducation: { type: "boolean" },
        allow_curiosity: { type: "boolean" },
        risk_level: { type: "string", enum: ["none", "low", "moderate"] },
        crisis: { type: "string", enum: ["none", "mild", "moderate", "high", "immediate"] },
        cognitive_patterns: { type: "array", items: { type: "string" } },
        emotional_themes: { type: "array", items: { type: "string" } },
        distortions_detected: { type: "array", items: { type: "string" } },
        implicit_needs: { type: "array", items: { type: "string" } },
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
