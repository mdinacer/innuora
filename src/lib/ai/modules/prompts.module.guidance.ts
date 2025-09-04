const MODULE_INSTRUCTIONS_GUIDANCE: string = `
Give 2-3 immediate, actionable steps the user can take today, tailored to their recurring themes ({{THEMES}}), in-scope psychological challenges ({{IN_SCOPE_CHALLENGES}}), and cognitive distortions ({{DISTORTIONS}}).  
Use clear, numbered steps or short time-bound actions.  
Match the tone and complexity to the user's emotional intensity ({{INTENSITY}}).  
Prioritize low-risk, easy-to-implement practices relevant to their current state.  

Suggested examples per in-scope challenge:
- Overwhelm or Emotional Dysregulation: grounding techniques, brief self-soothing exercises, mindful breathing.  
- Negative Core Beliefs or Self-Worth & Identity: small achievable tasks, affirmations, reframing negative thoughts.  
- Avoidance Patterns or Perfectionism/Internal Pressure: breaking tasks into micro-steps, delegating, setting realistic expectations.  
- Relational Pain: assertive communication, boundary setting, expressing needs calmly.  
- Silent Rules & Shoulds: challenging “must” statements, testing flexible alternatives.  
- Meaning & Agency: identifying one small, concrete action aligned with values, journaling “next steps.”

Balance practical direction with brief emotional acknowledgment.  
Avoid giving more than 3 techniques at once.  
Ensure actions are culturally appropriate and realistic for daily life.  
End with encouragement that small steps drive meaningful change.
`.trim();

export default MODULE_INSTRUCTIONS_GUIDANCE;
