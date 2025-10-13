# Open Chat Flow Documentation

## Overview

Innuora's Open Chat system provides free-form therapeutic conversations powered by AI, featuring sophisticated session management, real-time analysis, memory enhancement, and seamless encryption. Unlike structured session flows, open chat enables natural therapeutic dialogue while maintaining comprehensive data collection and user privacy.

## Architecture Overview

### Core Components

```
src/domains/open-chat/
├── hooks/                    # React hooks for chat logic
│   ├── use-chat-controller.ts     # Main chat orchestrator
│   ├── use-session.state.ts       # Session state management
│   ├── use-process-input.ts       # Message processing logic
│   ├── use-session-analysis.ts    # Real-time therapeutic analysis
│   └── use-session-memory.ts      # AI-powered memory management
├── open-chat.action.ts            # Server actions for AI communication
├── open-chat-lightweight.action.ts # Optimized AI actions
└── open-chat.types.ts             # Type definitions
```

### UI Components

```
src/components/chat-ui/open-chat/
├── open-chat.main.tsx             # Main chat interface
├── open-chat.input.tsx            # Message input component
├── open-chat.message-bubble.tsx   # Message rendering
└── open-chat.model-selector.tsx   # AI model selection
```

## Session Data Model

### Session Structure

```typescript
export interface Session {
  id: string; // Session identifier
  userId: string; // User who owns the session
  title: string; // Session title (auto-generated or manual)
  subtitle?: string; // Optional subtitle

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Core conversation data (encrypted)
  messages: OpenChatMessage[]; // Chat messages
  memoryStore: string | null; // AI memory store
  continuitySummary: SessionSummary | null; // Session continuity
  aggregatedAnalysis: SessionAnalysis | null; // Combined analysis
  analysisSnapshots: TherapeuticAnalysis[]; // Real-time analysis

  // Session diagnostics (encrypted)
  sessionDiagnostics: SessionDiagnosticsWithMetadata | null;

  // Configuration
  modelCode: ModelCode; // AI model being used
  persistOnCloud?: boolean; // Cloud sync enabled
  autoUpdateTitle: boolean; // Auto-generate titles

  // Usage tracking
  metadata: SessionMeta; // Tokens, costs, duration
}
```

### Message Structure

```typescript
export interface OpenChatMessage {
  id: string; // Unique message identifier
  type: MessageType; // USER_MESSAGE | ASSISTANT_MESSAGE | SYSTEM_MESSAGE
  content: string | string[]; // Message content
  timestamp: number; // Unix timestamp

  // Metadata
  tokenUsage?: ModelTokenUsage; // AI token consumption
  creditsUsed?: number; // Credits charged for message
  analysis?: TherapeuticAnalysis; // Real-time therapeutic analysis

  // Status
  isLoading?: boolean; // Message generation in progress
  error?: string; // Error message if failed
}
```

### Session Metadata

```typescript
export interface SessionMeta {
  tokenUsage: ModelTokenUsage[]; // Detailed token tracking
  messageCount: number; // Total messages in session
  tokenCount: number; // Total tokens consumed
  costUSD: number; // Total cost in USD
  creditsUsed: number; // Total credits consumed
  activeDurationMs: number; // Active conversation time
  lastActiveAt: Date; // Last user interaction
}
```

## Chat Flow Process

### 1. Session Initialization

```typescript
// src/domains/open-chat/hooks/use-session.state.ts
export function useSessionState({ sessionId }: { sessionId: string }) {
  // Initialize session state management
  const {
    isReady: hasHydrated,
    session,
    addMessage,
    addAnalysis,
    addTokenUsage,
    addCreditsUsed,
    updateSession,
    resetSession,
    resetEncryptedSession,
  } = useSessionState({ sessionId });

  // Session ready when hydrated and decrypted
  return { hasHydrated, session /* ...actions */ };
}
```

### 2. Message Processing Pipeline

#### A. User Input Processing

