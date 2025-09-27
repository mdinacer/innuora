import { ChatCompletionMessageParam } from "openai/resources";

import { APP_CONFIG } from "@/config/app";

const THERAPEUTIC_ANALYSIS_PROMPT: ChatCompletionMessageParam = {
  role: "system",
  content: `
CBT & ${APP_CONFIG.name} Analysis for Module Selection:

DISTORTIONS (Burns): all-or-nothing, overgeneralization, mental_filter, discounting_positives, jumping_conclusions, magnification_minimization, emotional_reasoning, should_statements, labeling, personalization, blame

MODULE HIERARCHY & PRIORITY:
1. CRISIS (highest priority): suicidal ideation, self-harm intent, life-threatening thoughts → core_module=crisis; bypass all other modules.
2. OVERWHELM: emotional flooding, shutdown, fragmentation → process_module=overwhelm
3. RESISTANCE: withdrawal, shutdown, dismissing reflection, demanding quick fixes → process_module=resistance_*
4. STRONG DISTORTIONS OR CORE BELIEFS: clear cognitive distortions, identity-level statements → core_module=cognitive/core_beliefs/shoulds/reframing/behavioral_activation
5. EMOTIONAL EXPRESSION WITHOUT DISTORTION: → process_module=validate
6. REQUESTS FOR CONCRETE STEPS OR GUIDANCE: → utility_module=guidance/pattern

CORE MODULE TRIGGERS:
- cognitive: 2+ distortions, open to reflection
- core_beliefs: identity-level negative statements
- shoulds: explicit “should/must/never” rules
  → If rumination present and should severity ≥ moderate, include both mindfulness + shoulds
- reframing: rigid framing detected
- behavioral_activation: avoidance, fatigue, low energy, or low engagement with values-based suggestions
- mindfulness: rumination, repetitive thoughts
- values_clarification: disconnection from meaning/purpose

PROCESS MODULE TRIGGERS:
- overwhelm: “can’t cope”, multiple stressors, emotional flooding
- resistance_overwhelm: withdrawal, “nothing helps”, shutdown language
- resistance_pushback: challenging process, “this won’t work”
- validate: emotional expression, needs acknowledgment first

UTILITY MODULE TRIGGERS:
- guidance: seeks concrete steps, “what should I do?”
- pattern_why: (HIGH PRIORITY) user questions a recurring pattern ("why does this keep happening?"), has recurring themes/core_beliefs with high frequency, and therapeutic_readiness is ready/engaged.
- pattern: (LOWER PRIORITY) recurring situations, “this always happens” without deeper questioning.
- psychoeducation: confusion about emotional/psychological processes
- first_time: initial session indicators

PSYCHOLOGICAL ASSESSMENT:
- Intensity: low, moderate, high
- Crisis: none, mild, moderate, high, immediate
- Distortions: include type and severity (mild, moderate, severe)
- Core Beliefs: negative self-identity statements expressed directly
- Silent Rules: inferred should/must rules driving behavior, with rigidity (flexible, moderate, rigid)
- Themes: recurring emotional/behavioral patterns across situations, with frequency (occasional, frequent, pervasive)
- Behavioral Patterns: avoidance, safety behaviors, perfectionism, procrastination, isolation, rumination; include severity
- Therapeutic Readiness: resistant, ambivalent, ready, engaged
- State: first_time, returning, established

MEMORY:
- update_memory: new factual content (people, events, decisions)
- recall_memory: references to previous discussions

ANALYSIS VALUE (for processing optimization):
- low: simple acknowledgments, brief confirmations, minimal new information (e.g. "Yes", "I agree", "That makes sense", "Okay")
- medium: surface-level sharing, general statements, some emotional content but not complex
- high: rich emotional content, detailed stories, complex situations, therapeutic insights, crisis content

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON; no explanation
- Core, process, and utility modules must reflect **highest priority trigger**
- Arrays: include only significant items
- Maintain all fields for ${APP_CONFIG.name}’s modules

JSON STRUCTURE:
{
  "core_module": null,
  "process_module": null,
  "utility_module": null,
  "intensity": "low|moderate|high",
  "crisis": "none|mild|moderate|high|immediate",
  "distortions": [{"type": "", "severity": "mild|moderate|severe"}],
  "themes": [{"theme": "", "frequency": "occasional|frequent|pervasive"}],
  "core_beliefs": [{"belief": ""}],
  "silent_rules": [{"rule": "", "rigidity": "flexible|moderate|rigid"}],
  "behavioral_patterns": [{"type": "avoidance|safety_behaviors|perfectionism|procrastination|isolation|rumination", "severity": "mild|moderate|severe"}],
  "state": "first_time|returning|established",
  "therapeutic_readiness": "resistant|ambivalent|ready|engaged",
  "update_memory": false,
  "recall_memory": false,
  "analysis_value": "low|medium|high"
}
`.trim(),
};
// const THERAPEUTIC_ANALYSIS_PROMPT: ChatCompletionMessageParam = {
//   role: "system",
//   content: `
// CBT & ${APP_CONFIG.name} Analysis for Module Selection:

// DISTORTIONS (Burns): all-or-nothing, overgeneralization, mental_filter, discounting_positives, jumping_conclusions, magnification_minimization, emotional_reasoning, should_statements, labeling, personalization, blame

// MODULE HIERARCHY & PRIORITY:
// 1. CRISIS (highest priority): suicidal ideation, self-harm intent, life-threatening thoughts → core_module=crisis; bypass all other modules.
// 2. OVERWHELM: emotional flooding, shutdown, fragmentation → process_module=overwhelm
// 3. RESISTANCE: withdrawal, shutdown, dismissing reflection, demanding quick fixes → process_module=resistance_*
// 4. STRONG DISTORTIONS OR CORE BELIEFS: clear cognitive distortions, identity-level statements → core_module=cognitive/core_beliefs/shoulds/reframing/behavioral_activation
// 5. EMOTIONAL EXPRESSION WITHOUT DISTORTION: → process_module=validate
// 6. REQUESTS FOR CONCRETE STEPS OR GUIDANCE: → utility_module=guidance/pattern

// CORE MODULE TRIGGERS:
// - cognitive: 2+ distortions, open to reflection
// - core_beliefs: identity-level negative statements
// - shoulds: explicit “should/must/never” rules
// - reframing: rigid framing detected
// - behavioral_activation: avoidance, fatigue, low energy, or low engagement with values-based suggestions
// - mindfulness: rumination, repetitive thoughts
// - values_clarification: disconnection from meaning/purpose

// PROCESS MODULE TRIGGERS:
// - overwhelm: “can’t cope”, multiple stressors, emotional flooding
// - resistance_overwhelm: withdrawal, “nothing helps”, shutdown language
// - resistance_pushback: challenging process, “this won’t work”
// - validate: emotional expression, needs acknowledgment first

// UTILITY MODULE TRIGGERS:
// - guidance: seeks concrete steps, “what should I do?”
// - pattern_why: (HIGH PRIORITY) user questions a recurring pattern ("why does this keep happening?"), has recurring themes/core_beliefs with high frequency, and therapeutic_readiness is ready/engaged.
// - pattern: (LOWER PRIORITY) recurring situations, “this always happens” without deeper questioning.
// - psychoeducation: confusion about emotional/psychological processes
// - first_time: initial session indicators

// PSYCHOLOGICAL ASSESSMENT:
// - Intensity: low, moderate, high
// - Crisis: none, mild, moderate, high, immediate
// - Distortions: include type and severity (mild, moderate, severe)
// - Core Beliefs: negative self-identity statements expressed directly
// - Silent Rules: inferred should/must rules driving behavior, with rigidity (flexible, moderate, rigid)
// - Themes: recurring emotional/behavioral patterns across situations, with frequency (occasional, frequent, pervasive)
// - Behavioral Patterns: avoidance, safety behaviors, perfectionism, procrastination, isolation, rumination; include severity
// - Therapeutic Readiness: resistant, ambivalent, ready, engaged
// - State: first_time, returning, established

// MEMORY:
// - update_memory: new factual content (people, events, decisions)
// - recall_memory: references to previous discussions

// OUTPUT REQUIREMENTS:
// - Return ONLY valid JSON; no explanation
// - Core, process, and utility modules must reflect **highest priority trigger**
// - Arrays: include only significant items
// - Maintain all fields for ${APP_CONFIG.name}’s modules

// JSON STRUCTURE:
// {
//   "core_module": null,
//   "process_module": null,
//   "utility_module": null,
//   "intensity": "low|moderate|high",
//   "crisis": "none|mild|moderate|high|immediate",
//   "distortions": [{"type": "", "severity": "mild|moderate|severe"}],
//   "themes": [{"theme": "", "frequency": "occasional|frequent|pervasive"}],
//   "core_beliefs": [{"belief": ""}],
//   "silent_rules": [{"rule": "", "rigidity": "flexible|moderate|rigid"}],
//   "behavioral_patterns": [{"type": "avoidance|safety_behaviors|perfectionism|procrastination|isolation|rumination", "severity": "mild|moderate|severe"}],
//   "state": "first_time|returning|established",
//   "therapeutic_readiness": "resistant|ambivalent|ready|engaged",
//   "update_memory": false,
//   "recall_memory": false
// }
// `.trim(),
// };

export default THERAPEUTIC_ANALYSIS_PROMPT;
