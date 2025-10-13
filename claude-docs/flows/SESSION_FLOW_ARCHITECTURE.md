# Session Flow Architecture Documentation

## Overview

Innuora's session flow architecture is a sophisticated state machine system that enables complex, multi-step therapeutic conversations with advanced error handling, multi-session support, and seamless AI integration. The architecture supports both structured guided sessions and flexible open chat interactions.

## Core Architecture Components

### 1. Session Flow Engine (`src/domains/session-flow/`)

The session flow system is built on a domain-driven architecture with clear separation of concerns:

```
src/domains/session-flow/
├── types/                    # Type definitions and interfaces
├── stores/                   # Zustand state management
├── hooks/                    # React hooks for session logic
├── utils/                    # Helper functions and utilities
├── constants/                # Configuration and constants
└── flows/                    # Flow definitions and configurations
```

### 2. Type System Architecture

#### Core Flow Types

```typescript
// src/domains/session-flow/types/session-flow.types.ts
export type SessionFlowType = "onboarding" | "deep" | "healing";
export type SessionFlowPhase = "structured_flow" | "open_chat" | "closure";

// 8 distinct step types for different interaction patterns
export const StepType = {
  TEXT: "text", // Simple display text
  PARAGRAPHS: "paragraphs", // Rich content blocks
  USER_INPUT: "user_input", // Text input collection
  OPTIONS: "options", // Single/multiple choice
  ACTION: "action", // Decision points
  REFLECTION: "reflection", // AI analysis trigger
  BRANCH: "branch", // Conditional flow logic
  SYSTEM: "system", // System operations
  FLOW_END: "flow_end", // Session completion
};
```

#### Step Content Interfaces

Each step type has its own content interface for type safety:

```typescript
// Text content for simple messages
export interface TextContent {
  content: string;
}

// Rich paragraph content with structure
export interface ParagraphsContent {
  title: string;
  subtitle: string;
  paragraphs: string[];
  buttonText?: string;
}

// User input collection
export interface UserInputContent {
  label: string;
  key: string; // Storage key for input value
  placeholder?: string;
  hint?: string;
  charLimit?: number;
}

// Option selection (single or multiple)
export interface OptionsContent {
  label: string;
  key: string;
  mode: SelectMode; // "single" | "multiple"
  options: UserOption[];
  hint?: string;
  maxSelected?: number;
}
```

### 3. State Management Architecture

#### Two-Tier Store System

**SessionFlowStore** - Core session state management:

```typescript
interface SessionFlowStoreState {
  sessions: Record<string, SessionFlowState>; // Multi-session support
  errors: Record<string, SessionFlowError>; // Session-scoped errors

  // Session lifecycle
  createSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  resetSession: (sessionId: string) => void;

  // State updates with optimistic rendering
  updateSession: (sessionId: string, updates: Partial<SessionFlowState>) => void;
  setCurrentStepId: (sessionId: string, stepId: string | null) => void;
  setInputValues: (sessionId: string, inputValues: Record<string, any>) => void;
}
```

**SessionFlowMessagesStore** - Chat message persistence:

```typescript
interface SessionFlowMessagesStoreState {
  messagesBySession: Record<string, ChatMessage[]>;

  // Message management
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<ChatMessage>) => void;
  clearMessages: (sessionId: string) => void;
}
```

#### Session State Structure

```typescript
export interface SessionFlowState {
  // Flow control
  currentStepId: string | null;
  hasStarted: boolean;
  hasEnded: boolean;

  // User data collection
  inputValues: Record<string, any>;

  // Flow execution tracking
  visitedSteps: string[];
  stepHistory: Array<{
    stepId: string;
    timestamp: Date;
    action: string;
  }>;

  // Metadata
  startedAt?: Date;
  endedAt?: Date;
  lastUpdated: Date;
  logs: string[];
}
```

### 4. Hook-Based Architecture

#### Core Hooks

**`useSessionFlowOrchestrator`** - Main coordinator hook:

```typescript
export function useSessionFlowOrchestrator({
  sessionFlow,
  autoStart = false,
  initializeStores = false,
  options = {},
}: SessionFlowOrchestratorProps) {
  // Initializes and coordinates all session flow components

  return {
    // State
    session,
    messages,
    currentStepId,
    isTransitioning,
    isReady,

    // Flow control
    startFlow,
    resetFlow,
    moveToNext,
    moveToStep: jumpToStep,

    // User interaction
    handleUserInput,
    processUserSelection,

    // Error handling
    hasError,
    error,
    clearError,
  };
}
```

**`useSessionFlowEngine`** - Core flow logic:

```typescript
export function useSessionFlowEngine(sessionFlow: SessionFlow, options?: SessionFlowEngineOptions) {
  // Manages step transitions, validation, and flow execution

  return {
    session,
    currentStepId,
    isTransitioning,
    isSessionReady,

    // Navigation
    startFlow,
    moveToNext,
    jumpToStep,
    resetFlow,

    // Step utilities
    getCurrentStep,
    getNextStep,
    canMoveToNext,

    // Error handling
    error,
    clearError,
  };
}
```

**`useSessionFlowChatEngine`** - Message management:

```typescript
export function useSessionFlowChatEngine({ sessionId, autoCreate = false }: SessionFlowChatEngineProps) {
  // Manages chat messages for session flow

  return {
    messages,
    isSessionReady,

    // Message operations
    addMessage,
    updateMessage,
    clearMessages,

    // Error handling
    error,
  };
}
```

### 5. Flow Definition System

#### Session Flow Structure

```typescript
export interface SessionFlow {
  id: string; // Unique session identifier
  title: string; // Display title
  subtitle: string; // Display subtitle
  steps: FlowStep[]; // Array of flow steps
  initialStepId: string; // Starting step
  defaultAutoAdvanceDelay?: number; // Default timing for auto-advance
}
```

#### Flow Step Definition

```typescript
type FlowStep = BaseStep &
  (
    | { type: "text"; content: string }
    | { type: "paragraphs"; content: ParagraphsContent }
    | { type: "user_input"; content: UserInputContent }
    | { type: "options"; content: OptionsContent }
    | { type: "action"; content: ActionContent }
    | { type: "reflection"; content: ReflectionContent; id: "reflection" }
    | { type: "branch"; content: BranchContent }
    | { type: "system"; content: SystemContent }
    | { type: "flow_end"; content: FlowEndContent; id: "end" }
  );

interface BaseStep {
  id: string; // Unique step identifier
  type: StepType; // Step type enum
  nextStepId?: string; // Default next step
  advanceMode?: AdvanceMode; // "auto" | "manual" | "await"
  autoAdvanceDelay?: number; // Delay for auto-advance
}
```

### 6. Advanced Flow Features

#### Conditional Branching

```typescript
export interface BranchContent {
  condition: (inputValues: Record<string, unknown>) => boolean;
  whenTrueStepId: string;
  whenFalseStepId: string;
}

// Example usage in flow definition
{
  id: "anxiety_assessment",
  type: StepType.BRANCH,
  content: {
    condition: (inputs) => inputs.anxietyLevel > 7,
    whenTrueStepId: "high_anxiety_intervention",
    whenFalseStepId: "standard_cbt_session"
  }
}
```

#### System Actions

```typescript
export type SystemAction =
  | { type: "reset_flow" }
  | { type: "wipe_messages" }
  | { type: "reset_values" }
  | { type: "reset_session" }
  | { type: "restart_session"; stepId?: string; resetValues?: boolean }
  | { type: "callback"; name: string; args?: Record<string, any> };

// Example system step
{
  id: "save_progress",
  type: StepType.SYSTEM,
  content: {
    title: "Saving your progress...",
    actions: [
      { type: "callback", name: "saveUserData" },
      { type: "callback", name: "updateSessionAnalysis" }
    ]
  },
  nextStepId: "continue_session"
}
```

#### AI Integration Points

