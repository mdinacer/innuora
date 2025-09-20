# Mirael Open-Chat Flow - Complete Analysis

## 🎯 **Overview**

The **open-chat flow** is Mirael's core therapeutic conversation engine. It manages the complete lifecycle of user interactions with the AI, from input processing to encrypted storage, using sophisticated CBT-based analysis and response generation.

## 🔄 **Complete Flow Architecture**

### **1. User Input Trigger**

**Location**: `src/components/chat-ui/open-chat/open-chat.input.tsx`

```typescript
// User types message and hits send
const handleSendMessage = useCallback(() => {
  onSendMessage(inputValue);
  setInputValue("");
}, [inputValue, onSendMessage]);
```

**Features**:

- Real-time credits cost estimation while typing
- Auto-resizing textarea with max height
- Enter key handling (Shift+Enter for new line)
- Send button with loading states
- Credits cost preview via `CreditsCostEstimator` component

---

### **2. Chat Controller Orchestration**

**Location**: `src/domains/open-chat/hooks/use-chat-controller.ts`

```typescript
const processMessage = useCallback(
  async (message: string) => {
    if (!session) return;

    appendUserMessage(message.trim());

    try {
      setProcessing(true);
      const result = await processInput(message);
      // ... handle response
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setProcessing(false);
    }
  },
  [
    /* deps */
  ]
);
```

**Responsibilities**:

- Session state management via `useSessionState`
- Message orchestration via `useSessionInput`
- Memory updates via `useSessionMemory`
- Session analysis via `useSessionAnalysis`
- Automatic sync triggering after round completion

---

### **3. Input Processing Engine**

**Location**: `src/domains/open-chat/hooks/use-process-input.ts`

```typescript
const processInput = useCallback(
  async (userInput: string) => {
    // Validation and session checks
    const recentAnalysis = session.analysisSnapshots?.slice(-3) ?? [];
    const history = session.messages ?? [];
    const userProfile = useUserDataStore.getState().profile;

    // Call main handler
    const result = await handleUserInput(
      userInput,
      recentAnalysis,
      history,
      userProfile,
      session.memoryStore,
      locale,
      session?.modelCode ?? FALLBACK_MODEL,
      userProfile?.userId,
      sessionId
    );

    // Process results and trigger updates
  },
  [
    /* deps */
  ]
);
```

**Key Features**:

- Recent analysis context (last 3 analyses)
- User profile integration
- Model selection and fallback handling
- Error handling and validation
- Token usage tracking

---

### **4. Core Business Logic Handler**

**Location**: `src/domains/open-chat/open-chat.action.ts`

This is the **heart of the therapeutic conversation engine**:

```typescript
export async function handleUserInput(
  userInput: string,
  prevAnalysis: TherapeuticAnalysis[] = [],
  messages: OpenChatMessage[] = [],
  profile: Profile | null,
  prevMemory: string | null,
  locale: AppLocales = "en",
  modelCode: ModelCode = MODELS_CODES.M1,
  userId?: string,
  sessionId?: string
): Promise<HandleUserInputResult>;
```

#### **Step-by-Step Processing:**

##### **4.1 Validation & Credits Check**

```typescript
// Input validation
if (!userInput?.trim()) {
  throw new Error("User input cannot be empty");
}

// Credits pre-check (if authenticated)
if (userId) {
  const estimatedCost = await estimateAIMessageCost(userInput, modelCode);
  const hasSufficientCredits = await checkSufficientCredits(userId, estimatedCost);

  if (!hasSufficientCredits) {
    throw new Error(`Insufficient credits. Estimated cost: ${estimatedCost} credits`);
  }
}
```

##### **4.2 Therapeutic Analysis**

```typescript
// Step 1: Analyze user input
const analysisResult = await analyzeUserInput(userInput, prevAnalysis, aiModel, userId, sessionId);
const { analysis, modelTokenUsage: analysisUsage } = analysisResult;
```

**Analysis Engine** (`src/domains/therapeutic-analysis/therapeutic-analysis.action.ts`):

- Uses specialized AI model for psychological analysis
- Identifies emotional state, cognitive patterns, and therapeutic needs
- Selects appropriate CBT modules and interventions
- Returns structured analysis with confidence scores

##### **4.3 Conversation Prompt Building**

```typescript
// Step 2: Build conversation prompts
const conversationPrompts = await buildConversationPrompts(
  userInput,
  analysis,
  messages,
  profile,
  prevMemory,
  locale,
  userId,
  sessionId
);
```

**Prompt Composition**:

1. **Security Protocol**: Anti-manipulation safeguards
2. **Mirael Persona**: Therapeutic personality with tone adaptation
3. **User Profile Context**: Demographics and preferences
4. **CBT Modules**: Selected therapeutic interventions
5. **Chat History**: Last 3 conversation rounds (6 messages)
6. **Session Memory**: Long-term therapeutic context
7. **User Input**: Current message

##### **4.4 AI Response Generation**

```typescript
// Step 3: Generate AI response
const miraelResponse = await SendPromptsToAiWithRetry(conversationPrompts, aiModel);
```

**Features**:

- Multi-provider support (OpenAI, OpenRouter)
- Automatic retry logic with exponential backoff
- Token usage tracking
- Response validation and error handling

##### **4.5 Credits Deduction**

```typescript
// Step 4: Calculate actual credits cost and deduct
if (userId && miraelResponse.modelTokenUsage) {
  const inputTokens = miraelResponse.modelTokenUsage.usage?.prompt_tokens ?? 0;
  const outputTokens = miraelResponse.modelTokenUsage.usage?.completion_tokens ?? 0;

  const actualCreditsNeeded = await calculateAIMessageCost(modelCode, inputTokens, outputTokens);

  // Atomic credit deduction with session reference
  const creditResult = await deductCredits(userId, actualCreditsNeeded, "ai_usage", sessionId, {
    modelCode,
    inputTokens,
    outputTokens,
    messageLength: userInput.length,
    responseLength: miraelResponse.message.length,
  });

  creditsUsed = actualCreditsNeeded;
}
```

---

### **5. Context Management Systems**

#### **5.1 Chat Context Manager**

**Location**: `src/domains/chat-context/chat-context.manager.ts`

```typescript
buildChatHistoryPrompt(messages: OpenChatMessage[], roundsToKeep = 3, messagesPerRound = 2)
```

**Features**:

- Maintains last 3 conversation rounds (6 messages)
- Truncates long messages (800 char limit)
- Provides contextual continuity without overwhelming the AI
- Formatted as system prompt for context awareness

#### **5.2 Session Memory System**

**Location**: `src/domains/session-memory/session-memory.action.ts`

```typescript
export async function generateSessionMemory(userInput: string);
```

**Purpose**:

- Long-term therapeutic context preservation
- Key insights and patterns extraction
- Emotional journey tracking
- Therapeutic goal progression

#### **5.3 Therapeutic Analysis Engine**

**Location**: `src/domains/therapeutic-analysis/therapeutic-analysis.action.ts`

**Analysis Components**:

- **Emotional State**: Current mood and intensity
- **Cognitive Patterns**: Thinking styles and distortions
- **CBT Module Selection**: Appropriate therapeutic interventions
- **Memory Management**: When to update/recall session memory
- **Response Tone**: Emotional intensity matching

---

### **6. State Management & Persistence**

#### **6.1 Session State Hook**

**Location**: `src/domains/open-chat/hooks/use-session.state.ts`

```typescript
export function useSessionState({ sessionId }: OpenChatProps);
```

**Responsibilities**:

- Session loading from encrypted storage
- Real-time state updates
- Automatic sync triggering
- Error handling and recovery
- Hydration management

#### **6.2 Encryption & Storage**

**Location**: `src/domains/encrypted-session/encrypted-session.crypto.ts`

```typescript
export async function encryptSession(session: Partial<Session>): Promise<PrismaSession>;
export async function decryptSession(encryptedSession: PrismaSession): Promise<Session | null>;
```

**Security Features**:

- **Client-side encryption**: WebCrypto API with AES-GCM
- **PBKDF2 key derivation**: 600k iterations for password-based keys
- **Zero-knowledge architecture**: Server cannot read session content
- **Granular encryption**: Only sensitive data encrypted, metadata plain

#### **6.3 Two-Tier Sync System**

**Location**: `src/domains/session-sync/index.ts`

```typescript
class SessionSynchronizer {
  // Local sync: Frequent, immediate updates
  queueLocalSync(sessionId: string, operation: "create" | "update", session: Session);

  // Cloud sync: Periodic, user-consent based
  queueCloudSync(sessionId: string, operation: "create" | "update");
}
```

**Sync Strategy**:

- **Local Sync**: 1-second debounce, session storage/IndexedDB
- **Cloud Sync**: 10-minute debounce, respects `persistOnCloud` setting
- **Conflict Resolution**: Last-write-wins with user notification
- **Offline Support**: Full functionality without internet

---

### **7. CBT Integration**

#### **7.1 Modules System**

**Location**: `src/domains/cbt-modules/modules-prompt-builder.ts`

**Available Modules**:

- **COGNITIVE**: Pattern recognition and cognitive distortions
- **BEHAVIORAL_ACTIVATION**: Depression and energy intervention
- **MINDFULNESS**: Rumination and emotional regulation
- **VALUES_CLARIFICATION**: Meaning-making and agency
- **CORE_BELIEFS**: Deep belief exploration
- **REFRAMING**: Alternative perspective development
- **SHOULDS**: Rigid rule identification and softening

#### **7.2 Module Selection Logic**

Based on therapeutic analysis:

- Emotional intensity level
- Identified cognitive patterns
- User's current therapeutic needs
- Session progression and goals

---

### **8. Error Handling & Resilience**

#### **8.1 Comprehensive Error Management**

- **Input Validation**: Empty input, invalid model codes
- **Credits Validation**: Insufficient balance, estimation errors
- **AI Processing**: Response failures, parsing errors
- **Encryption**: Key retrieval, encryption/decryption failures
- **Sync**: Network errors, conflict resolution

#### **8.2 User Experience Safeguards**

- **Graceful Degradation**: Local-only mode when cloud sync fails
- **Error Recovery**: Retry mechanisms with exponential backoff
- **User Feedback**: Clear error messages and recovery options
- **State Preservation**: Session state maintained during errors

---

## 🔄 **Complete Flow Summary**

1. **User Input** → Input component with cost estimation
2. **Controller** → Chat controller orchestrates the flow
3. **Processing** → Input processor validates and prepares context
4. **Analysis** → Therapeutic analysis of user's emotional/cognitive state
5. **Prompts** → Sophisticated prompt building with context integration
6. **AI Response** → Multi-provider AI generation with retry logic
7. **Credits** → Transparent cost calculation and atomic deduction
8. **Storage** → Encrypted persistence with two-tier sync
9. **UI Update** → Real-time conversation display with sync status

This architecture ensures **therapeutic effectiveness**, **user privacy**, **transparent pricing**, and **reliable performance** while maintaining a seamless conversational experience.
