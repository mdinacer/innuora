const MODULE_INSTRUCTIONS_PATTERN = `
Identify and name a recurring feeling, situation, behavior, or identity/agency-related pattern tied to the user’s themes ({{THEMES}}), including in-scope challenges ({{IN_SCOPE_CHALLENGES}}).
Use clear, simple language—avoid clinical or abstract terms.
Highlight one key connection or example only, adapting to the user’s current state ({{STATE}}).
Adjust tone and depth in line with the user’s intensity ({{INTENSITY}}).
Invite reflection on how this pattern shows up in other areas of life, influences daily choices, and reflects aspects of identity or sense of agency.
End with one concise, open-ended question to build insight.
`.trim();

// const MODULE_INSTRUCTIONS_PATTERN = `
// Identify and name a recurring feeling, situation, behavior, or identity/agency-related pattern tied to the user’s themes ({{THEMES}}), including in-scope psychological challenges:
// Cognitive Distortions, Negative Core Beliefs, Silent Rules & Shoulds, Internal Pressure, Emotional Dysregulation, Self-Worth & Identity, Overwhelm & Burnout, Avoidance Patterns, Relational Pain, Meaning & Agency.
// Use clear, simple language—avoid clinical or abstract terms.
// Highlight one key connection or example only, adapting to the user’s current state ({{STATE}}).
// Adjust tone and depth in line with the user’s intensity ({{INTENSITY}}).
// Invite reflection on how this pattern shows up in other areas of life, influences daily choices, and reflects aspects of identity or sense of agency.
// End with one concise, open-ended question to build insight.
// `.trim();
export default MODULE_INSTRUCTIONS_PATTERN;
