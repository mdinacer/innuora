# Holistic Conversation Engine - Implementation Plan

## Overview

Replace the legacy modular CBT flow system with a new holistic reflective conversation engine while maintaining seamless backward compatibility.

---

## 1. Architecture Analysis (Current System)

### Current Flow System:

```
domains/session-flow/
  ├── utils/load-session-flow.ts       # Loads structured JSON flows
  ├── constants/sessions.props.ts      # Flow step definitions
  └── types/flow-session.types.ts      # Flow types

domains/cbt-modules/
  ├── modules.core.ts                  # Module instructions (COGNITIVE, BEHAVIORAL, etc.)
  ├── modules.process.ts               # Process modules (VALIDATE, OVERWHELM, etc.)
  ├── modules-prompt-builder.ts        # Builds prompts from modules
  └── constants/modules.ts             # Module constants

domains/open-chat/
  └── open-chat.action.ts              # Current open chat implementation (uses modules)
```

### Current Database Schema:

```prisma
model Session {
  id              String
  userId          String
  title           String
  subtitle        String?
  autoUpdateTitle Boolean
  persistOnCloud  Boolean
  metadata        Json        # { messageCount, creditsUsed }
  encryptedData   Json?       # { messages: [...] }

  serverContext   SessionContext?  # One-to-one relationship
  aiOperations    AiOperationLog[]
}

model SessionContext {
  sessionId     String  @id
  encryptedData Json    # { analysisSnapshots, aggregatedAnalysis, memoryStore, continuitySummary }
}
```

---

## 2. New System Design

### Domain Structure:

```
src/domains/conversation-engine/
  ├── constants/
  │   ├── prompts.ts                   # COMPACT_OPTIMIZED prompts (EN/AR)
  │   └── engine-config.ts             # Engine configuration
  │
  ├── types/
  │   ├── engine-input.types.ts        # Input types (conversation_window, relational_trace, etc.)
  │   ├── engine-output.types.ts       # Output types (reflection, meta, signals, etc.)
  │   └── conversation-mode.types.ts   # HOLISTIC | MODULAR (for migration)
  │
  ├── services/
  │   ├── conversation-engine.service.ts    # Main engine service
  │   ├── prompt-builder.service.ts         # Builds engine prompts
  │   └── relational-trace.service.ts       # Manages relational continuity
  │
  ├── actions/
  │   └── conversation-engine.action.ts     # Server action (replaces open-chat.action.ts)
  │
  └── index.ts                          # Public exports
```

---

## 3. Database Schema Changes

### Required Changes:

**A. Add conversation mode to Session model:**

```prisma
model Session {
  // ... existing fields ...

  conversationMode ConversationMode @default(MODULAR) @map("conversation_mode")

  // Migration notes:
  // - Existing sessions default to MODULAR (backward compatibility)
  // - New sessions can use HOLISTIC
  // - User can switch modes (future feature)
}

enum ConversationMode {
  MODULAR   // Legacy CBT modules system
  HOLISTIC  // New reflective engine
}
```

**B. Update SessionContext encrypted data structure:**

Current structure:

```typescript
{
  analysisSnapshots: [],
  aggregatedAnalysis: {},
  memoryStore: "",
  continuitySummary: ""
}
```

New structure (backward compatible):

```typescript
{
  // Legacy fields (keep for MODULAR mode)
  analysisSnapshots?: [],
  aggregatedAnalysis?: {},

  // New holistic fields
  memoryStore: "",                    // Unified memory (both modes use this)
  continuitySummary: "",              // Unified continuity (both modes use this)
  relationalTrace?: {                 // NEW: For HOLISTIC mode only
    last_theme: string,
    tone_shift: string,
    unresolved_thread: string,
    last_warmth_level: number,
    psychoeducation_last_turn: boolean
  }
}
```

**C. Migration Strategy:**

```sql
-- Add conversation mode column with default
ALTER TABLE sessions
ADD COLUMN conversation_mode VARCHAR(20) DEFAULT 'MODULAR' NOT NULL;

-- No data migration needed for SessionContext
-- Structure is backward compatible
```

---

## 4. Implementation Steps

### Phase 1: Core Domain Setup

**Step 1.1: Create domain folder structure**

```bash
mkdir -p src/domains/conversation-engine/{constants,types,services,actions}
```

**Step 1.2: Copy optimized prompts**

```typescript
// src/domains/conversation-engine/constants/prompts.ts
export const HOLISTIC_ENGINE_PROMPTS = {
  en: HOLISTIC_REFLECTIVE_ENGINE_INSTRUCTIONS_COMPACT,
  ar: HOLISTIC_REFLECTIVE_ENGINE_INSTRUCTIONS_COMPACT_AR,
} as const;
```

