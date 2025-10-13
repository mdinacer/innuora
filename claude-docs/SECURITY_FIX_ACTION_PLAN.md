# Security Fix Action Plan - Zustand Store Data Leaks

**Date**: January 9, 2025
**Priority**: 🔴 **CRITICAL - MUST FIX BEFORE LAUNCH**

---

## Executive Summary

**Problem**: All Zustand stores are inspectable via DevTools, exposing:

1. 🔴 **CRITICAL**: Complete CBT algorithm (competitive advantage)
2. 🔴 **CRITICAL**: Token usage patterns (pricing mechanism)
3. 🚨 **LEGAL RISK**: Full user conversations (privacy violation)
4. 💰 **FINANCIAL**: Profit margins and cost structure

**Impact**: Competitors can copy your entire system in days.

**Solution**: Move sensitive data server-side, strip client stores.

---

## Immediate Actions Required

### 🔴 Priority 1: Remove Therapeutic Analysis from Client

**Current**: `analysisSnapshots` stored in `useActiveSessionStore`
**Risk**: **Your entire CBT algorithm is visible in DevTools**

**Solution**:

1. **Server-side only** - Never send analysis to client
2. Analysis results → used server-side to generate response
3. Client only receives: final AI message (not the analysis)

**Changes needed**:

```typescript
// BEFORE (❌ EXPOSED)
session: {
  analysisSnapshots: [
    {
      emotionalState: { anxiety: 0.8, ... },
      cognitivePatterns: ["catastrophizing"],
      recommendedModules: [...],
      // FULL ALGORITHM VISIBLE
    }
  ]
}

// AFTER (✅ SECURE)
session: {
  // analysisSnapshots: NOT IN CLIENT STORE
  // Analysis happens server-side only
  // Client just sees AI responses
}
```

**Files to modify**:

- `src/domains/active-session/active-session.store.ts` - Remove `analysisSnapshots` field
- `src/domains/open-chat/open-chat.types.ts` - Make `analysisSnapshots` server-only
- All hooks that add analysis → Move to server actions

---

### 🔴 Priority 2: Strip Token Usage from Metadata

**Current**: Full token breakdown visible in client
**Risk**: **Pricing mechanism and costs exposed**

**Solution**:

```typescript
// Client-side metadata (safe)
metadata: {
  messageCount: 54,
  // NO token data
  // NO credits data
  // NO cost data
}

// Server-side only (never sent to client)
serverAnalytics: {
  tokenUsageBreakdown: [...],
  totals: { ... }
}
```

**Files to modify**:

- `src/domains/active-session/active-session.store.ts` - Remove `addTokenUsage` function
- `src/domains/open-chat/open-chat.types.ts` - Remove `tokenUsage` from `SessionMeta`
- All components showing token usage → Remove or fetch from server API

---

### 🔴 Priority 3: Never Store serverAnalytics Client-Side

**Current**: `serverAnalytics` might be synced to client store
**Risk**: **Complete financial data exposed**

**Solution**:

- `serverAnalytics` exists ONLY in database
- NEVER fetched to client
- NEVER in any Zustand store
- Only accessible via admin dashboard (server-side)

**Files to check**:

- `src/domains/encrypted-session/encrypted-session.store.ts` - Ensure serverAnalytics excluded
- `src/domains/session-sync/services/cloud-sync-service.ts` - Already good (not selected)

---

### ⚠️ Priority 4: Remove Sensitive Session Data from Active Store

**Current**: Full conversations, memory, analysis in client store
**Risk**: **Privacy violation, GDPR/HIPAA concerns**

**Solution**:

**Option A (Encrypted Store Only)**:

```typescript
// Active session store (minimal, no sensitive data)
useActiveSessionStore = {
  sessionId: "abc123",
  isLoading: false,
  isDirty: false,
  // NO messages
  // NO analysis
  // NO memory
  // NO token usage
};

// All sensitive data in encrypted store only
useEncryptedSessionStore = {
  sessions: {
    abc123: {
      encryptedData: {
        /* encrypted blob */
      },
      // User can't read this without decryption key
    },
  },
};
```

