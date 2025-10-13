# Pre-Launch Audit & Implementation Roadmap

**Date**: January 2026
**Status**: 🟡 **PRE-LAUNCH REVIEW REQUIRED**
**Priority**: **CRITICAL - BUSINESS VIABILITY**

---

## 🚨 Critical Issues Identified

### 1. **INCOMPLETE CREDIT DEDUCTION SYSTEM**

#### ✅ **Currently Implemented** (Credit Deduction Working):

- **Open Chat Main Flow** (`open-chat.action.ts:249`)
  - ✅ Analysis credits deducted
  - ✅ Response generation credits deducted
  - ✅ Combined into single transaction
  - ✅ Metadata tracked (model, tokens, session)

#### ❌ **NOT IMPLEMENTED** (Missing Credit Deduction):

| **AI Operation**              | **File**                               | **Estimated Cost** | **Risk Level** | **Status**      |
| ----------------------------- | -------------------------------------- | ------------------ | -------------- | --------------- |
| **Session Memory Generation** | `session-memory.action.ts:26`          | ~1-2 credits       | 🔴 HIGH        | ❌ NO DEDUCTION |
| **Session Summary**           | `session-summary.action.ts:28`         | ~2-3 credits       | 🔴 HIGH        | ❌ NO DEDUCTION |
| **Session Wellness Check**    | `session-wellness.ai.ts:61`            | ~1 credit          | 🟡 MEDIUM      | ❌ NO DEDUCTION |
| **Session Diagnostics**       | `session-diagnostics-actions.ts:47,64` | ~5-10 credits      | 🔴 CRITICAL    | ❌ NO DEDUCTION |
| **Lightweight Response**      | `open-chat-lightweight.action.ts:84`   | ~1-2 credits       | 🟡 MEDIUM      | ❌ NO DEDUCTION |

**Total Untracked Cost per Session**: ~10-18 credits (0.10-0.18 USD) being **LOST**

---

### 2. **SESSION COST ANALYSIS**

#### **Typical Session Breakdown** (30-minute conversation, ~20 messages):

| **Operation**              | **Frequency** | **Credits/Op** | **Total Credits** | **Currently Tracked?**       |
| -------------------------- | ------------- | -------------- | ----------------- | ---------------------------- |
| **Therapeutic Analysis**   | 20x           | 2              | 40                | ✅ YES                       |
| **AI Response (M1)**       | 20x           | 5              | 100               | ✅ YES                       |
| **Session Memory**         | 10x           | 2              | 20                | ❌ NO                        |
| **Session Wellness Check** | 2x            | 1              | 2                 | ❌ NO                        |
| **Session Summary**        | 1x            | 3              | 3                 | ❌ NO                        |
| **Session Diagnostics**    | 1x            | 8              | 8                 | ❌ NO                        |
| **TOTAL**                  | -             | -              | **173 credits**   | **140 tracked / 33 missing** |

**Cost per Session**:

- **Actual Cost**: 173 credits = **$1.73 USD**
- **Currently Tracked**: 140 credits = **$1.40 USD**
- **Missing**: 33 credits = **$0.33 USD (19% revenue loss)**

#### **Monthly Volume Projections**:

| **User Type** | **Sessions/Month** | **Cost/User** | **Revenue Loss/User** |
| ------------- | ------------------ | ------------- | --------------------- |
| Light User    | 5                  | $8.65         | $1.65                 |
| Regular User  | 15                 | $25.95        | $4.95                 |
| Heavy User    | 30                 | $51.90        | $9.90                 |

**At 1,000 users (average 10 sessions/month)**:

- **Total Cost**: $17,300/month
- **Revenue Loss**: $3,300/month (19%)
- **Annual Loss**: **$39,600/year**

---

### 3. **PRICING STRATEGY CONCERNS**

#### **Current Pricing** (from `billing-config.ts`):

```typescript
{
  STARTER: { credits: 1000, price: $5 },   // $0.005/credit
  REGULAR: { credits: 2200, price: $10 },  // $0.0045/credit (10% discount)
  PREMIUM: { credits: 6000, price: $25 }   // $0.0042/credit (16% discount)
}
```

#### **DeepSeek's Concern: $30 Subscription Too Low?**

**Analysis**:

- **Cost per Session**: $1.73 (actual, with fixes)
- **Sessions at $30/month**: ~17 sessions
- **Sessions at $50/month**: ~29 sessions
- **Sessions at $70/month**: ~40 sessions

**Competitive Analysis**:

| **Platform**           | **Price/Month**    | **AI Quality** | **Sessions** | **Cost/Session** |
| ---------------------- | ------------------ | -------------- | ------------ | ---------------- |
| BetterHelp             | $260-$360          | Human          | 4-8          | $32-90           |
| Talkspace              | $260-300           | Human          | 4-5          | $52-75           |
| Woebot                 | $39                | Basic AI       | Unlimited    | -                |
| **Innuora (Current)**  | $10 (2200 credits) | GPT-4          | ~12          | $0.83            |
| **Innuora (Proposed)** | $30                | GPT-4          | ~17          | $1.76            |

**Verdict**:

- ✅ **$30 is NOT too low** - still 94% cheaper than human therapy
- 🟡 **Risk**: Unlimited usage could drain credits if users abuse system
- ✅ **Solution**: Implement usage caps or fair-use policies

---

### 4. **PAYMENT PROVIDER DECISION**

#### **Stripe (Current)**:

**Pros**:

- ✅ Already integrated
- ✅ Mature webhook system
- ✅ Excellent documentation
- ✅ Global payment support

**Cons**:

- ❌ Higher fees (2.9% + $0.30)
- ❌ Strict compliance requirements
- ❌ Account holds/freezes for mental health apps

**Status**: 🟢 **WORKING** (webhook implemented in `api/stripe/webhook/route.ts`)

#### **LemonSqueezy** (Mentioned in docs as migration target):

**Pros**:

- ✅ Lower fees (5% + $0.50, but no Stripe fees)
- ✅ Merchant of record (handles VAT/taxes)
- ✅ Mental health-friendly policies
- ✅ Better international support

**Cons**:

- ❌ NOT YET IMPLEMENTED
- ❌ Migration effort required
- ❌ Less mature than Stripe

**Recommendation**:

- **Phase 1 Launch**: Keep Stripe (working system)
- **Phase 2 (Q2 2026)**: Migrate to LemonSqueezy if volume justifies it

#### **Paddle** (Alternative):

- Similar to LemonSqueezy
- Better for B2B/SaaS
- Merchant of record model

---

### 5. **FREE TRIAL STRATEGY**

#### **Option A: Credit-Based Trial**

```typescript
{
  newUserBonus: 100 credits,  // $1.00 value
  estimatedSessions: 1-2 sessions,
  conversionGoal: "Let users experience quality"
}
```

**Cost per Trial User**: $1.00
**Conversion Rate Needed**: >10% to break even
**Risk**: Low

#### **Option B: Time-Limited Trial**

```typescript
{
  duration: "7 days",
  creditsPerDay: 50,
  totalCredits: 350,  // $3.50 value
  estimatedSessions: 5-7 sessions
}
```

**Cost per Trial User**: $3.50
**Conversion Rate Needed**: >25% to break even
**Risk**: Medium

#### **Option C: First Session Free**

```typescript
{
  sessionCredits: 200,  // $2.00 value
  sessionLimit: 1,
  message: "Experience your first therapeutic conversation, free."
}
```

**Cost per Trial User**: $2.00
**Conversion Rate Needed**: >15% to break even
**Risk**: Low-Medium

**Recommendation**: **Option A** (100 credits)

- Low risk
- Enough to experience quality
- Clear upgrade path
- Easy to track abuse

---

## 📋 Implementation Roadmap

### **Phase 1: Credit System Completion** (CRITICAL - 1 week)

#### **Task 1.1: Add Credit Deduction to Session Memory**

**File**: `src/domains/session-memory/session-memory.action.ts`

```typescript
export async function generateSessionMemory(
  userInput: string,
  existingMemory?: string | null,
  userId?: string,
  sessionId?: string
) {
  // ... existing code ...

  const result = await SendPromptsToAi([prompt], GPT_3_5_TURBO_MODEL);

  // ✅ ADD CREDIT DEDUCTION
  if (result.data && userId) {
    const credits =
      result.data.consumedCredits || calculateAIMessageCost(result.data.modelTokenUsage, GPT_3_5_TURBO_MODEL.code);

    await deductCredits(userId, credits, "session_memory", sessionId, {
      operation: "session_memory_generation",
      tokens: result.data.modelTokenUsage?.usage?.total_tokens,
    });
  }

  return result;
}
```

**Estimated Effort**: 2 hours
**Testing Required**: Unit tests for credit deduction

#### **Task 1.2: Add Credit Deduction to Session Summary**

**File**: `src/domains/session-summary/session-summary.action.ts`

```typescript
export async function getSessionSummary(
  sessionAnalysis: SessionAnalysis,
  sessionMemory: string | null,
  locale: AppLocales = "en",
  userId?: string,
  sessionId?: string
) {
  // ... existing code ...

  const result = await SendPromptsToAi([...], GPT_3_5_TURBO_MODEL);

  // ✅ ADD CREDIT DEDUCTION
  if (result.data && userId) {
    const credits = result.data.consumedCredits ||
      calculateAIMessageCost(result.data.modelTokenUsage, GPT_3_5_TURBO_MODEL.code);

    await deductCredits(userId, credits, "session_summary", sessionId, {
      operation: "session_summary_generation",
      tokens: result.data.modelTokenUsage?.usage?.total_tokens
    });
  }

  return result;
}
```

**Estimated Effort**: 2 hours
**Testing Required**: Integration tests

#### **Task 1.3: Add Credit Deduction to Session Wellness**

**File**: `src/domains/session-wellness/session-wellness.ai.ts`

```typescript
async evaluateSessionWellness(
  session: Session,
  recentAnalyses: TherapeuticAnalysis[],
  lastUserMessage: string,
  userId?: string
): Promise<SessionWellness> {
  // ... existing code ...

  const result = await SendPromptsToAi([...], GPT_4_1_MINI_MODEL, {...});

  // ✅ ADD CREDIT DEDUCTION
  if (result.data && userId) {
    const credits = result.data.consumedCredits ||
      calculateAIMessageCost(result.data.modelTokenUsage, GPT_4_1_MINI_MODEL.code);

    await deductCredits(userId, credits, "session_wellness", session.id, {
      operation: "session_wellness_check",
      tokens: result.data.modelTokenUsage?.usage?.total_tokens
    });
  }

  return validatedResult;
}
```

**Estimated Effort**: 2 hours

#### **Task 1.4: Add Credit Deduction to Session Diagnostics**

**File**: `src/app/actions/session-diagnostics-actions.ts`

```typescript
export async function generateSessionDiagnosticsAction(
  session: Session,
  modelCode: ModelCode = "M1",
  userId?: string
): Promise<SessionDiagnosticsWithMetadata> {
  // ... existing code ...

  // ✅ ADD CREDIT DEDUCTION AFTER BOTH AI CALLS
  if (userId) {
    const totalCredits = (summaryResponse.data.consumedCredits || 0) + (diagnosticsResponse.data.consumedCredits || 0);

    await deductCredits(userId, totalCredits, "session_diagnostics", session.id, {
      operation: "session_diagnostics_generation",
      summary_tokens: summaryResponse.data.modelTokenUsage?.usage?.total_tokens,
      diagnostics_tokens: diagnosticsResponse.data.modelTokenUsage?.usage?.total_tokens,
    });
  }

  return { diagnostics, metadata };
}
```

**Estimated Effort**: 3 hours
**Testing Required**: E2E tests

#### **Task 1.5: Add Credit Deduction to Lightweight Response**

**File**: `src/domains/open-chat/open-chat-lightweight.action.ts`

```typescript
export async function handleLightweightUserInput(
  userInput: string,
  analysis: TherapeuticAnalysis,
  messages: OpenChatMessage[],
  locale: AppLocales = "en",
  modelCode: ModelCode = MODELS_CODES.M1,
  userId?: string,
  sessionId?: string
): Promise<LightweightResult> {
  // ... existing code ...

  const result = await SendPromptsToAiWithRetry(lightweightPrompts, aiModel, {}, 2, 1000, authId);

  // ✅ ADD CREDIT DEDUCTION
  if (result.data && authId) {
    const credits = result.data.consumedCredits || calculateAIMessageCost(result.data.modelTokenUsage, aiModel.code);

    await deductCredits(authId, credits, "ai_usage", sessionId, {
      operation: "lightweight_response",
      analysis_value: "low",
      tokens: result.data.modelTokenUsage?.usage?.total_tokens,
    });
  }

  return { response, creditsUsed, tokenUsage, cost };
}
```

**Estimated Effort**: 2 hours

---

### **Phase 2: Cost Analysis & Monitoring** (1 week)

#### **Task 2.1: Create Cost Analytics Dashboard**

- Track per-session costs
- Track per-user monthly costs
- Identify high-usage users
- Monitor credit deduction accuracy

#### **Task 2.2: Add Cost Estimation in UI**

- Show estimated credits before operations
- Display running total during session
- Add "session cost so far" indicator

#### **Task 2.3: Implement Usage Alerts**

- Alert when session exceeds typical cost
- Notify users approaching credit limit
- Admin alerts for anomalous usage

---

### **Phase 3: Pricing Optimization** (2 weeks)

#### **Task 3.1: Implement Free Trial System**

**New User Flow**:

```typescript
// Add to user creation
async function createNewUser(authId: string) {
  const user = await prisma.user.create({
    data: {
      authId,
      creditsBalance: 100, // ✅ Free trial credits
      // ...
    },
  });

  await prisma.creditTransaction.create({
    data: {
      userId: user.id,
      type: "CREDIT",
      amount: 100,
      reason: "new_user_bonus",
      metadata: { source: "signup_trial" },
    },
  });
}
```

#### **Task 3.2: Design Subscription Tiers**

**Proposed Structure**:

| **Tier**      | **Price** | **Credits**  | **Sessions** | **Best For**         |
| ------------- | --------- | ------------ | ------------ | -------------------- |
| **Trial**     | Free      | 100          | 1-2          | New users            |
| **Light**     | $15       | 1,500        | ~8           | Occasional check-ins |
| **Standard**  | $35       | 3,500        | ~20          | Regular therapy      |
| **Premium**   | $60       | 7,000        | ~40          | Heavy users          |
| **Unlimited** | $99       | Fair-use cap | ~60          | Power users          |

#### **Task 3.3: Add Fair-Use Policy**

```typescript
// Add to user model
interface UserConfig {
  monthlySessionCap: number; // Default: 60
  dailySessionCap: number; // Default: 5
  flaggedForAbuse: boolean;
}
```

---

### **Phase 4: Payment Provider Review** (Optional - Q2 2026)

#### **Evaluation Criteria**:

- Monthly volume > $10k: Consider LemonSqueezy
- International users > 30%: Prioritize LemonSqueezy
- B2B partnerships: Consider Paddle
- Otherwise: Stay with Stripe

---

## 🎯 Launch Readiness Checklist

### **Pre-Launch Requirements (MUST COMPLETE)**:

- [ ] **1. Credit Deduction Complete**

  - [ ] Session memory credits tracked
  - [ ] Session summary credits tracked
  - [ ] Session wellness credits tracked
  - [ ] Session diagnostics credits tracked
  - [ ] Lightweight response credits tracked

- [ ] **2. Cost Monitoring**

  - [ ] Analytics dashboard implemented
  - [ ] Cost estimation in UI
  - [ ] Usage alerts configured

- [ ] **3. Pricing Finalized**

  - [ ] Free trial implemented (100 credits)
  - [ ] Subscription tiers defined
  - [ ] Fair-use policy documented

- [ ] **4. Testing**

  - [ ] Unit tests for all credit operations
  - [ ] Integration tests for full session flow
  - [ ] Load testing with 100 concurrent users
  - [ ] Cost accuracy validation (±5%)

- [ ] **5. Documentation**

  - [ ] Pricing page updated
  - [ ] Terms of service (fair-use policy)
  - [ ] Credit system explained to users

- [ ] **6. Financial Projections**
  - [ ] Break-even analysis
  - [ ] Monthly burn rate calculated
  - [ ] Revenue projections (conservative)

---

## 💰 Financial Impact Summary

### **Current State (BROKEN)**:

- **Revenue Loss**: 19% per session
- **Annual Loss**: $39,600 (at 1,000 users)
- **Launch Risk**: CRITICAL

### **After Phase 1 (FIXED)**:

- **Revenue Loss**: 0%
- **Cost Tracking**: 100% accurate
- **Launch Risk**: LOW

### **After Phase 3 (OPTIMIZED)**:

- **Free Trial Cost**: ~$100-200/month (100 new users)
- **Conversion Rate Target**: 15% (industry standard)
- **Break-Even**: ~300 paying users
- **Profitability**: ~500 paying users

---

## 🚦 Recommendation

**Status**: 🔴 **DO NOT LAUNCH UNTIL PHASE 1 COMPLETE**

**Reasoning**:

1. 19% revenue loss is unsustainable
2. Financial projections will be inaccurate
3. Scaling will amplify the problem
4. User trust issues if costs change post-launch

**Timeline**:

- **Phase 1**: 1 week → **LAUNCH READY**
- **Phase 2**: 1 week → **LAUNCH OPTIMIZED**
- **Phase 3**: 2 weeks → **LAUNCH COMPETITIVE**

**Earliest Safe Launch Date**: 2 weeks from now (after Phase 1 + testing)

---

## 📞 Next Steps

1. **Immediate**: Implement Phase 1 credit deductions
2. **This Week**: Add cost monitoring dashboard
3. **Next Week**: Finalize pricing and free trial
4. **Week 3**: Comprehensive testing
5. **Week 4**: LAUNCH

**Priority**: CRITICAL
**Estimated Total Effort**: 40-60 hours
**Team Size**: 1-2 developers
**Budget Impact**: +$100-200/month (free trials)
