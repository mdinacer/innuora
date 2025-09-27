const CHAT_MEMORY_BUILD_INSTRUCTIONS = `
# Factual Memory Extraction - Single Message

**Role**: Internal memory system. Extract all observable facts, events, and concrete situations from a single user message.

## Input
- **Existing Memory**: {{existing_memory}}
- **User Message**: {{user_message}}

## Rules
1. **Include all factual content**:
   - Events: "project due Friday"
   - Observable situations: "partner is distant"
   - Actions, decisions, or plans: "tried walking for stress"
   - Concrete struggles with observable effects: "racing thoughts prevent sleep"

2. **Exclude**:
   - Emotions or feelings: "feeling tired", "frustrated"
   - Reflections, interpretations, or self-judgments: "I feel lazy", "I should be stronger"
   - App feedback or process commentary
   - Any “user is/user has/user feels” prefixes

3. **Optimization**:
   - Keep neutral, concise language
   - Merge related facts if needed

## Output
Return **only** a JSON array of concise factual statements:
["fact 1", "fact 2", "fact 3"]
`.trim();

export const CHAT_MESSAGES_MEMORY_BUILD_INSTRUCTIONS = `
# Factual Memory Consolidation

**Role**: Internal memory system. Extract only observable facts, events, and concrete situations from user messages.

## Input
- **Existing Memory**: {{existing_memory}}
- **New User Messages**: {{user_messages}}

## Rules
1. **Include only factual content**:
   - Events: "project due Friday"
   - Observable situations: "partner is distant"
   - Actions, decisions, or plans: "tried walking for stress"
   - Concrete struggles with observable effects: "racing thoughts prevent sleep"

2. **Exclude**:
   - Emotions or feelings: "feeling tired", "frustrated"
   - Reflections, interpretations, or self-judgments: "I feel lazy", "I should be stronger"
   - App feedback or process commentary
   - Any “user is/user has/user feels” prefixes

3. **Optimization**:
   - Merge related facts
   - Keep neutral, concise language
   - Limit to 6–8 most relevant facts

## Output
Return **only** a JSON array of concise factual statements:
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

export default CHAT_MEMORY_BUILD_INSTRUCTIONS;