```typescript
// src/domains/open-chat/hooks/use-process-input.ts
export const processInput = useCallback(
  async (message: string) => {
    // 1. Add user message to session
    appendUserMessage(message.trim());

    // 2. Prepare conversation context
    const conversationContext = prepareConversationContext(session, message);

    // 3. Generate AI response
    const aiResponse = await sendPromptsToAI({
      sessionId,
      userMessage: message,
      context: conversationContext,
      modelCode: session.modelCode,
    });

    // 4. Process AI response
    const { assistantMessage, analysis, tokenUsage, creditsUsed } = aiResponse;

    // 5. Add assistant message with metadata
    appendAssistantMessage(assistantMessage, creditsUsed);

    // 6. Store therapeutic analysis
    if (analysis) addAnalysis(analysis);

    // 7. Update token usage tracking
    if (tokenUsage) addTokenUsage(tokenUsage);

    return { assistantMessage, shouldUpdateMemory: true, tokenUsage, creditsUsed };
  },
  [
    /* dependencies */
  ]
);
```

#### B. AI Response Generation

```typescript
// src/domains/open-chat/open-chat.action.ts
export async function sendPromptsToAI({
  sessionId,
  userMessage,
  context,
  modelCode,
}: SendPromptsToAIParams): Promise<SendPromptsToAIResponse> {
  // 1. Prepare therapeutic context
  const therapeuticContext = buildTherapeuticContext({
    userProfile: context.userProfile,
    sessionMemory: context.memoryStore,
    recentAnalysis: context.analysisSnapshots,
    conversationHistory: context.messages.slice(-10), // Last 10 messages
  });

  // 2. Select appropriate CBT modules
  const cbtModules = selectCBTModules(userMessage, context.analysisSnapshots);

  // 3. Generate AI response
  const aiResponse = await aiService.generateResponse({
    userMessage,
    therapeuticContext,
    cbtModules,
    modelCode,
    sessionId,
  });

  // 4. Perform real-time therapeutic analysis
  const analysis = await performTherapeuticAnalysis({
    userMessage,
    aiResponse,
    conversationContext: therapeuticContext,
  });

  // 5. Calculate token usage and credits
  const tokenUsage = calculateTokenUsage(aiResponse);
  const creditsUsed = calculateCreditsFromTokens(tokenUsage, modelCode);

  return {
    assistantMessage: aiResponse.content,
    analysis,
    tokenUsage,
    creditsUsed,
  };
}
```

### 3. Real-Time Analysis System

#### Therapeutic Analysis Engine

```typescript
// Real-time analysis during conversation
export const performTherapeuticAnalysis = async (context: {
  userMessage: string;
  aiResponse: string;
  conversationContext: TherapeuticContext;
}): Promise<TherapeuticAnalysis> => {
  const analysis = await aiService.analyzeConversation({
    userMessage: context.userMessage,
    aiResponse: context.aiResponse,
    therapeuticContext: context.conversationContext,
    analysisType: "real_time",
  });

  return {
    // Core analysis
    core_module: analysis.cbtModule,
    process_module: analysis.processModule,
    utility_module: analysis.utilityModule,

    // Emotional assessment
    emotions: analysis.detectedEmotions,
    intensity: analysis.emotionalIntensity,
    crisis: analysis.crisisLevel,

    // Cognitive patterns
    themes: analysis.conversationThemes,
    distortions: analysis.cognitiveDistortions,
    insights: analysis.therapeuticInsights,

    // Progress tracking
    progress: analysis.therapeuticProgress,
    recommendations: analysis.nextStepRecommendations,

    // Metadata
    timestamp: new Date(),
    messageIndex: context.conversationContext.messageCount,
  };
};
```

### 4. Memory Management System

#### AI-Powered Memory Enhancement

```typescript
// src/domains/open-chat/hooks/use-session-memory.ts
export const updateSessionMemory = useCallback(
  async (newMessage: string) => {
    if (!session?.memoryStore) {
      // Initialize memory for new session
      const initialMemory = await aiService.initializeMemory({
        userProfile: context.userProfile,
        firstMessage: newMessage,
        sessionGoals: context.sessionGoals,
      });

      updateSession({ memoryStore: initialMemory });
      return;
    }

    // Enhance existing memory with new information
    const enhancedMemory = await aiService.enhanceMemory({
      currentMemory: session.memoryStore,
      newMessage,
      conversationContext: {
        recentMessages: session.messages.slice(-5),
        currentAnalysis: session.analysisSnapshots.slice(-1)[0],
      },
    });

    // Memory deduplication and optimization
    const optimizedMemory = await aiService.optimizeMemory({
      memory: enhancedMemory,
      maxLength: 300, // words
      preserveImportant: true,
    });

    updateSession({ memoryStore: optimizedMemory });
  },
  [session, updateSession]
);
```