**Step 1.3: Define types**

```typescript
// src/domains/conversation-engine/types/engine-input.types.ts
export type ConversationWindow = {
  role: "user" | "assistant";
  content: string;
}[];

export type RelationalTrace = {
  last_theme: string;
  tone_shift: string;
  unresolved_thread: string;
  last_warmth_level: number;
  psychoeducation_last_turn: boolean;
};

export type EngineInput = {
  conversation_window: ConversationWindow;
  current_user_message: string;
  relational_trace?: RelationalTrace;
  config?: {
    warmth_clamp_delta?: number;
    psychoedu_cooldown_turns?: number;
    micro_breath_cooldown?: number;
  };
};

// src/domains/conversation-engine/types/engine-output.types.ts
export type EngineOutput = {
  reflection: string;
  psychoeducational_thread: {
    type: "integrated" | "none";
    content: string;
  };
  signals: {
    resistance: "none" | "sarcasm" | "dismissive" | "intellectualized";
    crisis: "none" | "acute";
  };
  meta: {
    stance: "grounded" | "steady" | "containing" | "receptive";
    tone_intent: "calm" | "warm" | "attuned" | "clear";
    warmth_level: number;
    responsiveness: "steady" | "softening" | "firming";
    goal_for_next_layer: string;
    accuracy: number;
    drift: "none" | "minor" | "major";
    used_lived_line: boolean;
    used_micro_breath: boolean;
  };
  next_relational_trace: RelationalTrace;
};
```

### Phase 2: Service Implementation

**Step 2.1: Conversation Engine Service**

```typescript
// src/domains/conversation-engine/services/conversation-engine.service.ts
import { SendPromptsToAi } from "@/app/actions/ai-client-actions";
import { HOLISTIC_ENGINE_PROMPTS } from "../constants/prompts";
import type { EngineInput, EngineOutput } from "../types";

export class ConversationEngineService {
  async processMessage(
    input: EngineInput,
    locale: "en" | "ar",
    userId: string,
    sessionId: string
  ): Promise<EngineOutput> {
    // 1. Build prompt
    const systemPrompt = HOLISTIC_ENGINE_PROMPTS[locale];
    const userPrompt = this.buildUserPrompt(input);

    // 2. Call AI
    const response = await SendPromptsToAi({
      systemPrompt,
      userPrompt,
      userId,
      sessionId,
      operation: "holistic_conversation",
    });

    // 3. Parse and validate response
    const output = this.parseEngineOutput(response.content);

    return output;
  }

  private buildUserPrompt(input: EngineInput): string {
    return `
Engine Inputs (JSON):
${JSON.stringify(input, null, 2)}
    `.trim();
  }

  private parseEngineOutput(content: string): EngineOutput {
    // Parse JSON response from AI
    const parsed = JSON.parse(content);

    // Validate structure
    // ... validation logic ...

    return parsed as EngineOutput;
  }
}
```

**Step 2.2: Relational Trace Service**

```typescript
// src/domains/conversation-engine/services/relational-trace.service.ts
import { getSessionContext, updateSessionContext } from "@/lib/session/session-context-service";
import type { RelationalTrace } from "../types";

export class RelationalTraceService {
  async getTrace(sessionId: string): Promise<RelationalTrace | undefined> {
    const context = await getSessionContext(sessionId);
    return context?.relationalTrace;
  }

  async saveTrace(sessionId: string, trace: RelationalTrace): Promise<void> {
    await updateSessionContext(sessionId, {
      relationalTrace: trace,
    });
  }
}
```

### Phase 3: Server Action

**Step 3.1: Create Conversation Engine Action**

```typescript
// src/domains/conversation-engine/actions/conversation-engine.action.ts
"use server";

import { ConversationEngineService } from "../services/conversation-engine.service";
import { RelationalTraceService } from "../services/relational-trace.service";
import { getConversationWindow } from "../utils/conversation-window";

export async function sendHolisticMessage(params: {
  sessionId: string;
  userId: string;
  message: string;
  locale: "en" | "ar";
}) {
  const engineService = new ConversationEngineService();
  const traceService = new RelationalTraceService();

  // 1. Get conversation window (last 6-10 messages)
  const conversation_window = await getConversationWindow(params.sessionId);

  // 2. Get relational trace (continuity)
  const relational_trace = await traceService.getTrace(params.sessionId);

  // 3. Build input
  const input = {
    conversation_window,
    current_user_message: params.message,
    relational_trace,
  };

  // 4. Process message
  const output = await engineService.processMessage(input, params.locale, params.userId, params.sessionId);

  // 5. Save new relational trace
  await traceService.saveTrace(params.sessionId, output.next_relational_trace);

  // 6. Handle crisis if detected
  if (output.signals.crisis === "acute") {
    // Trigger crisis UI resources
    // ... crisis handling logic ...
  }

  return {
    reflection: output.reflection,
    meta: output.meta,
    signals: output.signals,
  };
}
```

