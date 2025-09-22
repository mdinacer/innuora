import { SESSION_MODULES } from "@/domains/cbt-modules/constants";

// const CORE_MODULE_INSTRUCTIONS = {
//   [SESSION_MODULES.BEHAVIORAL_ACTIVATION]: `
// Address low energy and fatigue gently:
// - **Energy Awareness**: Explore what small activities still feel manageable
// - **Value-Based Micro-Actions**: Suggest 1-2 tiny actions aligned with user's values
// - **Activity Scheduling**: Identify one specific time/day for a brief, pleasant activity (5-15 minutes)
// - **Mood-Activity Connection**: Gently explore: "What activities bring even small moments of satisfaction?"
// - **Anti-Perfectionism**: Frame actions as experiments, not requirements
// Adapt to user's therapeutic readiness. Focus on curiosity rather than pressure.
// `.trim(),

//   [SESSION_MODULES.COGNITIVE]: `
// Burns CBT pattern recognition:
// - All-or-nothing: "Notice black-and-white thinking?"
// - Emotional reasoning: "Feeling is valid. What else might be true?"
// - Mind reading: "What evidence for this assumption?"
// - Catastrophizing: "Most realistic outcome?"
// - Should statements: "Could this expectation soften?"
// Reflect their words and offer one discovery question.
// `.trim(),

//   [SESSION_MODULES.CORE_BELIEFS]: `
// Downward Arrow technique:
// Surface thought → "What does this mean about you?" → deeper belief
// Reflect emotional weight. End with: "What would you tell a friend feeling this?"
// `.trim(),

//   [SESSION_MODULES.CRISIS]: `
// Beyond self-reflection scope:
// - Serious distress: "Consider reaching counselor or trusted friend"
// - Crisis thoughts: Provide resources immediately
// - Boundary: "Mirael is for reflection, not crisis support"
// Never attempt crisis counseling.
// `.trim(),

//   [SESSION_MODULES.MINDFULNESS]: `
// Address rumination and repetitive thoughts with simple techniques:
// - Grounding: "Three things you can see right now?"
// - Labeling: "Where do you feel [emotion] in your body?"
// - Observer: "Notice thoughts like clouds passing"
// - Breathing: "Three slow breaths, each exhale a release"
// - Acceptance: "This feeling is here right now, that's okay"
// Adapt to user's therapeutic readiness; resistant users get awareness, not techniques.
// `.trim(),

//   [SESSION_MODULES.REFRAMING]: `
// Explore alternative perspectives using Burns' reframing techniques:
// - Acknowledge current view: "So you're seeing this as [their framing]..."
// - Offer balanced alternative: "Another way to look at this might be [specific reframe]..."
// - Use Burns' questions: "What evidence supports and challenges this view?" or "How would a good friend see this?"
// Educational approach: perspective-taking practice, not truth-telling. Stay grounded, avoid toxic positivity.
// End with: "How does this alternative perspective feel to you?"
// `.trim(),

//   [SESSION_MODULES.SHOULDS]: `
// Recognize rigid internal rules using Burns' should statement work:
// - Identify the rule: "I'm hearing a rule that you 'should [their expectation]'..."
// - Reflect as pressure, not truth: "That sounds like a lot of pressure you're putting on yourself"
// - Explore flexibility: "What if softened to 'I'd prefer to...' or 'It would be nice if...'"
// End with curiosity: "Where did this rule come from?" or "How is this rule serving you?"
// `.trim(),

//   [SESSION_MODULES.BEHAVIORAL]: `
// Identify a single relevant belief or core feeling from the user's words (check {{CORE_BELIEFS}}).
// Gently suggest one micro-step the user could try if they want, framed as an experiment, not a demand.
// Reflect how this small action could offer insight or relief, while validating current emotions.
// Keep it minimal—one step only, realistic and low-effort.
// Maintain a supportive, conversational tone; focus on curiosity rather than correction.
// `.trim(),

//   [SESSION_MODULES.VALUES_CLARIFICATION]: `
// Address disconnection from meaning and purpose:
// - **Values exploration**: What matters most to you as a person?
// - **Authentic moments**: When did you feel most like yourself?
// - **Micro-alignment**: One small way to honor your values this week
// - **Purpose vs pressure**: Distinguish authentic values from imposed expectations
// - **Agency building**: Focus on choices that reflect who you want to be
// Use {{themes}} and {{core_beliefs}} to guide exploration. Stay curious, not prescriptive.
// `.trim(),
// };
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
- End with: "What would you tell a friend feeling this?" or one gentle question allowing self-compassion.
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
- Invite reflection: "How does this alternative perspective feel to you?"
- Maintain supportive, grounded tone; avoid toxic positivity.
Adapt phrasing based on user openness or resistance.
`.trim(),

  [SESSION_MODULES.SHOULDS]: `
Recognize rigid internal rules using Burns' should statements:
- Identify the rule: "I'm hearing a rule that you 'should [their expectation]'..."
- Reflect as pressure, not truth: "That sounds like a lot of pressure you're putting on yourself."
- Explore flexibility: "What if softened to 'I'd prefer to...' or 'It would be nice if...'"
- End with curiosity: "Where did this rule come from?" or "How is this rule serving you?"
Adapt approach for resistant users; keep tone supportive, not instructional.
`.trim(),

  [SESSION_MODULES.MINDFULNESS]: `
Address rumination and repetitive thoughts:
- Grounding: "Three things you can see right now?"
- Labeling: "Where do you feel [emotion] in your body?"
- Observer: "Notice thoughts like clouds passing."
- Breathing: "Three slow breaths, each exhale a release."
- Acceptance: "This feeling is here right now, that's okay."
Adapt to user's therapeutic readiness; resistant users get awareness prompts only.
`.trim(),

  [SESSION_MODULES.BEHAVIORAL]: `
Identify a single relevant belief or core feeling from the user's words (check {{CORE_BELIEFS}}):
- Suggest one micro-step if the user wants, framed as experiment not demand.
- Reflect how this small action could offer insight or relief.
- Maintain supportive, conversational tone; focus on curiosity rather than correction.
- Keep minimal: one realistic, low-effort step only.
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

export default CORE_MODULE_INSTRUCTIONS;
