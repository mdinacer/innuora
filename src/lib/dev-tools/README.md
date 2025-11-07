# Development Tools

**⚠️ IMPORTANT: These tools are FOR DEVELOPMENT/TESTING ONLY and should be removed before production deployment.**

## Session Consumption Tracker

A comprehensive development tool for tracking and analyzing AI usage metrics in real-time during chat sessions. This helps with monetization analysis, cost estimation, and understanding user behavior patterns.

### Features

- **Real-time Tracking**: Monitors every AI operation as it happens
- **Detailed Metrics**: Shows input/output tokens, costs (USD), and operation types
- **Session Summaries**: Aggregates data for the entire session
- **Cost Estimation**: Projects costs for different session lengths (10, 20, 30, 50 messages)
- **Model Breakdown**: Shows usage split between GPT-4.1 and GPT-4.1-mini
- **Export to JSON**: Download complete session data for offline analysis
- **Per-Operation Details**: Click any operation to see detailed breakdown

### How to Use

#### 1. Enable the Tracker

The tracker is automatically enabled in development mode. Check `src/lib/dev-tools/dev-tools-config.ts`:

```typescript
export const ENABLE_CONSUMPTION_TRACKER = DEV_TOOLS_ENABLED && true;
```

#### 2. Start a Chat Session

Navigate to any chat session at `/sessions/[sessionId]`. The tracker will automatically:

- Initialize when the session loads
- Track all AI operations (conversation, analysis, memory, wellness, etc.)
- Display a fixed widget in the bottom-right corner

#### 3. View Metrics

**Compact View** (default):

- Shows total cost, operation count, and token usage
- Click "Details" to expand

**Expanded View**:

- **Session Overview**: Average cost per message, total input/output tokens
- **Model Breakdown**: Usage by GPT-4.1 vs GPT-4.1-mini
- **Estimated Costs**: Projected costs for 10/20/30/50 message sessions
- **Recent Operations**: List of all AI calls with detailed breakdown

#### 4. Analyze Operations

Click on any operation in the list to see:

- Input tokens → Output tokens
- Input cost + Output cost = Total cost
- Timestamp
- Model used
- Metadata (message ID, signals, etc.)

#### 5. Export Data

Click "Export JSON" to download complete session data for:

- Offline analysis
- Spreadsheet import
- Long-term cost tracking
- Business planning

### What Gets Tracked

The tracker automatically captures:

1. **Holistic Conversation Response** (`conversation`)

   - Main therapeutic dialogue
   - Model: GPT-4.1 (default)
   - Frequency: Every user message

2. **Therapeutic Analysis** (`analysis`)

   - Background CBT analysis
   - Model: GPT-4.1-mini (fallback)
   - Frequency: Every user message (non-blocking)

3. **Session Memory Update** (`memory`)

   - AI-powered memory consolidation
   - Model: GPT-4.1-mini
   - Frequency: When analysis flags `update_memory = true`

4. **Session Wellness Check** (`wellness`)

   - Determines if session should end
   - Model: GPT-4.1-mini
   - Frequency: Every 10 messages

5. **Session Title Generation** (`title`)
   - Auto-generates session title
   - Model: GPT-4.1-mini
   - Frequency: On demand (once per session)

### Understanding the Metrics

**Key Metrics Explained:**

- **Total Cost (USD)**: Raw API cost (before markup/credits conversion)
- **Avg Cost/Message**: Average cost per conversation message
- **Input/Output Tokens**: Prompt tokens vs. completion tokens
- **Model**: Which AI model was used
- **Operations**: Count of AI API calls

**Cost Estimation:**

The tracker uses actual session data to project costs for different session lengths:

- 10 messages: Typical trial/exploration session
- 20 messages: Standard therapeutic session
- 30 messages: Engaged user session
- 50 messages: Power user session

These estimates include all background operations (analysis, memory, wellness).

### Use Cases

#### 1. Monetization Analysis

```
Question: "How much should we charge per session?"
Action: Run multiple test sessions, export data, analyze average costs
Result: Data-driven pricing decisions
```

#### 2. Cost Optimization

```
Question: "Which operations are most expensive?"
Action: Review model breakdown, identify high-cost operations
Result: Optimize model selection (default vs. mini)
```

#### 3. User Behavior Modeling

```
Question: "How many messages before we see positive results?"
Action: Track multiple sessions, note cost at different message counts
Result: Understand cost-to-value ratio
```

#### 4. Break-Even Analysis

```
Question: "At what user tier do we become profitable?"
Action: Compare session costs against tier pricing
Result: Refine subscription tiers
```

### Technical Implementation

**Architecture:**

1. Server-side AI operations return `_devTracking` metadata (development only)
2. Client-side hook `useConsumptionTracker` initializes tracking
3. `trackAIOperationFromResponse` records each operation
4. React component polls tracker state and displays UI

**Files:**

- `src/lib/dev-tools/session-consumption-tracker.types.ts` - Type definitions
- `src/lib/dev-tools/session-consumption-tracker.ts` - Core tracking logic
- `src/lib/dev-tools/use-consumption-tracker.ts` - React hook
- `src/components/dev-tools/session-consumption-tracker.tsx` - UI component
- `src/lib/dev-tools/dev-tools-config.ts` - Feature flags

**Integration Points:**

- `src/domains/conversation-engine/actions/conversation.action.ts` - Conversation tracking
- `src/domains/open-chat/hooks/use-process-input.ts` - Client-side tracking
- `src/components/sessions/session-page/index.tsx` - UI integration

### Disabling for Production

**Option 1: Feature Flag (Recommended)**

```typescript
// src/lib/dev-tools/dev-tools-config.ts
export const ENABLE_CONSUMPTION_TRACKER = false;
```

**Option 2: Remove Dev Tracking Code**

Remove these sections:

1. `_devTracking` from conversation action response
2. Tracking call in `use-process-input.ts`
3. Tracker component from session page

**Option 3: Environment-Based (Already Configured)**

```typescript
// Automatically disabled in production builds
export const DEV_TOOLS_ENABLED = process.env.NODE_ENV === "development";
```

### Data Privacy

**IMPORTANT**: The tracker operates client-side only and does NOT:

- Send data to external servers
- Store data in databases
- Include sensitive user information
- Log encrypted message content

All tracking is ephemeral (cleared on page refresh) and used only for development/testing.

---

## Future Dev Tools (Planned)

- **Credit Usage Simulator**: Test different pricing models
- **Response Quality Analyzer**: Compare conversation quality metrics
- **Performance Profiler**: Track response latency and bottlenecks
- **A/B Testing Dashboard**: Compare prompt variations

---

**Last Updated**: January 2025
**Maintainer**: Development Team
**Status**: Active Development Tool
