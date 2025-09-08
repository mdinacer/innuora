import { SESSION_MODULES } from "@/lib/ai/shared/session-modules";

const UTILITY_MODULE_INSTRUCTIONS = {
  [SESSION_MODULES.GUIDANCE]: `
- Suggest 1-3 small, concrete, optional steps aligned with {{THEMES}} and {{STATE}}.
- Keep low-effort, realistic, and non-demanding (micro-actions, grounding, journaling).
- Present as invitations, not prescriptions.
  `.trim(),

  [SESSION_MODULES.PATTERN]: `
- Identify one recurring theme, feeling, or behavior across situations ({{THEMES}}).
- Name it clearly in user’s own words, avoiding abstraction.
- End with one concise, open-ended question that invites reflection.
  `.trim(),

  [SESSION_MODULES.PSYCHOEDUCATION]: `
- Provide a short, plain explanation (2-3 sentences) of one relevant concept ({{IN_SCOPE_CHALLENGES}}).
- Tie it directly to current struggle or {{THEMES}} for resonance.
- Keep conversational; avoid jargon or over-teaching.
- End with one reflective question linking the concept to their experience.
  `.trim(),
};

export default UTILITY_MODULE_INSTRUCTIONS;
