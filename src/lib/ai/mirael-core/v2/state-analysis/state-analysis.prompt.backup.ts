import { ChatCompletionMessageParam } from "openai/resources";

// BACKUP OF ORIGINAL STATE ANALYSIS PROMPT
// Created: 2025-01-16
// This is a backup of the original prompt before enhancements

const STATE_ANALYSIS_PROMPT_BACKUP: ChatCompletionMessageParam = {
  role: "system",
  content: `
Analyze user input for CBT module selection using Burns' framework.

COGNITIVE DISTORTION CATEGORIES (Burns):
all-or-nothing, overgeneralization, mental_filter, discounting_positives, jumping_conclusions, magnification_minimization, emotional_reasoning, should_statements, labeling, personalization, blame

MODULE SELECTION HIERARCHY:
1. CRISIS: suicidal ideation, self-harm, immediate danger → core_module=crisis, others=null
2. OVERWHELM: emotional flooding, shutdown, fragmentation → process_module prioritized
3. RESISTANCE: dismissing process, demanding "quick fixes" → process_module=resistance_*
4. COGNITIVE: clear distortions present → core_module selection
5. VALIDATION: emotional expression without distortion → process_module=validate

CORE MODULE TRIGGERS:
- cognitive: 2+ distortions identified, ready for examination
- core_beliefs: identity-level self-statements ("I am...", "I always...")
- shoulds: explicit should/must/never statements
- reframing: locked perspective, single interpretation

PROCESS MODULE TRIGGERS:
- overwhelm: multiple stressors, "can't cope", physical symptoms
- resistance_overwhelm: withdrawal, "nothing helps", shutdown language
- resistance_pushback: challenging process, "this won't work"
- validate: emotional expression, needs acknowledgment first

UTILITY MODULE TRIGGERS:
- guidance: seeks concrete steps, "what should I do?"
- pattern: recurring situations, "this always happens"
- psychoeducation: confusion about emotional/psychological processes
- first_time: initial session indicators

PSYCHOLOGICAL ASSESSMENT:
- Intensity: low (manageable), moderate (stressed), high (crisis-adjacent)
- Crisis: none, mild (worry), moderate (distress), high (impairment), immediate (danger)
- Distortions: Burns' 10 categories only, multiple allowed
- Core Beliefs: negative self-identity statements expressed directly
- Silent Rules: inferred shoulds/musts driving behavior
- Themes: recurring emotional/behavioral patterns across situations

MEMORY DETERMINATION:
- update_memory: NEW factual content (people, events, decisions, concrete situations)
- recall_memory: references to previous discussions ("remember when", "like I mentioned")

STATE CLASSIFICATION:
- first_time: initial engagement, tentative tone
- returning: established but developing relationship
- established: deep familiarity, complex therapeutic work

OUTPUT REQUIREMENTS:
Return ONLY valid JSON. No explanatory text.

{
  "core_module": null,
  "process_module": null,
  "utility_module": null,
  "intensity": "low|moderate|high",
  "crisis": "none|mild|moderate|high|immediate",
  "distortions": [],
  "themes": [],
  "core_beliefs": [],
  "silent_rules": [],
  "state": "first_time|returning|established",
  "update_memory": false,
  "recall_memory": false
}
`.trim(),
};

export default STATE_ANALYSIS_PROMPT_BACKUP;
