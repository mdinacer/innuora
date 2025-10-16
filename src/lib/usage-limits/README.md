# Flexible Usage Limits System

A **zero-recoding** monetization system that allows you to switch between different pricing models by simply changing environment variables.

## 🎯 Quick Start

### 1. Choose Your Monetization Model

Edit your `.env.local` file:

```bash
# Session-based (RECOMMENDED)
NEXT_PUBLIC_LIMIT_MODE=session
NEXT_PUBLIC_FREE_SESSIONS=2
NEXT_PUBLIC_BASIC_SESSIONS=5
NEXT_PUBLIC_REGULAR_SESSIONS=12
NEXT_PUBLIC_PRO_SESSIONS=25
```

That's it! No code changes needed.

### 2. Use in Components

```typescript
import { useUsageLimit } from "@/lib/usage-limits/use-usage-limits";

function MyComponent() {
  const { canProceed, warningMessage, usageDisplay } = useUsageLimit(userId);

  if (!canProceed) {
    return <div>You've reached your limit. {warningMessage}</div>;
  }

  return <div>Remaining: {usageDisplay}</div>;
}
```

## 📊 Available Monetization Models

### Model 1: Session-Based (Recommended)

**Best for:** Natural therapy context, clear limits, prevents abuse

```bash
NEXT_PUBLIC_LIMIT_MODE=session
```

**How it works:**

- Users get X therapy sessions per month
- Each session = up to 30 message exchanges OR 20K tokens
- Session auto-ends gracefully when limit reached
- New month = session count resets

**Pricing example:**

- Free: 2 sessions/month
- Basic ($25): 5 sessions/month
- Regular ($45): 12 sessions/month
- Pro ($75): 25 sessions/month

**User sees:** "4 of 12 sessions remaining this month"

---

### Model 2: Message-Based

**Best for:** Simple tracking, familiar to users

```bash
NEXT_PUBLIC_LIMIT_MODE=message
```

**How it works:**

- Users get X messages per month
- Long messages (>2000 tokens) count as multiple
- New month = message count resets

**Pricing example:**

- Free: 20 messages/month
- Basic ($25): 150 messages/month
- Regular ($45): 400 messages/month
- Pro ($75): 800 messages/month

**User sees:** "127 of 400 messages remaining"

---

### Model 3: Credit-Based

**Best for:** Pay-as-you-go flexibility

```bash
NEXT_PUBLIC_LIMIT_MODE=credit
```

**How it works:**

- Users buy credits, spend as they use
- Different operations cost different amounts
- Credits roll over (never expire)

**Pricing example:**

- Starter ($20): 500 credits
- Plus ($35): 1200 credits
- Pro ($60): 2500 credits

**User sees:** "347 credits remaining"

---

### Model 4: Unlimited (Testing Only)

```bash
NEXT_PUBLIC_LIMIT_MODE=unlimited
```

**How it works:** No limits, use for testing or special unlimited plans

---

## ⚙️ Configuration Reference

### Core Settings

| Variable                 | Options                             | Default | Description       |
| ------------------------ | ----------------------------------- | ------- | ----------------- |
| `NEXT_PUBLIC_LIMIT_MODE` | session, message, credit, unlimited | session | Active limit mode |

### Session Mode Settings

| Variable                               | Default | Description                      |
| -------------------------------------- | ------- | -------------------------------- |
| `NEXT_PUBLIC_MAX_MESSAGES_PER_SESSION` | 30      | Max messages before session ends |
| `NEXT_PUBLIC_MAX_TOKENS_PER_SESSION`   | 20000   | Max tokens before session ends   |

### Message Mode Settings

| Variable                             | Default | Description                     |
| ------------------------------------ | ------- | ------------------------------- |
| `NEXT_PUBLIC_MAX_TOKENS_PER_MESSAGE` | 2000    | Long messages count as multiple |

### Credit Mode Settings

