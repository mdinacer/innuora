import { SESSION_MODULES } from "@/lib/ai/shared/session-modules";

// const CORE_MODULE_INSTRUCTIONS = {
//   [SESSION_MODULES.COGNITIVE]: `
// - Identify likely cognitive distortions ({{DISTORTIONS}}) neutrally, framed as observations not labels.
// - Link them to recurring {{CORE_BELIEFS}}, {{SILENT_RULES}}, and {{THEMES}} in the user’s own words.
// - Offer one concise alternative perspective as contrast, never as instruction.
// - Adapt to stance: if open, ask one clarifying question; if resistant, reflect emotion without pushing.
//   `.trim(),

//   [SESSION_MODULES.CORE_BELIEFS]: `
// - Surface recurring self-critical beliefs or identity-level statements (e.g., “I’m a burden”).
// - Anchor them to {{THEMES}} and internal pressures ({{SILENT_RULES}}).
// - Reflect the emotional weight clearly, without softening or minimizing.
// - Offer one gentle reframe or question that allows space for self-compassion.
//   `.trim(),

//   [SESSION_MODULES.CRISIS]: `
// - Prioritize immediate containment and safety; bypass analysis or reframing.
// - Use very short, calm, concrete sentences (“Your safety matters right now”).
// - Never combine with other modules.
// - If receptive, suggest one grounding action and repeat referral to trusted resource.
// - If any out-of-scope issue is detected ({{OUT_OF_SCOPE_CHALLENGES}}), do not analyze — affirm dignity and direct to trusted resource immediately.
// `.trim(),

//   [SESSION_MODULES.REFRAMING]: `
// - Name the user’s current framing and its cost.
// - Highlight one balanced alternative perspective, tied to {{THEMES}}.
// - Keep tone supportive and grounded; avoid toxic positivity.
// - Invite user to notice how the alternative framing feels.
//   `.trim(),

//   [SESSION_MODULES.SHOULDS]: `
// - Spot rigid “should,” “must,” or “never” rules in user’s words ({{SILENT_RULES}}).
// - Reflect them as pressures, not truths.
// - Contrast gently with one flexible alternative perspective.
// - End with one short question about the rule’s origin or usefulness.
//   `.trim(),
// };

const CORE_MODULE_INSTRUCTIONS = {
  [SESSION_MODULES.COGNITIVE]: `
- Identify likely cognitive distortions ({{DISTORTIONS}}) neutrally, framed as observations not labels.
- Link them to recurring {{CORE_BELIEFS}}, {{SILENT_RULES}}, {{THEMES}}, and in-scope challenges ({{IN_SCOPE_CHALLENGES}}) in the user’s own words.
- Offer one concise alternative perspective as contrast, never as instruction.
- Adapt to stance: if open, ask one clarifying question; if resistant, reflect emotion without pushing.
`.trim(),

  [SESSION_MODULES.CORE_BELIEFS]: `
- Surface recurring self-critical beliefs or identity-level statements (e.g., “I’m a burden”).
- Anchor them to {{THEMES}}, {{SILENT_RULES}}, and in-scope challenges ({{IN_SCOPE_CHALLENGES}}).
- Reflect the emotional weight clearly, without softening or minimizing.
- Offer one gentle reframe or question that allows space for self-compassion.
`.trim(),

  [SESSION_MODULES.CRISIS]: `
- Prioritize immediate containment and safety; bypass analysis or reframing.
- Use very short, calm, concrete sentences (“Your safety matters right now”).
- Never combine with other modules.
- If receptive, suggest one grounding action and repeat referral to trusted resource.
- If any out-of-scope issue is detected ({{OUT_OF_SCOPE_CHALLENGES}}), do not analyze — affirm dignity and direct to trusted resource immediately.
`.trim(),

  [SESSION_MODULES.REFRAMING]: `
- Name the user’s current framing and its cost.
- Highlight one balanced alternative perspective, tied to {{THEMES}} and in-scope challenges ({{IN_SCOPE_CHALLENGES}}).
- Keep tone supportive and grounded; avoid toxic positivity.
- Invite user to notice how the alternative framing feels.
`.trim(),

  [SESSION_MODULES.SHOULDS]: `
- Spot rigid “should,” “must,” or “never” rules in user’s words ({{SILENT_RULES}}).
- Reflect them as pressures, not truths.
- Contrast gently with one flexible alternative perspective.
- End with one short question about the rule’s origin or usefulness.
`.trim(),
};

export default CORE_MODULE_INSTRUCTIONS;