### 5. Session Wellness Monitoring

#### Optimized Wellness Evaluation

```typescript
// Frequency-optimized wellness monitoring
const evaluateSessionWellness = useCallback(() => {
  const messageCount = session.messages.length;
  const latestAnalysis = session.analysisSnapshots[session.analysisSnapshots.length - 1];
  const hasCrisisIndicators = latestAnalysis?.crisis !== "none" || latestAnalysis?.intensity === "high";

  // Smart frequency management (87% token savings)
  if (wellnessFrequencyManager.shouldCheckWellness(sessionId, messageCount, hasCrisisIndicators)) {
    aiWellnessEngine.evaluateSessionWellness(session, session.analysisSnapshots, lastMessage).then((wellness) => {
      if (wellness.suggest_conclusion) {
        // Gentle session conclusion guidance
        showSessionConclusionGuidance(wellness.reason);
      }
    });
  }
}, [session, sessionId]);
```

## Session Synchronization

### Two-Tier Sync Architecture

#### Local Synchronization (1-second debounce)

```typescript
// Immediate local state sync for responsive UI
const handleLocalSync = useCallback(() => {
  sessionSynchronizer.queueLocalSync(sessionId, "update", session);
}, [sessionId, session]);

// Triggered after each message round
const handleRoundComplete = useCallback(() => {
  import("@/domains/session-sync").then(({ sessionSynchronizer }) => {
    const currentSession = useActiveSessionStore.getState().session;
    if (currentSession) {
      sessionSynchronizer.queueLocalSync(sessionId, "update", currentSession);
    }
  });
}, [sessionId]);
```

#### Cloud Synchronization (10-minute debounce)

```typescript
// Periodic cloud sync for persistence
const handleCloudSync = useCallback(() => {
  if (session.persistOnCloud) {
    sessionSynchronizer.queueCloudSync(sessionId, "update", session);
  }
}, [sessionId, session]);
```

## AI Model Integration

### Dynamic Model Selection

```typescript
// src/components/chat-ui/open-chat/open-chat.model-selector.tsx
export const ModelSelector = ({ currentModel, onModelChange }) => {
  const availableModels = [
    { code: "M1", name: "GPT-4.1 Mini", cost: "2 credits/message", speed: "Fast" },
    { code: "M2", name: "GPT-4O", cost: "10 credits/message", speed: "Premium" },
    { code: "M3", name: "GPT-3.5 Turbo", cost: "1 credit/message", speed: "Balanced" }
  ];

  // Real-time model switching with context preservation
  const handleModelChange = (newModel: ModelCode) => {
    updateSession({ modelCode: newModel });
    onModelChange(newModel);
  };

  return (
    <ModelSelectorUI
      models={availableModels}
      currentModel={currentModel}
      onModelChange={handleModelChange}
    />
  );
};
```

### Cost Optimization

```typescript
// Smart token usage calculation
export const calculateCreditsFromTokens = (tokenUsage: ModelTokenUsage, modelCode: ModelCode): number => {
  const modelPricing = AI_MODEL_PRICING[modelCode];

  const inputCredits = Math.ceil((tokenUsage.inputTokens / 40) * modelPricing.inputTokenMultiplier);

  const outputCredits = Math.ceil((tokenUsage.outputTokens / 40) * modelPricing.outputTokenMultiplier);

  const totalCredits = modelPricing.baseCredits + inputCredits + outputCredits;

  // Always round up to ensure user is never undercharged
  return Math.max(1, Math.ceil(totalCredits));
};
```

## Error Handling & Recovery

### Message-Level Error Handling