| Variable                                | Default | Description                   |
| --------------------------------------- | ------- | ----------------------------- |
| `NEXT_PUBLIC_MIN_CREDITS_TO_START`      | 5       | Minimum to start conversation |
| `NEXT_PUBLIC_CREDIT_WARNING_THRESHOLD`  | 50      | Show warning below this       |
| `NEXT_PUBLIC_CREDIT_CRITICAL_THRESHOLD` | 20      | Show critical warning         |

### Subscription Tier Pricing

Each tier has 6 configurable values:

```bash
# Example: Basic Tier
NEXT_PUBLIC_BASIC_PRICE_MONTHLY=25
NEXT_PUBLIC_BASIC_PRICE_YEARLY=250
NEXT_PUBLIC_BASIC_SESSIONS=5        # Session mode
NEXT_PUBLIC_BASIC_MESSAGES=150      # Message mode
NEXT_PUBLIC_BASIC_CREDITS=500       # Credit mode
```

Repeat for: `FREE`, `BASIC`, `REGULAR`, `PRO`

---

## 🔧 React Hooks API

### `useUsageLimit(userId)`

Check if user can start new conversation.

```typescript
const {
  canProceed, // boolean: Can user proceed?
  warningMessage, // string | null: Warning to show
  usageDisplay, // string: "4 of 12 sessions"
  limitMode, // string: Current mode
  loading, // boolean: Loading state
  refresh, // () => void: Refresh status
} = useUsageLimit(userId);
```

### `useSessionUsage(sessionId, messageCount, tokenCount)`

Track current session progress (session mode only).

```typescript
const {
  shouldEndSession, // boolean: Should end this session?
  progressPercentage, // number: Progress (0-100)
  sessionInfo, // SessionUsageInfo | null
  refresh, // () => void
} = useSessionUsage(sessionId, messageCount, tokenCount);
```

### `useSubscriptionTier(userId)`

Get user's subscription tier info.

```typescript
const {
  tier, // string: "free" | "basic" | "regular" | "pro"
  tierInfo, // Full tier configuration object
  loading, // boolean
  refresh, // () => void
} = useSubscriptionTier(userId);
```

### `useUsageDisplayText()`

Get display text utilities for current mode.

```typescript
const {
  mode, // string: Current mode
  getUnitName, // (plural) => "session" | "sessions"
  getLimitDescription, // () => "therapy sessions per month"
} = useUsageDisplayText();
```

---

## 📝 Example Integration

### Check Before Starting Conversation

```typescript
import { useUsageLimit } from "@/lib/usage-limits/use-usage-limits";

function ChatInterface({ userId }) {
  const { canProceed, warningMessage, usageDisplay } = useUsageLimit(userId);

  if (!canProceed) {
    return (
      <div className="limit-reached">
        <h3>Monthly Limit Reached</h3>
        <p>{warningMessage}</p>
        <button onClick={() => router.push("/billing")}>
          Upgrade Plan
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="usage-display">{usageDisplay}</div>
      {warningMessage && (
        <div className="warning">{warningMessage}</div>
      )}
      <ChatComponent />
    </div>
  );
}
```

### Show Session Progress (Session Mode)

```typescript
import { useSessionUsage } from "@/lib/usage-limits/use-usage-limits";

function SessionHeader({ sessionId, messageCount, tokenCount }) {
  const {
    progressPercentage,
    shouldEndSession
  } = useSessionUsage(sessionId, messageCount, tokenCount);

  if (shouldEndSession) {
    return <div>Session complete. Start a new session to continue.</div>;
  }

  return (
    <div className="progress-bar">
      <div style={{ width: `${progressPercentage}%` }} />
      <span>{messageCount} messages in this session</span>
    </div>
  );
}
```

### Display Pricing Tiers

