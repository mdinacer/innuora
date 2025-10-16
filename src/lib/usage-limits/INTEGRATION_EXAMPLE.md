# Integration Example: Adding Usage Limits to Chat

This guide shows how to integrate the flexible usage limits system into your chat interface.

## Step 1: Check Usage Before Starting Chat

```typescript
// src/components/chat/chat-interface.tsx
"use client";

import { useUsageLimit } from "@/lib/usage-limits/use-usage-limits";
import { useAppUserStore } from "@/stores/app-user.store";

export function ChatInterface() {
  const user = useAppUserStore((state) => state.user);
  const { canProceed, warningMessage, usageDisplay, loading } = useUsageLimit(user?.id);

  if (loading) {
    return <div>Checking your plan...</div>;
  }

  if (!canProceed) {
    return (
      <div className="limit-reached">
        <h2>Monthly Limit Reached</h2>
        <p>{warningMessage}</p>
        <button onClick={() => router.push("/billing")}>
          Upgrade Your Plan
        </button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Show usage at top */}
      <div className="usage-indicator">
        {usageDisplay}
      </div>

      {/* Show warning if approaching limit */}
      {warningMessage && (
        <div className="warning-banner">
          {warningMessage}
        </div>
      )}

      {/* Your chat component */}
      <ChatMessages />
      <ChatInput />
    </div>
  );
}
```

## Step 2: Track Session Progress (Session Mode Only)

```typescript
// src/components/chat/session-progress.tsx
"use client";

import { useSessionUsage } from "@/lib/usage-limits/use-usage-limits";

export function SessionProgress({
  sessionId,
  messageCount,
  tokenCount
}) {
  const {
    progressPercentage,
    shouldEndSession,
    sessionInfo
  } = useSessionUsage(sessionId, messageCount, tokenCount);

  if (shouldEndSession) {
    return (
      <div className="session-ended">
        <p>{sessionInfo?.sessionEndMessage}</p>
        <button onClick={() => startNewSession()}>
          Start New Session
        </button>
      </div>
    );
  }

  return (
    <div className="session-progress">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <span className="message-count">
        {messageCount} messages in this session
      </span>
    </div>
  );
}
```

## Step 3: Update Pricing Page

```typescript
// src/app/[locale]/billing/page.tsx
import { SUBSCRIPTION_TIERS } from "@/lib/usage-limits/usage-limits-config";
import { useUsageDisplayText } from "@/lib/usage-limits/use-usage-limits";

export function PricingPage() {
  const { getLimitDescription } = useUsageDisplayText();

  return (
    <div className="pricing-page">
      <h1>Choose Your Plan</h1>
      <p className="subtitle">
        All plans include {getLimitDescription()}
      </p>

      <div className="pricing-grid">
        {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
          // Skip free tier in pricing page
          if (key === "free") return null;

          return (
            <div
              key={key}
              className={`tier-card ${tier.popular ? "popular" : ""}`}
            >
              {tier.popular && (
                <div className="popular-badge">Most Popular</div>
              )}

              <h3>{tier.name}</h3>

              <div className="price">
                <span className="amount">${tier.price.monthly}</span>
                <span className="period">/month</span>
              </div>

              <div className="billing-note">
                or ${tier.price.yearly}/year (save 17%)
              </div>

              <ul className="features">
                {tier.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <button className="cta-button">
                Choose {tier.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## Step 4: Check Limits in Server Actions

```typescript
// src/app/actions/chat-actions.ts
"use server";

import { checkUsageLimit, getUserSubscriptionTier, recordUsage } from "@/lib/usage-limits/usage-tracker";
import { getAuthenticatedUserContext } from "./user-context";

export async function sendChatMessage(sessionId: string, message: string) {
  // Get authenticated user
  const user = await getAuthenticatedUserContext();

  // Get user's subscription tier
  const tier = await getUserSubscriptionTier(user.id);

  // Check if user can proceed
  const usageStatus = await checkUsageLimit(user.id, tier);

  if (!usageStatus.canProceed) {
    return {
      error: {
        code: "USAGE_LIMIT_REACHED",
        message: usageStatus.reason || "Usage limit reached",
      },
    };
  }

  // Process message with AI
  const response = await processAiMessage(message);

  // Record usage (adapts to current mode automatically)
  await recordUsage(user.id, {
    sessionId,
    messageId: response.id,
    tokensUsed: response.tokens,
    creditsUsed: response.credits,
  });

  return { data: response };
}
```

## Step 5: Display User's Current Plan

```typescript
// src/components/account/subscription-info.tsx
"use client";

import { useSubscriptionTier } from "@/lib/usage-limits/use-usage-limits";

export function SubscriptionInfo({ userId }) {
  const { tier, tierInfo, loading } = useSubscriptionTier(userId);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!tierInfo) {
    return <div>No subscription found</div>;
  }

  return (
    <div className="subscription-card">
      <h3>Your Plan: {tierInfo.name}</h3>

      <div className="price-info">
        <span className="amount">${tierInfo.price.monthly}/month</span>
        {tierInfo.popular && (
          <span className="badge">Most Popular</span>
        )}
      </div>

      <div className="features-list">
        <h4>Included Features:</h4>
        <ul>
          {tierInfo.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      </div>

      {tier !== "pro" && (
        <button onClick={() => router.push("/billing")}>
          Upgrade Plan
        </button>
      )}
    </div>
  );
}
```

## Complete Flow Example

```typescript
// src/app/[locale]/chat/[sessionId]/page.tsx
"use client";