```typescript
const processMessage = useCallback(
  async (message: string) => {
    try {
      setProcessing(true);

      // Add user message immediately for responsive UI
      appendUserMessage(message.trim());

      const result = await processInput(message);

      if (!result?.assistantMessage) {
        throw new Error("No assistant response received");
      }

      // Success: process all response data
      appendAssistantMessage(result.assistantMessage, result.creditsUsed);
    } catch (error) {
      logger.logWarning("Chat processing error", {
        operation: "chat_controller_process_error",
        sessionId,
        metadata: { error: error.message },
      });

      // Show user-friendly error message
      appendAssistantMessage(
        "I'm having trouble responding right now. Please try again.",
        0 // No credits charged for error
      );

      // Still sync to preserve user message
      handleRoundComplete();
    } finally {
      setProcessing(false);
    }
  },
  [
    /* dependencies */
  ]
);
```

### Session Recovery

```typescript
// Automatic session recovery from corrupted state
const recoverSession = useCallback(async () => {
  try {
    // Attempt to load from cloud backup
    const cloudSession = await loadSessionFromCloud(sessionId);

    if (cloudSession) {
      updateSession(cloudSession);
      return true;
    }

    // Fallback to local backup
    const localSession = loadSessionFromLocalStorage(sessionId);

    if (localSession) {
      updateSession(localSession);
      return true;
    }

    // Last resort: create new session
    resetSession();
    return false;
  } catch (error) {
    logger.logError("Session recovery failed", {
      operation: "chat_recovery",
      sessionId,
      metadata: { error: error.message },
    });

    // Force create new session
    resetSession();
    return false;
  }
}, [sessionId, updateSession, resetSession]);
```

## Performance Optimizations

### Message Rendering Optimization

```typescript
// Efficient message rendering with virtualization
const MessageBubble = React.memo(({ message }: { message: OpenChatMessage }) => {
  // Only re-render when message content actually changes
  return (
    <div className={`message-bubble ${message.type}`}>
      <MessageContent content={message.content} />
      <MessageMetadata
        timestamp={message.timestamp}
        tokenUsage={message.tokenUsage}
        creditsUsed={message.creditsUsed}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for memo optimization
  return prevProps.message.id === nextProps.message.id &&
         prevProps.message.content === nextProps.message.content &&
         prevProps.message.isLoading === nextProps.message.isLoading;
});
```

### State Update Batching

```typescript
// Batch multiple state updates for performance
const batchSessionUpdates = useCallback(
  (updates: {
    messages?: OpenChatMessage[];
    analysis?: TherapeuticAnalysis;
    tokenUsage?: ModelTokenUsage;
    creditsUsed?: number;
  }) => {
    // Combine all updates into single state change
    updateSession((prevSession) => ({
      ...prevSession,
      messages: updates.messages || prevSession.messages,
      analysisSnapshots: updates.analysis
        ? [...prevSession.analysisSnapshots, updates.analysis]
        : prevSession.analysisSnapshots,
      metadata: {
        ...prevSession.metadata,
        tokenUsage: updates.tokenUsage
          ? [...prevSession.metadata.tokenUsage, updates.tokenUsage]
          : prevSession.metadata.tokenUsage,
        creditsUsed: prevSession.metadata.creditsUsed + (updates.creditsUsed || 0),
      },
    }));
  },
  [updateSession]
);
```

## Security & Privacy

### Client-Side Encryption

```typescript
// All sensitive session data encrypted before storage
const encryptSessionData = async (session: Session) => {
  const sensitiveData = {
    messages: session.messages,
    memoryStore: session.memoryStore,
    continuitySummary: session.continuitySummary,
    aggregatedAnalysis: session.aggregatedAnalysis,
    analysisSnapshots: session.analysisSnapshots,
    sessionDiagnostics: session.sessionDiagnostics,
  };

  return await encryptData(sensitiveData, userEncryptionKey);
};

// Public metadata remains unencrypted for search/filtering
const publicMetadata = {
  id: session.id,
  title: session.title,
  subtitle: session.subtitle,
  createdAt: session.createdAt,
  updatedAt: session.updatedAt,
  metadata: {
    messageCount: session.metadata.messageCount,
    tokenCount: session.metadata.tokenCount,
    costUSD: session.metadata.costUSD,
    creditsUsed: session.metadata.creditsUsed,
  },
};
```

### Input Sanitization

```typescript
// Comprehensive input validation and sanitization
const sanitizeUserInput = (input: string): string => {
  // Remove potential XSS vectors
  const sanitized = DOMPurify.sanitize(input);

  // Limit message length
  const trimmed = sanitized.length > 2000 ? sanitized.substring(0, 2000) + "..." : sanitized;

  // Remove excessive whitespace
  return trimmed.trim().replace(/\s+/g, " ");
};
```

## Analytics & Monitoring

### Business Metrics

```typescript
// Track key business metrics for open chat
analytics.trackSession("message_sent", {
  sessionId,
  userId: session.userId,
  creditsUsed,
  modelUsed: tokenUsage?.responseUsage?.model || "unknown",
  messageCount: messages.length,
  sessionDuration: Date.now() - session.createdAt.getTime(),
  hasAnalysis: !!analysis,
  hasCrisisIndicators: analysis?.crisis !== "none",
});
```

### Performance Monitoring

```typescript
// Monitor chat performance metrics
const trackChatPerformance = (operation: string, duration: number) => {
  analytics.track("chat_performance", {
    operation,
    duration,
    sessionId,
    messageCount: session.messages.length,
    timestamp: Date.now(),
  });
};

// Usage
const startTime = performance.now();
await processInput(message);
const duration = performance.now() - startTime;
trackChatPerformance("message_processing", duration);
```

### Error Tracking

```typescript
// Comprehensive error tracking for debugging
const trackChatError = (
  error: Error,
  context: {
    operation: string;
    sessionId: string;
    messageCount: number;
    userMessage?: string;
  }
) => {
  logger.logError("Chat error occurred", {
    operation: context.operation,
    sessionId: context.sessionId,
    metadata: {
      error: error.message,
      stack: error.stack,
      messageCount: context.messageCount,
      userMessageLength: context.userMessage?.length,
      timestamp: new Date().toISOString(),
    },
  });
};
```

## Testing Strategy

### Unit Testing

```typescript
// Hook testing for chat controller
describe("useChatController", () => {
  it("should process user message and generate AI response", async () => {
    const { result } = renderHook(() => useChatController({ sessionId: "test-session" }));

    await act(async () => {
      await result.current.actions.processMessage("Hello, I feel anxious");
    });

    expect(result.current.state.messages).toHaveLength(2);
    expect(result.current.state.messages[0].type).toBe("USER_MESSAGE");
    expect(result.current.state.messages[1].type).toBe("ASSISTANT_MESSAGE");
  });
});
```

### Integration Testing

```typescript
// Full chat flow integration test
describe('Open Chat Integration', () => {
  it('should complete full conversation flow', async () => {
    render(<OpenChatMain sessionId="test-session" />);

    // Send user message
    const input = screen.getByPlaceholderText('Type your message...');
    await userEvent.type(input, 'I am feeling overwhelmed');
    await userEvent.click(screen.getByText('Send'));

    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText(/I understand/)).toBeInTheDocument();
    });

    // Verify analysis was generated
    await waitFor(() => {
      expect(screen.getByTestId('therapeutic-analysis')).toBeInTheDocument();
    });
  });
});
```

## Summary

The Open Chat flow provides a sophisticated, AI-powered therapeutic conversation system with:

1. **Natural Dialogue**: Free-form conversation with therapeutic guidance
2. **Real-Time Analysis**: Continuous therapeutic assessment and insights
3. **Smart Memory**: AI-powered conversation memory with deduplication
4. **Performance Optimization**: 87% token savings through frequency management
5. **Robust Error Handling**: Graceful degradation and recovery mechanisms
6. **Complete Privacy**: Client-side encryption for all sensitive data
7. **Multi-Model Support**: Dynamic AI model switching with cost optimization
8. **Session Wellness**: Intelligent session conclusion guidance
9. **Comprehensive Analytics**: Business metrics and performance monitoring
10. **Seamless Sync**: Two-tier synchronization for responsive UI and data persistence

This architecture enables Innuora to deliver high-quality therapeutic conversations while maintaining excellent performance, user privacy, and business sustainability.
