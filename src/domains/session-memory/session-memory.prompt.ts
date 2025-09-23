import { APP_CONFIG } from "@/config/app";

const CHAT_MEMORY_BUILD_INSTRUCTIONS = `
You are ${APP_CONFIG.name}. Update and optimize the session memory based on the new user message.  
This memory is for internal reference only.

EXISTING MEMORY:
{{existing_memory}}

NEW USER MESSAGE:
{{user_message}}

Guidelines:
- Merge new facts with existing memory, removing duplicates and outdated information
- Capture only factual content: specific situations, events, people, decisions, or plans
- Each fact must be one clear, concise string
- Use neutral language; avoid emotional descriptions or interpretations
- Consolidate related points (e.g., "work stress" + "job anxiety" → "experiencing work-related stress and anxiety")
- Remove superseded information and keep most relevant/recent facts
- If existing memory is empty, create new memory from the user message
- Keep total memory length 150–300 words maximum
- Return only a JSON array of optimized facts

OUTPUT (JSON array of consolidated facts):
["consolidated fact 1", "consolidated fact 2", "consolidated fact 3"]
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

export default CHAT_MEMORY_BUILD_INSTRUCTIONS;