```typescript
export interface ReflectionContent {
  title: string;
  mergeMode?: MergeMode;         // "append" | "replace"
  mergeTarget?: MergeTarget;     // "session_summary" | "belief_map" | "none"
  includeOnboardingData?: boolean;
  includeMirSummary?: boolean;
  includeChatSummary?: boolean;
}

// Triggers AI analysis and insight generation
{
  id: "reflection",
  type: StepType.REFLECTION,
  content: {
    title: "Analyzing your conversation...",
    mergeMode: "append",
    mergeTarget: "session_summary",
    includeChatSummary: true
  },
  nextStepId: "insights_presentation"
}
```

### 7. Session Loading & Configuration

#### Dynamic Session Loading

```typescript
// src/domains/session-flow/utils/load-session-flow.ts
export async function loadSessionFlow(sessionId: SessionId, locale: AppLocales = "en"): Promise<SessionFlow> {
  // Load session data from translations
  const { t } = await initTranslations(locale, ["sessions"]);
  const sessionData = t(sessionId, { returnObjects: true }) as SessionFlow;

  // Merge with behavioral props
  const sessionProps = SESSION_PROPS[sessionId];
  const mergedSteps = sessionData.steps.map((step) => {
    const stepOverrides = sessionProps[step.id as keyof typeof sessionProps];
    return stepOverrides ? mergeStepProps(step, stepOverrides) : step;
  });

  // Validate with Zod schema
  const { data, success, error } = safeValidateSessionFlow({
    ...sessionData,
    steps: mergedSteps,
  });

  if (!success) {
    throw new Error(`Session validation failed: ${error}`);
  }

  return data;
}
```

#### Session Props Configuration

```typescript
// src/domains/session-flow/constants/sessions.props.ts
export const SESSION_PROPS = {
  [SESSIONS_IDS.ONBOARDING_SESSION]: {
    welcome: {
      type: StepType.PARAGRAPHS,
      advanceMode: AdvanceMode.MANUAL,
      nextStepId: "what_to_expect",
    },
    display_name: {
      type: StepType.USER_INPUT,
      content: { key: "displayName", charLimit: 40 },
      nextStepId: "age_group",
    },
    // ... additional step configurations
  },
};
```

### 8. Error Handling & Recovery

#### Error Classification System

```typescript
export interface SessionFlowError {
  code: string; // Error classification
  message: string; // User-friendly message
  stepId?: string; // Step where error occurred
  timestamp: Date; // When error occurred
  context?: Record<string, any>; // Additional error context
  recoverable: boolean; // Whether user can recover
}

// Error types
const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  STEP_NOT_FOUND: "STEP_NOT_FOUND",
  INVALID_INPUT: "INVALID_INPUT",
  FLOW_CONFIGURATION_ERROR: "FLOW_CONFIGURATION_ERROR",
  SYSTEM_ACTION_FAILED: "SYSTEM_ACTION_FAILED",
};
```

#### Recovery Mechanisms

```typescript
// Automatic recovery strategies
const recoveryStrategies = {
  VALIDATION_ERROR: "retry_with_validation",
  STEP_NOT_FOUND: "reset_to_last_valid_step",
  INVALID_INPUT: "clear_input_and_retry",
  FLOW_CONFIGURATION_ERROR: "reset_entire_flow",
  SYSTEM_ACTION_FAILED: "skip_action_and_continue",
};
```

### 9. Performance Optimizations

#### State Update Optimization

```typescript
// Debounced state updates to prevent excessive re-renders
const debouncedUpdateSession = useMemo(
  () =>
    debounce((sessionId: string, updates: Partial<SessionFlowState>) => {
      updateSession(sessionId, updates);
    }, 300),
  [updateSession]
);

// Memoized step calculations
const currentStep = useMemo(() => {
  return sessionFlow.steps.find((step) => step.id === currentStepId);
}, [sessionFlow.steps, currentStepId]);
```

#### Selective Re-rendering

```typescript
// Component memoization for expensive operations
const FlowStepRenderer = React.memo(
  ({ step, isActive }) => {
    // Only re-render when step content or active state changes
  },
  (prevProps, nextProps) => {
    return prevProps.step.id === nextProps.step.id && prevProps.isActive === nextProps.isActive;
  }
);
```

