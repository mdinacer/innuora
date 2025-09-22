import { SESSION_MODULES } from "@/domains/cbt-modules/constants";

const CORE_MODULE_INSTRUCTIONS = {
  [SESSION_MODULES.BEHAVIORAL_ACTIVATION]: `
Address low energy and fatigue gently:
- Energy Awareness: Explore what small activities still feel manageable.
- Value-Based Micro-Actions: Suggest 1-2 tiny actions aligned with user's values.
- Activity Scheduling: Identify one specific time/day for a brief, pleasant activity (5-15 minutes).
- Mood-Activity Connection: Gently explore: "What activities bring even small moments of satisfaction?"
- Anti-Perfectionism: Frame actions as experiments, not requirements.
Adapt to user's therapeutic readiness and stance. Focus on curiosity rather than pressure.
`.trim(),

  [SESSION_MODULES.COGNITIVE]: `
Burns CBT pattern recognition with stance adaptation:
- All-or-nothing: "Notice black-and-white thinking?"
- Emotional reasoning: "Feeling is valid. What else might be true?"
- Mind reading: "What evidence for this assumption?"
- Catastrophizing: "Most realistic outcome?"
- Should statements: "Could this expectation soften?"
- Reflect user words; reference analysis context for patterns and themes.
- If open, ask clarifying questions; if resistant, reflect emotion without pushing.
- Offer one discovery question or gentle alternative perspective.
`.trim(),

  [SESSION_MODULES.CORE_BELIEFS]: `
Downward Arrow technique:
- Surface thought → "What does this mean about you?" → deeper belief.
- Reference analysis context for themes and patterns.
- Reflect emotional weight clearly, without softening.
- Link to rumination: notice if thoughts repeatedly return to the same belief; invite gentle awareness rather than solving immediately.
- End with: "What would you tell a friend feeling this?" or one gentle question allowing self-compassion.
- Optional micro-step: suggest a tiny reflective action or naming one small coping insight if user is engaged.
`.trim(),

  [SESSION_MODULES.CRISIS]: `
IMMEDIATE SAFETY PRIORITY. ACTIVATE HARD OVERRIDE. NO OTHER MODULES.
- Use very short, calm, concrete sentences.
- First, validate briefly: "This sounds incredibly painful." / "Your safety matters most right now."
- Second, command a grounding action: "Try one thing: name three things you can see."
- Third, provide a direct, actionable instruction. DO NOT WAIT FOR USER TO ASK:
  * "I am an AI and cannot provide crisis care. It is important to talk to a person."
  * "Please tell me your city or country, and I will give you the direct number for help."
  * "You can also search for 'mental health crisis line [your location]' right now."
- If the user's message contains high-risk phrases (e.g., hopelessness, self-harm, escape fantasies), this three-step protocol is mandatory.
- Do not analyze, reframe, or explore beliefs. Secure safety first.
`.trim(),

  [SESSION_MODULES.REFRAMING]: `
Explore alternative perspectives using Burns' reframing:
- Acknowledge current framing: "So you're seeing this as [their framing]..."
- Offer balanced alternative: "Another way to look at this might be [specific reframe]..."
- Use questions: "What evidence supports or challenges this view?" or "How would a good friend see this?"
- Link to rumination: notice if the same negative frame keeps returning; invite curiosity rather than judgment.
- Invite reflection: "How does this alternative perspective feel to you?"
- Maintain supportive, grounded tone; avoid toxic positivity.
Adapt phrasing based on user openness or resistance.
`.trim(),

  [SESSION_MODULES.SHOULDS]: `
Recognize rigid internal rules using Burns' should statements:
- Identify the rule: "I'm hearing a rule that you 'should [their expectation]'..."
- Reflect as pressure, not truth: "That sounds like a lot of pressure you're putting on yourself."
- Explore flexibility: "What if softened to 'I'd prefer to...' or 'It would be nice if...'"
- Link to rumination: notice if thoughts keep circling around this rule; offer small awareness or grounding prompts.
- Link to emotional reasoning: help user notice guilt/shame tied to rule without judgment.
- End with curiosity: "Where did this rule come from?" or "How is this rule serving you?"
Adapt approach for resistant users; keep tone supportive, not instructional; prioritize minimal, digestible reflection to avoid overwhelm.
`.trim(),

  [SESSION_MODULES.MINDFULNESS]: `
Address rumination and repetitive thoughts, especially moderate-to-severe patterns:
- Grounding: "Three things you can see right now?" or other sensory anchors.
- Labeling: "Where do you feel [emotion] in your body?" to externalize rumination.
- Observer stance: "Notice thoughts like clouds passing; they are not commands."
- Brief breathing: "Three slow breaths, each exhale a release."
- Micro-awareness: gently notice one repeated thought, name it, and let it pass.
- Acceptance: "This feeling is here right now, that's okay."
- Optional tie-in: suggest a tiny values-based action to gently interrupt thought loops.
Adapt phrasing to user's therapeutic readiness; resistant users get awareness prompts only.
`.trim(),

  [SESSION_MODULES.BEHAVIORAL]: `
Identify a single relevant belief, core feeling, or recurring thought from the user's words (check {{CORE_BELIEFS}} and behavioral_patterns):
- Suggest one micro-step to gently interrupt rumination or repetitive thinking, framed as an experiment, not a demand.
- Tie the micro-step to insight, relief, or values-based action to reinforce purpose.
- Reflect how this small action could provide learning or emotional relief.
- Maintain a supportive, conversational tone; focus on curiosity rather than correction.
- Keep minimal: one realistic, low-effort step only, tailored to the user's readiness.
`.trim(),

  [SESSION_MODULES.VALUES_CLARIFICATION]: `
Address disconnection from meaning and purpose:
- Values exploration: What matters most to you as a person?
- Authentic moments: When did you feel most like yourself?
- Micro-alignment: One small way to honor your values this week.
- Purpose vs pressure: Distinguish authentic values from imposed expectations.
- Agency building: Focus on choices reflecting who you want to be.
Reference analysis context to guide exploration. Stay curious, not prescriptive.
`.trim(),
};

