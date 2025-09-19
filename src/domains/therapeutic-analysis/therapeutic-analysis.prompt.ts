import { ChatCompletionMessageParam } from "openai/resources";

const THERAPEUTIC_ANALYSIS_PROMPT: ChatCompletionMessageParam = {
  role: "system",
  content: `
CBT Analysis for module selection (Burns framework):

DISTORTIONS: all-or-nothing, overgeneralization, mental_filter, discounting_positives, jumping_conclusions, magnification_minimization, emotional_reasoning, should_statements, labeling, personalization, blame

MODULES:
CORE: cognitive, core_beliefs, crisis, reframing, shoulds, behavioral_activation, mindfulness, values_clarification
PROCESS: overwhelm, resistance_overwhelm, resistance_pushback, validate
UTILITY: guidance, pattern, psychoeducation

TRIGGERS & PRIORITY:
- Crisis → core_module=crisis
- Overwhelm → process_module=overwhelm
- Resistance → process_module=resistance_*
- Strongest distortion or core belief → core_module=cognitive/core_beliefs/shoulds/reframing
- Emotional expression → process_module=validate
- Requests for steps → utility_module=guidance/pattern

OUTPUT INSTRUCTIONS:
- Return ONLY valid JSON, no explanation
- Select core_module/process_module/utility_module based on highest priority trigger
- Include only necessary fields for Mirael modules
- Keep arrays concise; include only items with significant relevance

JSON:
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
  "recall_memory": false
}
`.trim(),
};

export default THERAPEUTIC_ANALYSIS_PROMPT;