```typescript
import { SUBSCRIPTION_TIERS } from "@/lib/usage-limits/usage-limits-config";
import { useUsageDisplayText } from "@/lib/usage-limits/use-usage-limits";

function PricingPage() {
  const { getLimitDescription } = useUsageDisplayText();

  return (
    <div className="pricing-tiers">
      {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => (
        <div key={key} className="tier-card">
          <h3>{tier.name}</h3>
          <p className="price">
            ${tier.price.monthly}/month
          </p>
          <p className="limit">
            {/* Automatically shows correct limit based on mode */}
            Includes {getLimitDescription()}
          </p>
          <ul>
            {tier.features.map(feature => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔄 Switching Models

### From Session → Message Mode

1. Update `.env.local`:

```bash
NEXT_PUBLIC_LIMIT_MODE=message
```

2. Restart dev server:

```bash
pnpm dev
```

That's it! **No code changes needed.**

All hooks automatically adapt:

- `useUsageLimit()` now checks message count
- Display text changes from "sessions" to "messages"
- Pricing page shows message limits
- Warning messages update automatically

### From Message → Credit Mode

1. Update `.env.local`:

```bash
NEXT_PUBLIC_LIMIT_MODE=credit
```

2. Restart dev server

Everything adapts automatically!

---

## 🧪 Testing Different Models

Create multiple `.env` files:

```bash
.env.session   # Session-based config
.env.message   # Message-based config
.env.credit    # Credit-based config
.env.unlimited # Unlimited for testing
```

Switch between them:

```bash
# Test session mode
cp .env.session .env.local
pnpm dev

# Test message mode
cp .env.message .env.local
pnpm dev
```

---

## 🎨 Customizing Messages

Edit `usage-limits-config.ts`:

```typescript
sessionLimits: {
  sessionEndMessage: "Your custom message here",
}
```

Or use utility functions:

```typescript
UsageLimitUtils.getWarningMessage(used, limit);
UsageLimitUtils.getLimitExceededMessage();
```

---

## 📈 Cost Analysis Per Model

### Session-Based ($45/month = 12 sessions)

- Max usage: 12 sessions × 20K tokens = 240K tokens/month
- AI cost: ~$1.20/month
- **Margin: 97%**

### Message-Based ($45/month = 400 messages)

- Max usage: 400 messages × 600 tokens avg = 240K tokens/month
- AI cost: ~$1.20/month
- **Margin: 97%**

### Credit-Based ($35/month = 1200 credits)

- Max usage: 1200 credits × 250 tokens = 300K tokens/month
- AI cost: ~$1.50/month
- **Margin: 96%**

All models maintain excellent margins while controlling costs!

---

## 🛡️ Abuse Prevention

Built-in rate limiting (applies to all modes):

```bash
NEXT_PUBLIC_MAX_MESSAGES_PER_HOUR=100
NEXT_PUBLIC_MAX_SESSIONS_PER_DAY=10
```

Prevents:

- Spam/bot attacks
- API abuse
- Excessive usage

---

## 🔍 Backend Tracking

Usage tracking is **automatic** based on mode:

- **Session mode**: Counts `Session` table records
- **Message mode**: Counts `Message` table records
- **Credit mode**: Uses existing credit system

No additional tracking database needed!

---

## 💡 Recommended Model

**Start with Session-Based:**

1. ✅ Natural mental model (therapy sessions)
2. ✅ Clear limits prevent abuse
3. ✅ Predictable costs
4. ✅ Easy to understand for users
5. ✅ Graceful session endings
6. ✅ Encourages reflection between sessions

**Switch to Message-Based if:**

- Users want more granular control
- Shorter, frequent interactions preferred

**Switch to Credit-Based if:**

- Users want maximum flexibility
- Different features cost different amounts
- Want pay-as-you-go model

---

## 🚀 Production Checklist

- [ ] Copy `.env.usage-limits.example` to `.env.local`
- [ ] Set `NEXT_PUBLIC_LIMIT_MODE` to your chosen model
- [ ] Configure tier prices and limits
- [ ] Test limit enforcement in dev
- [ ] Test upgrade flows
- [ ] Test limit reset (monthly)
- [ ] Add to production environment variables
- [ ] Monitor usage in analytics

---

## 📞 Support

If you need to change models later:

1. Update environment variables
2. Deploy
3. **That's it!**

No database migrations, no code changes, no user disruption.
