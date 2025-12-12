import type { ContinuousMemory } from "../types/continuous-memory.types";

/**
 * Prompt for GPT-4o-mini to extract memory updates from conversation
 */
export function buildMemoryExtractionPrompt(
  userMessage: string,
  assistantResponse: string,
  existingMemory: ContinuousMemory,
  sessionCount: number
): string {
  const guidanceBySession = getSessionGuidance(sessionCount);

  return `You are a memory extraction system for a therapeutic support app specifically designed for women. Your job is to progressively build a deep understanding of the user over time.

## Current Session: ${sessionCount}

${guidanceBySession}

## Existing Memory:
${JSON.stringify(existingMemory, null, 2)}

## Recent Conversation:
User: "${userMessage}"
Assistant: "${assistantResponse}"

## Your Task:
Analyze this conversation and extract updates to the memory structure. Follow these principles:

1. **Progressive Building**: ${getProgressivePrinciple(sessionCount)}
2. **Strengthen Patterns**: If something appears again, strengthen it (don't just add duplicate)
3. **Infer Carefully**: Only infer deeper layers (beliefs, protective patterns) when evidence accumulates
4. **Track Change**: Note what's different from before (progression)
5. **Stay Grounded**: Base updates on what was actually said, not assumptions

## Output Format:
Return a JSON object with ONLY the fields that need updating. Do not include fields with no updates.

{
  "lifeContextUpdates": { ... },
  "emotionalPatternsUpdates": { ... },
  "relationalPatternsUpdates": { ... },
  "behavioralPatternsUpdates": { ... },
  "coreStrugglesUpdates": { ... },
  "underlyingBeliefsUpdates": { ... },
  "protectivePatternsUpdates": { ... },
  "progressionUpdates": { ... },
  "recentContextUpdates": { ... },
  "reasoning": "Brief explanation of why these updates were made"
}

## Examples of Good Updates:

Session 1-2 (Life Context):
- Add concrete facts: "Has 2 kids ages 5 and 7"
- Add responsibilities: "manages kids' schedules", "full-time work"
- Note constraints: "no family nearby for help"

Session 2-5 (Patterns):
- Identify recurring: "She asks for help → partner gets defensive → she withdraws"
- Note what repeats: "resentment" appears third time
- Track behaviors: "says yes when wants to say no"

Session 5-10 (Deeper):
- Infer beliefs ONLY when supported: "My needs are burdensome" (if she says she feels guilty asking)
- Connect to history: "Learned from mother who was self-sacrificing"
- Name protective pattern: "Over-functioning protects against feeling rejected"

Extract the updates now:`;
}

function getSessionGuidance(sessionCount: number): string {
  if (sessionCount <= 2) {
    return `**Early Sessions (1-2)**: Focus on CONCRETE FACTS
- Life context: relationships, responsibilities, constraints
- Surface emotions: what is she expressing directly?
- DO NOT infer deep patterns yet`;
  }

  if (sessionCount <= 5) {
    return `**Pattern Recognition (3-5)**: Start seeing what REPEATS
- Look for recurring themes in emotions, relationships, behaviors
- Note patterns: "When X happens, she does Y, which leads to Z"
- Begin forming hypotheses about dynamics
- Still mostly observable, not deep inference yet`;
  }

  if (sessionCount <= 10) {
    return `**Deeper Understanding (6-10)**: Carefully infer UNDERLYING DYNAMICS
- With accumulated evidence, infer beliefs: "My needs are burdensome"
- Connect patterns to protective strategies: "Why does she do this?"
- Link to history if mentioned: family of origin, past relationships
- Track what's changing: new awareness, shifts, resistance`;
  }

  return `**Sustained Understanding (10+)**: REFINE and DEEPEN
- Continuously update as understanding evolves
- Track progression: what's shifting, what's stuck
- Deepen belief/pattern understanding as more evidence emerges
- Notice contradictions or new angles`;
}

function getProgressivePrinciple(sessionCount: number): string {
  if (sessionCount <= 2) {
    return "Capture concrete facts only. Avoid inferring deep patterns.";
  }
  if (sessionCount <= 5) {
    return "Look for patterns in what repeats. Hypotheses are okay but mark them as tentative.";
  }
  if (sessionCount <= 10) {
    return "With evidence, infer underlying beliefs and protective patterns. Connect dots carefully.";
  }
  return "Refine and deepen understanding. Track how things evolve or stay stuck.";
}

/**
 * Prompt for generating warm reflection that demonstrates understanding
 */
export function buildReflectionPrompt(
  userMessage: string,
  memory: ContinuousMemory,
  conversationHistory: Array<{ role: string; content: string }>
): string {
  return `You are a warm, understanding companion for women navigating emotional challenges. Your role is to provide CLARITY and MEANING, not just companionship.

## Your Understanding of This Woman:
${generateMemorySummary(memory)}

## Recent Conversation:
${conversationHistory
  .slice(-6)
  .map((msg) => `${msg.role === "user" ? "Her" : "You"}: ${msg.content}`)
  .join("\n")}

## Current Message:
Her: "${userMessage}"

## Your Response Should:
1. **Reflect with Depth**: Not just "I hear you" but "Here's what I'm seeing..."
2. **Name What She's Carrying**: Give language to her experience
3. **Connect Patterns** (if applicable): "I'm noticing..." or "This reminds me of when you mentioned..."
4. **Provide Clarity**: Help her understand WHY this feels heavy or keeps happening
5. **Stay Warm**: Woman-to-woman tone, not clinical
6. **Don't Advise**: Reflection and understanding, not "here's what you should do"

Generate a response that demonstrates you truly understand her:`;
}

function generateMemorySummary(memory: ContinuousMemory): string {
  const parts: string[] = [];

  // Life Context
  if (Object.keys(memory.lifeContext.relationships).length > 0) {
    parts.push(`Context: ${JSON.stringify(memory.lifeContext.relationships)}`);
  }

  // Core Struggles
  if (memory.coreStruggles.primaryThemes.length > 0) {
    parts.push(`Core struggles: ${memory.coreStruggles.primaryThemes.join(", ")}`);
  }

  // Key Pattern
  if (memory.relationalPatterns.withPartner?.pattern) {
    parts.push(`Partner pattern: ${memory.relationalPatterns.withPartner.pattern}`);
  }

  // Repeating Cycle
  if (memory.coreStruggles.repeatingCycle) {
    parts.push(`Cycle: ${memory.coreStruggles.repeatingCycle}`);
  }

  // Underlying Belief
  if (memory.underlyingBeliefs.aboutSelf.length > 0) {
    parts.push(`Beliefs about self: ${memory.underlyingBeliefs.aboutSelf.slice(0, 2).join("; ")}`);
  }

  // Recent State
  if (memory.recentContext.emotionalState) {
    parts.push(`Current state: ${memory.recentContext.emotionalState}`);
  }

  return parts.join("\n");
}