import { useState } from "react";
import { useUsageLimit, useSessionUsage } from "@/lib/usage-limits/use-usage-limits";
import { useAppUserStore } from "@/stores/app-user.store";
import { sendChatMessage } from "@/app/actions/chat-actions";

export default function ChatPage({ params }: { params: { sessionId: string } }) {
  const user = useAppUserStore((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  // Check overall usage limits
  const {
    canProceed,
    warningMessage,
    usageDisplay
  } = useUsageLimit(user?.id);

  // Track current session progress (session mode only)
  const {
    shouldEndSession,
    progressPercentage
  } = useSessionUsage(
    params.sessionId,
    messages.length,
    calculateTotalTokens(messages)
  );

  const handleSendMessage = async () => {
    if (!canProceed) {
      alert("You've reached your monthly limit. Please upgrade.");
      return;
    }

    if (shouldEndSession) {
      alert("This session has reached its limit. Start a new session.");
      return;
    }

    const result = await sendChatMessage(params.sessionId, inputValue);

    if (result.error) {
      if (result.error.code === "USAGE_LIMIT_REACHED") {
        // Show upgrade modal
        showUpgradeModal();
      }
      return;
    }

    setMessages([...messages, result.data]);
    setInputValue("");
  };

  return (
    <div className="chat-page">
      {/* Usage indicator */}
      <header className="chat-header">
        <div className="usage-display">{usageDisplay}</div>
        {progressPercentage > 0 && (
          <div className="session-progress">
            <div style={{ width: `${progressPercentage}%` }} />
          </div>
        )}
      </header>

      {/* Warning banner */}
      {warningMessage && (
        <div className="warning-banner">
          {warningMessage}
          <button onClick={() => router.push("/billing")}>
            Upgrade
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="messages">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Input (disabled if limits reached) */}
      <div className="chat-input">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={!canProceed || shouldEndSession}
          placeholder={
            !canProceed
              ? "Limit reached - upgrade to continue"
              : shouldEndSession
              ? "Session complete - start new session"
              : "Type your message..."
          }
        />
        <button
          onClick={handleSendMessage}
          disabled={!canProceed || shouldEndSession}
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

## Testing Different Modes

### Test Session Mode

```bash
# .env.local
NEXT_PUBLIC_LIMIT_MODE=session
NEXT_PUBLIC_FREE_SESSIONS=2
```

**Expected behavior:**

- User can start 2 sessions
- Each session allows 30 messages
- Session auto-ends gracefully
- Next month, resets to 2 sessions

### Test Message Mode

```bash
# .env.local
NEXT_PUBLIC_LIMIT_MODE=message
NEXT_PUBLIC_FREE_MESSAGES=20
```

**Expected behavior:**

- User can send 20 messages total
- No per-session limits
- Warning at 16 messages (80%)
- Hard stop at 20 messages

### Test Credit Mode

```bash
# .env.local
NEXT_PUBLIC_LIMIT_MODE=credit
NEXT_PUBLIC_FREE_CREDITS=50
```

**Expected behavior:**

- User starts with 50 credits
- Each message deducts 3-5 credits
- Real-time balance updates
- Warning at 50 credits remaining
- Critical at 20 credits remaining

## Common Patterns

### Pattern 1: Soft Limit Warning

Show warning at 80% usage:

```typescript
const { status } = useUsageLimit(userId);

const showWarning = status &&
  status.percentage >= 80 &&
  status.percentage < 100;

{showWarning && (
  <div className="soft-warning">
    You're approaching your monthly limit.
    Consider upgrading to avoid interruption.
  </div>
)}
```

### Pattern 2: Upgrade Prompt

```typescript
function UpgradePrompt({ onUpgrade }) {
  const { tierInfo } = useSubscriptionTier(userId);
  const nextTier = getNextTier(tierInfo?.id);

  return (
    <div className="upgrade-prompt">
      <h3>Upgrade to {nextTier.name}</h3>
      <p>Get {nextTier.limits.sessionsPerMonth} sessions/month</p>
      <p>Only ${nextTier.price.monthly}/month</p>
      <button onClick={onUpgrade}>Upgrade Now</button>
    </div>
  );
}
```

### Pattern 3: Usage Analytics

```typescript
function UsageAnalytics() {
  const { status } = useUsageLimit(userId);

  return (
    <div className="usage-analytics">
      <div className="stat">
        <span className="label">Used</span>
        <span className="value">{status?.used}</span>
      </div>
      <div className="stat">
        <span className="label">Remaining</span>
        <span className="value">{status?.remaining}</span>
      </div>
      <div className="stat">
        <span className="label">Utilization</span>
        <span className="value">{status?.percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}
```

That's it! The system automatically adapts to whatever mode you've configured.