**Option B (Keep Active Store, Minimize Data)**:

```typescript
// Active store (working session only)
useActiveSessionStore = {
  session: {
    id: "abc123",
    title: "...",
    messages: [
      /* last 5 messages only for UI */
    ],
    // NO full history
    // NO analysis
    // NO token usage
  },
};
```

**Recommendation**: **Option A** (encrypted store only, active store is just metadata)

---

## Detailed Implementation Plan

### **Phase 1: Server-Side Analysis (Day 1-2)**

#### Step 1.1: Create Server-Side Analysis Service

**New file**: `src/app/actions/therapeutic-analysis-actions.ts`

```typescript
"use server";

import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";

/**
 * Analyze user message server-side
 * NEVER return full analysis to client
 * Only use analysis to generate appropriate response
 */
export async function analyzeUserMessageServerSide(
  userId: string,
  sessionId: string,
  userMessage: string,
  conversationHistory: string[]
): Promise<{
  // Return ONLY what client needs
  suggestedResponse: string;
  creditsUsed: number;
  // NO analysis object
  // NO token usage
  // NO patterns/insights
}> {
  // 1. Get analysis from AI (server-side only)
  const analysis: TherapeuticAnalysis = await performAnalysis(...);

  // 2. Use analysis to generate response (server-side)
  const response = await generateTherapeuticResponse(analysis, ...);

  // 3. Save analysis to DATABASE only (not sent to client)
  await saveAnalysisToDatabase(sessionId, analysis);

  // 4. Calculate & deduct credits (server-side)
  const creditsUsed = await deductCreditsForAnalysis(userId, ...);

  // 5. Return ONLY the response to client
  return {
    suggestedResponse: response,
    creditsUsed: creditsUsed,
    // analysis object stays on server
  };
}
```

#### Step 1.2: Remove Analysis from Client Store

```typescript
// src/domains/open-chat/open-chat.types.ts

export interface Session {
  id: string;
  messages: OpenChatMessage[];
  // analysisSnapshots: REMOVED
  // aggregatedAnalysis: REMOVED
  // Only keep minimal metadata
}
```

#### Step 1.3: Update Chat Flow to Use Server Action

```typescript
// Before (client-side analysis)
const analysis = await analyzeMessage(message);
store.addAnalysis(analysis); // ❌ Exposes algorithm

// After (server-side only)
const { suggestedResponse, creditsUsed } = await analyzeUserMessageServerSide(...);
// Client only sees response, not analysis
```

---

### **Phase 2: Strip Token Usage (Day 2-3)**

#### Step 2.1: Remove Token Tracking from Client

```typescript
// src/domains/active-session/active-session.store.ts

// REMOVE this entire function:
addTokenUsage: (tokenUsage) => {
  // ... DELETE
};

// REMOVE from SessionMeta type:
export interface SessionMeta {
  messageCount: number;
  // tokenUsage: DELETED
  // tokenCount: DELETED
  // inputTokens: DELETED
  // outputTokens: DELETED
  // creditsUsed: DELETED (server calculates)
}
```

#### Step 2.2: Server-Side Credit Calculation

```typescript
// Client never sees tokens
// Server action handles everything

export async function processUserMessage(message: string) {
  // 1. AI call (server-side)
  const aiResponse = await callAI(message);

  // 2. Track tokens (server-side only, in database)
  await trackTokenUsage(userId, {
    operation: "response",
    tokens: aiResponse.usage.total_tokens,
    cost: calculateCost(aiResponse.usage),
  });

  // 3. Calculate & deduct credits (server-side)
  const credits = calculateCredits(aiResponse.usage);
  await deductCredits(userId, credits);

  // 4. Return to client (NO token data)
  return {
    message: aiResponse.content,
    creditsUsed: credits, // Just the final number
  };
}
```

---

### **Phase 3: Minimize Active Session Store (Day 3-4)**

#### Step 3.1: Keep Only Essential Data

```typescript
// Minimal active session store (what UI needs)
interface ActiveSessionStoreState {
  sessionId: string | null;
  isLoading: boolean;
  isDirty: boolean;

  // Minimal message list (last 5-10 for UI rendering)
  recentMessages: OpenChatMessage[];

  // NO full conversation history
  // NO analysis
  // NO token usage
  // NO server analytics
}
```

#### Step 3.2: Full Data in Encrypted Store Only

```typescript
// All sensitive data encrypted
useEncryptedSessionStore = {
  sessions: {
    abc123: {
      id: "abc123",
      title: "...",
      metadata: {
        messageCount: 54,
        // NO token data
      },
      encryptedData: {
        // Full conversation encrypted
        // User can only decrypt with their key
      },
    },
  },
};
```

---

## Security Testing Checklist

After implementing fixes:

- [ ] Open React DevTools → inspect `useActiveSessionStore`

  - [ ] Verify NO `analysisSnapshots`
  - [ ] Verify NO `tokenUsage`
  - [ ] Verify NO `serverAnalytics`
  - [ ] Verify NO full conversation history

- [ ] Open Redux DevTools (if enabled)

  - [ ] Verify NO sensitive data visible

- [ ] Console: `window.useActiveSessionStore.getState()`

  - [ ] Verify only minimal UI data

- [ ] Check IndexedDB/LocalForage

  - [ ] Verify `encryptedData` is actually encrypted
  - [ ] Verify NO plaintext analysis
  - [ ] Verify NO token breakdown

- [ ] Network tab
  - [ ] Verify server responses don't include analysis objects
  - [ ] Verify only final messages returned to client

---

## Before & After Comparison

### **Before (❌ EXPOSED)**

```javascript
// React DevTools → useActiveSessionStore
{
  session: {
    messages: [/* full conversation */],
    analysisSnapshots: [
      {
        cognitivePatterns: ["catastrophizing"],
        emotionalState: { anxiety: 0.8 },
        recommendedModules: ["cognitive_restructuring"]
        // ENTIRE ALGORITHM VISIBLE
      }
    ],
    metadata: {
      tokenUsage: [/* full breakdown */],
      tokenCount: 153695,
      creditsUsed: 16
      // PRICING MECHANISM VISIBLE
    }
  }
}
```

### **After (✅ SECURE)**

```javascript
// React DevTools → useActiveSessionStore
{
  sessionId: "abc123",
  isLoading: false,
  recentMessages: [
    // Last 5 messages only (for UI)
  ]
  // NO analysis
  // NO tokens
  // NO sensitive data
}

// useEncryptedSessionStore
{
  sessions: {
    "abc123": {
      title: "Session title",
      metadata: {
        messageCount: 54
        // NO tokens, NO credits
      },
      encryptedData: {
        iv: "...",
        ciphertext: "encrypted_blob_unreadable"
      }
    }
  }
}
```

---

## Timeline & Effort Estimate

**Total Effort**: 3-4 days

| Phase | Task                          | Effort   | Priority    |
| ----- | ----------------------------- | -------- | ----------- |
| 1     | Move analysis server-side     | 1.5 days | 🔴 Critical |
| 2     | Strip token usage from client | 1 day    | 🔴 Critical |
| 3     | Minimize active session store | 1 day    | ⚠️ High     |
| 4     | Testing & verification        | 0.5 days | ⚠️ High     |

**Launch Blocker**: YES - Must fix before ANY public access

---

## Next Steps

1. **Review this plan** - confirm approach
2. **Start with Phase 1** (server-side analysis) - highest risk
3. **Test incrementally** - don't break existing functionality
4. **Verify with DevTools** - confirm data not visible

**Ready to start implementation?** Let me know which phase to begin with!
