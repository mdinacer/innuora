# Zustand Store Security Audit

**Date**: January 9, 2025
**Status**: 🔴 **CRITICAL SECURITY ISSUES FOUND**

---

## Overview

All Zustand stores are **inspectable by users** via:

- React DevTools (Components tab → store state visible)
- Redux DevTools (if devtools middleware enabled)
- Browser console: `window.[storeName].getState()`
- LocalForage/IndexedDB inspection

**Risk Level**: 🔴 **CRITICAL** - Exposing competitive intelligence and implementation details

---

## 🔴 CRITICAL ISSUE #1: Active Session Store

**File**: `src/domains/active-session/active-session.store.ts`

### **Currently Exposed Data**

```typescript
useActiveSessionStore.getState() = {
  session: {
    // ❌ EXPOSED: Full conversation (privacy issue)
    messages: [
      { role: "user", content: "I'm feeling anxious about work..." },
      { role: "assistant", content: "..." }
    ],

    // 🔴 CRITICAL: Your entire CBT algorithm
    analysisSnapshots: [
      {
        emotionalState: {
          anxiety: 0.8,
          depression: 0.3,
          // ... scoring system exposed
        },
        cognitivePatterns: [
          "catastrophizing",
          "black_and_white_thinking"
        ],
        behavioralInsights: {
          avoidancePatterns: [...],
          copingStrategies: [...]
        },
        recommendedModules: [
          "cognitive_restructuring",
          "behavioral_activation"
        ],
        therapeuticStance: "validating_gentle",
        interventionPriority: ["safety", "cognitive", "behavioral"],
        riskLevel: "moderate",
        riskFactors: [...],
        // COMPLETE CBT DECISION TREE EXPOSED
      }
    ],

    // 🔴 CRITICAL: Aggregated analysis algorithm
    aggregatedAnalysis: {
      dominantPatterns: [...],
      progressIndicators: [...],
      therapeuticRelationship: "..."
      // PATTERN RECOGNITION ALGORITHM EXPOSED
    },

    // ❌ EXPOSED: Session memory (sensitive user data)
    memoryStore: "User struggles with impostor syndrome...",
    continuitySummary: { text: "...", lastMessageIndex: 27 },

    // 🔴 CRITICAL: Token usage (pricing mechanism)
    metadata: {
      tokenUsage: [
        {
          type: "analysis",
          usage: { prompt_tokens: 5000, completion_tokens: 200 },
          model: "gpt-4o-mini",
          costUSD: 0.03
        },
        { type: "response", usage: { ... } }
      ],
      tokenCount: 153695,
      inputTokens: 139247,
      outputTokens: 14448,
      creditsUsed: 16,
      // REVEALS: tokens-per-credit ratio
    },

    // 🔴 CRITICAL: Server analytics (if not stripped)
    serverAnalytics: {
      tokenUsageBreakdown: [...],
      totals: {
        effectiveMarkup: 0.98,
        profitUSD: -0.01,
        revenueUSD: 0.77
      }
      // EXPOSES PROFIT MARGIN
    }
  }
}
```

### **What Competitors Can Learn**

1. **Your Entire CBT Algorithm** ⚠️

   - Emotional state scoring system
   - Cognitive pattern detection logic
   - Behavioral analysis framework
   - Risk assessment criteria
   - Therapeutic stance adaptation rules
   - Module recommendation engine
   - **Can be copied in 1 day**

2. **Token Usage Patterns** 💰

   - ~5,700 tokens per message (analysis + response)
   - Input/output token split
   - Per-operation token breakdown
   - **Can calculate your costs exactly**

3. **Pricing Mechanism** 💸

   - 153,695 tokens charged as 16 credits
   - Token-to-credit conversion: ~9,606 tokens/credit
   - Real cost vs. revenue (if serverAnalytics present)
   - **Can undercut your pricing**

4. **User Privacy Violation** 🚨
   - Full conversation history visible
   - Sensitive therapeutic content
   - User patterns and struggles
   - **GDPR/HIPAA violation risk**

---

## ⚠️ MODERATE ISSUE #2: Encrypted Session Store

**File**: `src/domains/encrypted-session/encrypted-session.store.ts`

### **Currently Exposed Data**

```typescript
useSessionStore.getState() = {
  sessions: {
    "abc123": {
      id: "abc123",
      userId: "user_xyz",
      title: "Dealing with work anxiety",
      subtitle: "Session on 2025-01-08",

      // ⚠️ EXPOSED: Metadata (less critical but still revealing)
      metadata: {
        messageCount: 54,
        tokenCount: 153695,      // ⚠️ Usage patterns
        inputTokens: 139247,     // ⚠️ Token split
        outputTokens: 14448,
        creditsUsed: 16,         // ⚠️ Pricing hint
        tokenUsage: []           // ✅ Cleared (good!)
      },

      // ⚠️ EXPOSED: Server analytics (if present)
      serverAnalytics: { ... },  // Should NEVER be in client store

      // ✅ ENCRYPTED: Conversation content
      encryptedData: {
        iv: "...",
        ciphertext: "...",
        tag: "..."
      } // ✅ Safe - encrypted
    }
  }
}
```

### **Risk Assessment**

✅ **Good**: `encryptedData` is encrypted (conversation content protected)
✅ **Good**: `tokenUsage` array is cleared
⚠️ **Problem**: `metadata` still reveals token counts and credits
🔴 **Critical**: `serverAnalytics` should NEVER be in client store

---

## ✅ LOW RISK: App User Store

**File**: `src/stores/app-user.store.ts`

### **Currently Exposed Data**

```typescript
useAppUserStore.getState() = {
  user: {
    id: "user_xyz",
    authId: "auth_abc",
    role: "user",
    creditsBalance: 450,      // ✅ OK - user needs to see this
    status: "active",
    isOnboarded: true,

    profile: {
      displayName: "Sarah",
      ageGroup: "Age25_34",
      // ... user-provided data
    },

    config: {
      theme: "dark",
      // ... user preferences
    }
  },
  authUser: {
    email: "user@example.com",
    email_confirmed_at: "..."
  }
}
```

### **Risk Assessment**

✅ **Safe**: All data is user-facing or necessary for UI
✅ **No sensitive implementation details**
✅ **No competitive intelligence**

---

## 🔴 CRITICAL: Flow Session Store

**File**: `src/domains/session-flow/stores/flow-session.store.ts`

Let me check this one:
