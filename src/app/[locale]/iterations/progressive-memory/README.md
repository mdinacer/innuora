# Progressive Memory Iteration

## Overview

This iteration implements a **progressive continuous memory system** that enables deep understanding of a woman's emotional patterns over time, providing clarity and meaning rather than just companionship.

## Key Concept

Unlike Replika (which focuses on companionship), this system is designed to:

1. **Name what she's carrying** - Give language to her experience
2. **See patterns** - Identify recurring emotional, relational, and behavioral patterns
3. **Understand why** - Gradually infer underlying beliefs and protective patterns
4. **Track change** - Notice what's shifting and what's stuck

## Memory Architecture

### 9 Progressive Layers:

1. **Life Context** (Sessions 1-2)
   - Relationships, responsibilities, constraints
   - Basic facts about her life

2. **Emotional Patterns** (Sessions 1-3)
   - Recurring feelings, triggers, coping mechanisms
   - Observable emotional landscape

3. **Relational Patterns** (Sessions 2-5)
   - Dynamics with partner, family, kids, others
   - Her role, their role, underlying patterns

4. **Behavioral Patterns** (Sessions 2-5)
   - What she does repeatedly
   - Consequences of these patterns
   - What she avoids or fears

5. **Core Struggles** (Sessions 3-6)
   - Primary themes (invisible labor, feeling unseen)
   - Surface vs deeper issues
   - Repeating cycles

6. **Underlying Beliefs** (Sessions 5-10)
   - About self, others, relationships
   - Where she learned these beliefs

7. **Protective Patterns** (Sessions 6-10)
   - Core protection strategy
   - What it protects against

8. **Progression** (Ongoing)
   - New awareness, shifts, resistance
   - What's changing

9. **Recent Context** (Rolling window)
   - Last 3 session topics
   - Active struggles
   - Current emotional state

## How It Works

### Memory Building Process:

1. **User sends message** → Stored in conversation history
2. **Generate reflection** → Using GPT-4o with current memory context
3. **Extract memory updates** → GPT-4o-mini analyzes conversation and extracts structured updates
4. **Merge updates** → New information merged with existing memory (strengthens patterns, doesn't just overwrite)
5. **Display updated memory** → User can see how understanding deepens

### Progressive Principles:

- **Sessions 1-2**: Only capture concrete facts, no deep inference
- **Sessions 3-5**: Start seeing patterns in what repeats
- **Sessions 6-10**: Carefully infer underlying beliefs and dynamics
- **Session 10+**: Refine and track progression

## Implementation

### Tech Stack:
- **Types**: TypeScript interfaces for memory structure
- **Prompts**: Context-aware prompts for memory extraction and reflection
- **Services**: Memory update and merging logic
- **Actions**: Server actions for conversation handling
- **Hooks**: Client hook for conversation management
- **Store**: Zustand for client state
- **Components**: UI for chat and memory display

### Key Files:

```
progressive-memory/
├── types/continuous-memory.types.ts    # Memory structure
├── prompts/memory-extraction.prompt.ts # AI prompts
├── services/memory-update.service.ts   # Memory update logic
├── actions/conversation.actions.ts     # Server actions
├── hooks/use-conversation.ts           # Client hook
├── stores/conversation.store.ts        # State management
├── components/                         # UI components
└── page.tsx                            # Main page
```

## Testing

### To Test This Iteration:

1. **Navigate to**: `/en/iterations/progressive-memory`

2. **Simulate a realistic user journey**:
   - **Session 1-2**: Share basic context
     - "I'm exhausted. My partner doesn't help with the kids and I'm managing everything while working full time."

   - **Session 3-5**: Continue with more detail, let patterns emerge
     - "I asked him to help with bedtime and he acted like I was nagging. So I just did it myself."

   - **Session 6-10**: Go deeper, mention family of origin
     - "I think I learned this from my mom. She never asked for anything, just did everything."

3. **Watch the memory panel** on the right side to see:
   - How basic facts are captured first
   - How patterns emerge as things repeat
   - How beliefs are inferred carefully over time
   - How progression is tracked

### Expected Results:

**Early Sessions (1-3):**
- Memory captures concrete facts
- Emotional patterns start showing up
- No deep inference yet

**Mid Sessions (4-7):**
- Relational patterns clearly identified
- Behavioral cycles named
- Core struggles crystallizing

**Later Sessions (8+):**
- Underlying beliefs inferred
- Protective patterns understood
- Progression tracked

### Example Memory After 10 Sessions:

See the `types/continuous-memory.types.ts` file for the full example structure.

## Key Differentiators

### vs. Replika:
- **Replika**: "I'm here for you" (companionship)
- **This**: "Here's what I'm seeing in your patterns" (clarity)

### vs. ChatGPT:
- **ChatGPT**: Forgets context, generic responses
- **This**: Remembers progressively, women-specific understanding

### vs. Therapy:
- **Therapy**: Diagnosis, treatment, clinical
- **This**: Pattern recognition, clarity, warm tone

## Research Validation

This implementation is based on 2024-2025 research showing:

1. ✅ Users want to feel **"seen not managed"**
2. ✅ Women want **language for their experience** ("I didn't know how to describe this")
3. ✅ Users want **gentle clarity** about patterns
4. ✅ Users want **warm, non-clinical tone**
5. ✅ Privacy-first architecture (70%+ care about this)
6. ✅ Persistent memory matters (Replika proves this)

## Next Steps

After testing this iteration:

1. **Evaluate reflection quality**: Does it feel warm and understanding?
2. **Evaluate memory accuracy**: Does it capture patterns correctly?
3. **Evaluate progression**: Does understanding deepen over sessions?
4. **Test with real women**: Get feedback on whether this provides clarity
5. **Optimize prompts**: Refine based on actual usage

## Notes

- This is a **sandboxed iteration** - isolated from production code
- Only reuses `processAi` function for AI calls
- All other logic is self-contained
- Can be tested independently without affecting production