### 10. Integration Architecture

#### Chat UI Integration

```typescript
// Message rendering with session flow context
const renderMessage = useCallback((message: ChatMessage, index: number) => {
  const isCurrentStep = message.flowStepId === session?.currentStepId;

  return (
    <FlowChatMessageRenderer
      key={message.id}
      message={message}
      isCurrentStep={isCurrentStep}
      onFlowEnd={handleFlowEndAction}
      actions={{
        moveToNextStep: moveToNext,
        moveToStep: jumpToStep,
        onUserInput: handleUserInput,
        onUserSelect: processUserSelection
      }}
    />
  );
}, [session?.currentStepId, /* other dependencies */]);
```

#### AI Service Integration

```typescript
// Session flow data preparation for AI analysis
export const prepareSessionFlowDataForAI = (session: SessionFlowState) => {
  return {
    userInputs: session.inputValues,
    conversationFlow: session.stepHistory,
    currentContext: session.currentStepId,
    sessionDuration: session.endedAt ? session.endedAt.getTime() - session.startedAt!.getTime() : undefined,
  };
};
```

### 11. Testing Architecture

#### Unit Testing Strategy

```typescript
// Hook testing with React Testing Library
describe("useSessionFlowEngine", () => {
  it("should advance to next step when moveToNext is called", async () => {
    const { result } = renderHook(() => useSessionFlowEngine(mockSessionFlow));

    await act(async () => {
      await result.current.startFlow();
    });

    expect(result.current.currentStepId).toBe("welcome");

    await act(async () => {
      await result.current.moveToNext();
    });

    expect(result.current.currentStepId).toBe("what_to_expect");
  });
});
```

#### Integration Testing

```typescript
// Full flow execution testing
describe('Onboarding Flow Integration', () => {
  it('should complete entire onboarding flow', async () => {
    render(<OnboardingSession sessionFlow={onboardingFlow} />);

    // Test each step progression
    await userEvent.click(screen.getByText('Start'));
    expect(screen.getByText('Welcome to Innuora')).toBeInTheDocument();

    // Continue through all steps...
    await userEvent.click(screen.getByText('Continue'));
    // ... more test steps
  });
});
```

### 12. Monitoring & Analytics

#### Flow Analytics

```typescript
// Session flow analytics tracking
export const trackSessionFlowEvent = (event: {
  sessionId: string;
  eventType: "step_start" | "step_complete" | "input_provided" | "error_occurred";
  stepId: string;
  duration?: number;
  metadata?: Record<string, any>;
}) => {
  // Send analytics data to monitoring service
  analytics.track("session_flow_event", {
    ...event,
    timestamp: new Date(),
    userAgent: navigator.userAgent,
    viewport: { width: window.innerWidth, height: window.innerHeight },
  });
};
```

#### Performance Monitoring

```typescript
// Performance metrics collection
export const monitorSessionFlowPerformance = () => {
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.name.includes("session-flow")) {
        // Track session flow performance metrics
        analytics.track("session_flow_performance", {
          operation: entry.name,
          duration: entry.duration,
          timestamp: entry.startTime,
        });
      }
    });
  });

  observer.observe({ entryTypes: ["measure"] });
};
```

## Summary

The session flow architecture provides a robust, type-safe, and highly flexible framework for creating complex therapeutic conversations. Key strengths include:

1. **Type Safety**: Complete TypeScript coverage with runtime validation
2. **Scalability**: Multi-session support with optimized state management
3. **Flexibility**: Support for linear flows, branching logic, and dynamic content
4. **Error Recovery**: Comprehensive error handling with graceful degradation
5. **Performance**: Optimized rendering and state updates
6. **Integration**: Seamless integration with AI services, chat UI, and analytics
7. **Testing**: Comprehensive testing strategy for reliability
8. **Monitoring**: Built-in analytics and performance tracking

This architecture enables Innuora to deliver sophisticated therapeutic experiences while maintaining excellent user experience and technical reliability.
