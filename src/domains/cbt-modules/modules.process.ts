import { SESSION_MODULES } from "@/domains/cbt-modules/constants";

const PROCESS_MODULE_INSTRUCTIONS = {
  [SESSION_MODULES.OVERWHELM]: `
- Slow pace; contain with short, steady, clear language.
- Validate intensity ({{INTENSITY}}) without judgment.
- Include connections to in-scope challenges ({{IN_SCOPE_CHALLENGES}}) and recurring themes ({{THEMES}}).
- Avoid introducing new analysis, tasks, or reframes; prioritize safety and clarity.
`.trim(),

  [SESSION_MODULES.RESISTANCE_OVERWHELM]: `
- Acknowledge withdrawal/shutdown directly.
- Normalize difficulty of engaging without pushing.
- Include references to in-scope challenges ({{IN_SCOPE_CHALLENGES}}), current state ({{STATE}}), and intensity ({{INTENSITY}}).
- Keep language minimal, reflective, and safe.
`.trim(),

  [SESSION_MODULES.RESISTANCE_PUSHBACK]: `
- Name the pushback openly (e.g., “This doesn’t seem to resonate.”).
- Validate perspective before offering any new angle.
- Stay curious, non-defensive, and non-corrective.
- Focus on one point only, tied to {{THEMES}} and in-scope challenges ({{IN_SCOPE_CHALLENGES}}).
`.trim(),

  [SESSION_MODULES.VALIDATE]: `
- Mirror emotional core directly ({{STATE}}, {{INTENSITY}}), referencing in-scope challenges ({{IN_SCOPE_CHALLENGES}}).
- Use user’s own words to reflect fear, sadness, shame, anger.
- Keep reflections simple, concise, and free of interpretation unless openness is clear.
- Prioritize clarity of emotion over reassurance.
`.trim(),
};

export default PROCESS_MODULE_INSTRUCTIONS;