### Phase 4: Migration Strategy

**Step 4.1: Dual Mode Support**

```typescript
// src/domains/open-chat/open-chat.action.ts (updated)
export async function sendMessage(params: {
  sessionId: string;
  message: string;
  // ... other params
}) {
  // Get session mode
  const session = await getSession(params.sessionId);

  if (session.conversationMode === "HOLISTIC") {
    // Use new engine
    return sendHolisticMessage(params);
  } else {
    // Use legacy modular system
    return sendModularMessage(params);
  }
}
```

**Step 4.2: Gradual Rollout**

```typescript
// Feature flag for gradual rollout
const HOLISTIC_ROLLOUT_PERCENTAGE = 0.1; // 10% of new sessions

export async function createSession(userId: string) {
  const mode = Math.random() < HOLISTIC_ROLLOUT_PERCENTAGE ? "HOLISTIC" : "MODULAR";

  return prisma.session.create({
    data: {
      userId,
      conversationMode: mode,
      // ... other fields
    },
  });
}
```

---

## 5. Testing Strategy

### Unit Tests:

- ✅ Conversation engine service
- ✅ Relational trace service
- ✅ Prompt builder
- ✅ Output parser

### Integration Tests:

- ✅ End-to-end conversation flow
- ✅ Crisis detection and handling
- ✅ Relational trace persistence
- ✅ Mode switching (MODULAR ↔ HOLISTIC)

### Migration Tests:

- ✅ Existing MODULAR sessions work unchanged
- ✅ New HOLISTIC sessions work correctly
- ✅ SessionContext backward compatibility

---

## 6. Rollout Plan

### Week 1-2: Core Implementation

- ✅ Set up domain structure
- ✅ Implement core services
- ✅ Create server actions
- ✅ Add database migration

### Week 3: Testing & Refinement

- ✅ Write comprehensive tests
- ✅ Test crisis protocol
- ✅ Verify backward compatibility
- ✅ Performance testing

### Week 4: Gradual Rollout

- Day 1-2: 5% of new sessions → HOLISTIC
- Day 3-5: Monitor metrics, fix bugs
- Day 6-7: 25% of new sessions → HOLISTIC
- Week 5: 50% rollout
- Week 6: 100% rollout (keep MODULAR for existing sessions)

### Week 7+: Deprecation Planning

- Announce MODULAR deprecation (3-month notice)
- Provide migration tool for existing sessions
- Monitor and support edge cases

---

## 7. Success Metrics

### Technical Metrics:

- ✅ Response time < 7s (target: 5-7s)
- ✅ Error rate < 1%
- ✅ Crisis detection accuracy > 95%
- ✅ Zero data loss during migration

### Quality Metrics:

- ✅ Psychoeducation frequency: 25-33%
- ✅ Opening variety: > 80% unique patterns
- ✅ Embodied metaphors: > 90%
- ✅ User satisfaction (survey after 10 messages)

### Business Metrics:

- ✅ Token cost per message: ~1,600 tokens (EN), ~2,000 tokens (AR)
- ✅ Cost savings vs OPTIMIZED: 32%
- ✅ User retention rate (compare MODULAR vs HOLISTIC)

---

## 8. Risk Mitigation

### Risk 1: AI output parsing failures

**Mitigation**: Robust error handling, retry logic, fallback to safe responses

### Risk 2: Crisis detection false positives/negatives

**Mitigation**: Human review of crisis logs, continuous refinement of detection keywords

### Risk 3: Performance degradation

**Mitigation**: Caching strategies, prompt optimization, monitoring

### Risk 4: User confusion during transition

**Mitigation**: Clear UI indicators, gradual rollout, user education

---

## Next Steps

1. **Review and approve** this implementation plan
2. **Run database migration** to add `conversation_mode` field
3. **Implement Phase 1** (domain setup)
4. **Implement Phase 2** (services)
5. **Test thoroughly** before rollout
6. **Deploy gradually** with monitoring

---

**Status**: Ready for implementation 🚀
**Estimated Timeline**: 4-6 weeks to full production rollout
**Confidence Level**: High (well-defined architecture, backward compatible)
