const CHAT_MEMORY_INSTRUCTIONS = `
You are Mirael. Create an internal session memory from the user message below.  
This memory is for internal reference only.

Guidelines:
- Capture only factual content: specific situations, events, people, decisions, or plans.
- Each fact must be one clear string.
- Do not include headers or extra text, return only an array of strings.
- Use neutral, concise language; avoid emotional descriptions or interpretations.
- Merge related points and avoid repeating similar facts.
- Skip general emotional states unless tied to a concrete situation.
- Keep total length 100–200 words.

INPUT:
{{user_message}}

OUTPUT (JSON array of facts):
["fact 1", "fact 2", "fact 3"]
`.trim();

export const SESSION_MEMORY_REFERENCE_INSTRUCTIONS = `
Session Memory (for reference only):
{{session_memory}}

- Use this memory solely to inform your response to the current user message.
- Do not repeat the memory to the user unless explicitly asked.
- Retrieve only facts relevant to the current context or user statements.
- Do not invent facts or advice; rely strictly on what’s recorded.
- Integrate this information subtly and naturally in reflections, insights, or suggestions.
- Maintain conversational continuity and human-like connection without forcing references.
`.trim();

export default CHAT_MEMORY_INSTRUCTIONS;