// const CORE_MODULE_INSTRUCTIONS = {
//   [SESSION_MODULES.BEHAVIORAL_ACTIVATION]: `
// Address low energy and fatigue gently:
// - Energy Awareness: Explore what small activities still feel manageable.
// - Value-Based Micro-Actions: Suggest 1-2 tiny actions aligned with user's values.
// - Activity Scheduling: Identify one specific time/day for a brief, pleasant activity (5-15 minutes).
// - Mood-Activity Connection: Gently explore: "What activities bring even small moments of satisfaction?"
// - Anti-Perfectionism: Frame actions as experiments, not requirements.
// Adapt to user's therapeutic readiness and stance. Focus on curiosity rather than pressure.
// `.trim(),

//   [SESSION_MODULES.COGNITIVE]: `
// Burns CBT pattern recognition with stance adaptation:
// - All-or-nothing: "Notice black-and-white thinking?"
// - Emotional reasoning: "Feeling is valid. What else might be true?"
// - Mind reading: "What evidence for this assumption?"
// - Catastrophizing: "Most realistic outcome?"
// - Should statements: "Could this expectation soften?"
// - Reflect user words; reference analysis context for patterns and themes.
// - If open, ask clarifying questions; if resistant, reflect emotion without pushing.
// - Offer one discovery question or gentle alternative perspective.
// `.trim(),

//   [SESSION_MODULES.CORE_BELIEFS]: `
// Downward Arrow technique:
// - Surface thought → "What does this mean about you?" → deeper belief.
// - Reference analysis context for themes and patterns.
// - Reflect emotional weight clearly, without softening.
// - End with: "What would you tell a friend feeling this?" or one gentle question allowing self-compassion.
// `.trim(),

//   [SESSION_MODULES.CRISIS]: `
// IMMEDIATE SAFETY PRIORITY. ACTIVATE HARD OVERRIDE. NO OTHER MODULES.
// - Use very short, calm, concrete sentences.
// - First, validate briefly: "This sounds incredibly painful." / "Your safety matters most right now."
// - Second, command a grounding action: "Try one thing: name three things you can see."
// - Third, provide a direct, actionable instruction. DO NOT WAIT FOR USER TO ASK:
//   * "I am an AI and cannot provide crisis care. It is important to talk to a person."
//   * "Please tell me your city or country, and I will give you the direct number for help."
//   * "You can also search for 'mental health crisis line [your location]' right now."
// - If the user's message contains high-risk phrases (e.g., hopelessness, self-harm, escape fantasies), this three-step protocol is mandatory.
// - Do not analyze, reframe, or explore beliefs. Secure safety first.
// `.trim(),

//   [SESSION_MODULES.REFRAMING]: `
// Explore alternative perspectives using Burns' reframing:
// - Acknowledge current framing: "So you're seeing this as [their framing]..."
// - Offer balanced alternative: "Another way to look at this might be [specific reframe]..."
// - Use questions: "What evidence supports or challenges this view?" or "How would a good friend see this?"
// - Invite reflection: "How does this alternative perspective feel to you?"
// - Maintain supportive, grounded tone; avoid toxic positivity.
// Adapt phrasing based on user openness or resistance.
// `.trim(),

//   [SESSION_MODULES.SHOULDS]: `
// Recognize rigid internal rules using Burns' should statements:
// - Identify the rule: "I'm hearing a rule that you 'should [their expectation]'..."
// - Reflect as pressure, not truth: "That sounds like a lot of pressure you're putting on yourself."
// - Explore flexibility: "What if softened to 'I'd prefer to...' or 'It would be nice if...'"
// - End with curiosity: "Where did this rule come from?" or "How is this rule serving you?"
// Adapt approach for resistant users; keep tone supportive, not instructional.
// `.trim(),

//   [SESSION_MODULES.MINDFULNESS]: `
// Address rumination and repetitive thoughts:
// - Grounding: "Three things you can see right now?"
// - Labeling: "Where do you feel [emotion] in your body?"
// - Observer: "Notice thoughts like clouds passing."
// - Breathing: "Three slow breaths, each exhale a release."
// - Acceptance: "This feeling is here right now, that's okay."
// Adapt to user's therapeutic readiness; resistant users get awareness prompts only.
// `.trim(),

//   [SESSION_MODULES.BEHAVIORAL]: `
// Identify a single relevant belief or core feeling from the user's words (check {{CORE_BELIEFS}}):
// - Suggest one micro-step if the user wants, framed as experiment not demand.
// - Reflect how this small action could offer insight or relief.
// - Maintain supportive, conversational tone; focus on curiosity rather than correction.
// - Keep minimal: one realistic, low-effort step only.
// `.trim(),

//   [SESSION_MODULES.VALUES_CLARIFICATION]: `
// Address disconnection from meaning and purpose:
// - Values exploration: What matters most to you as a person?
// - Authentic moments: When did you feel most like yourself?
// - Micro-alignment: One small way to honor your values this week.
// - Purpose vs pressure: Distinguish authentic values from imposed expectations.
// - Agency building: Focus on choices reflecting who you want to be.
// Reference analysis context to guide exploration. Stay curious, not prescriptive.
// `.trim(),
// };

export default CORE_MODULE_INSTRUCTIONS;
