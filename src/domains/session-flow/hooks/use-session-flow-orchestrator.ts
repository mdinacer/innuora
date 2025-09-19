// =======================
// SESSION FLOW ORCHESTRATOR HOOK
// =======================

import { useCallback, useEffect } from "react";

import { useSessionFlowChatEngine } from "@/domains/session-flow/hooks/use-session-flow-chat-engine";
import { useSessionFlowEngine } from "@/domains/session-flow/hooks/use-session-flow-engine";
import { useSessionFlowInitialization } from "@/domains/session-flow/hooks/use-session-flow-initialization";
import { SessionFlowActionResult, SessionFlowError } from "@/domains/session-flow/types/session-flow-state.types";
import { FlowStep, SessionFlow, StepType, UserOption } from "@/domains/session-flow/types/session-flow.types";
import { createSessionFlowError } from "@/domains/session-flow/utils/session-flow-validation";
import { MessageType } from "@/types/flow-chat-messages.types";

// Helper function to create user messages (this would be imported from existing utilities)
function createUserMessage(content: string | string[]) {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: MessageType.USER_MESSAGE,
    content,
    timestamp: Date.now(),
  };
}

export interface SessionFlowOrchestratorOptions {
  autoCreateMessages?: boolean;
  skipStepTypes?: StepType[];
  onStepChange?: (step: FlowStep, previousStep: FlowStep | null) => void;
  onError?: (error: SessionFlowError, stepId?: string) => void;
}

export interface SessionFlowOrchestratorProps {
  sessionFlow: SessionFlow;
  autoStart?: boolean;
  initializeStores?: boolean;
  options?: SessionFlowOrchestratorOptions;
}

export function useSessionFlowOrchestrator({
  sessionFlow,
  autoStart = false,
  initializeStores = false,
  options = {},
}: SessionFlowOrchestratorProps) {
  const { autoCreateMessages = true, onStepChange, onError } = options;
  const { id: sessionId } = sessionFlow;

  // Initialize session and message stores
  const {
    isInitializing,
    isFullyInitialized,
    initializeSession,
    error: initError,
  } = useSessionFlowInitialization({
    sessionId,
    autoCreateSession: initializeStores,
    autoCreateMessages: initializeStores && autoCreateMessages,
  });

  // Session flow engine
  const {
    session,
    currentStepId,
    isTransitioning,
    isSessionReady: isFlowReady,
    startFlow,
    moveToNext,
    jumpToStep,
    resetFlow,
    getCurrentStep,
    error: flowError,
  } = useSessionFlowEngine(sessionFlow, {
    onError,
    onStepChange: (stepId, previousStepId) => {
      const currentStep = getCurrentStep();
      const previousStep = previousStepId ? sessionFlow.steps.find((s) => s.id === previousStepId) : null;
      if (currentStep) {
        onStepChange?.(currentStep, previousStep || null);
      }
    },
  });

  // Chat engine
  const {
    messages,
    addMessage,
    updateMessage,
    clearMessages,
    isSessionReady: isChatReady,
    error: chatError,
  } = useSessionFlowChatEngine({ sessionId, autoCreate: autoCreateMessages });

  // Reset session (both flow and messages)
  const resetSession = useCallback(async (): Promise<SessionFlowActionResult> => {
    try {
      // Clear messages first
      const clearResult = clearMessages();
      if (!clearResult.success) {
        return clearResult;
      }

      // Reset flow
      const resetResult = await resetFlow();
      if (!resetResult.success) {
        return resetResult;
      }

      return { success: true };
    } catch (error) {
      const sessionError = createSessionFlowError(
        "VALIDATION_ERROR",
        error instanceof Error ? error.message : "Failed to reset session",
        undefined,
        { sessionId }
      );
      onError?.(sessionError);
      return { success: false, error: sessionError };
    }
  }, [sessionId, clearMessages, resetFlow, onError]);

  // Handle user input (text input)
  const handleUserInput = useCallback(
    async (key: string, value: string, meta: { id: string; label: string }): Promise<SessionFlowActionResult> => {
      try {
        // Update the original message with the label
        const updateResult = updateMessage(meta.id, {
          type: MessageType.TEXT,
          content: meta.label,
        });

        if (!updateResult.success) {
          return { success: false, error: updateResult.error };
        }

        // Add input values to session state
        if (session) {
          session.inputValues[key] = value;
        }

        // Add user message
        const addResult = addMessage(createUserMessage(value));
        if (!addResult.success) {
          return addResult;
        }

        // Move to next step
        return await moveToNext();
      } catch (error) {
        const sessionError = createSessionFlowError(
          "INVALID_INPUT",
          error instanceof Error ? error.message : "Failed to handle user input",
          currentStepId || undefined,
          { sessionId, key, value }
        );
        onError?.(sessionError, currentStepId || undefined);
        return { success: false, error: sessionError };
      }
    },
    [sessionId, session, currentStepId, updateMessage, addMessage, moveToNext, onError]
  );

  // Process user selection (options)
  const processUserSelection = useCallback(
    async (
      key: string,
      selection: UserOption | UserOption[],
      meta: { id: string; label: string }
    ): Promise<SessionFlowActionResult<{ labels: string | string[]; values: any }>> => {
      try {
        const isArray = Array.isArray(selection);
        const labels = isArray ? selection.map((s) => s.label) : selection.label;
        const values = isArray ? selection.map((s) => s.value) : selection.value;

        // Update the original message with the label
        const updateResult = updateMessage(meta.id, {
          type: MessageType.TEXT,
          content: meta.label,
        });

        if (!updateResult.success) {
          return { success: false, error: updateResult.error };
        }

        // Add input values to session state
        if (session) {
          session.inputValues[key] = values;
        }

        // Add user message
        const addResult = addMessage(createUserMessage(labels));
        if (!addResult.success) {
          return { success: false, error: addResult.error };
        }

        // Move to next step
        const moveResult = await moveToNext();
        if (!moveResult.success) {
          return moveResult;
        }

        return { success: true, data: { labels, values } };
      } catch (error) {
        const sessionError = createSessionFlowError(
          "INVALID_INPUT",
          error instanceof Error ? error.message : "Failed to process user selection",
          currentStepId || undefined,
          { sessionId, key, selection }
        );
        onError?.(sessionError, currentStepId || undefined);
        return { success: false, error: sessionError };
      }
    },
    [sessionId, session, currentStepId, updateMessage, addMessage, moveToNext, onError]
  );

  // Auto-start effect
  useEffect(() => {
    if (autoStart && isFullyInitialized && session && !session.hasStarted) {
      startFlow();
    }
  }, [autoStart, isFullyInitialized, session, startFlow]);

  // Initialize stores if requested
  useEffect(() => {
    if (initializeStores && !isInitializing && !isFullyInitialized) {
      initializeSession();
    }
  }, [initializeStores, isInitializing, isFullyInitialized, initializeSession]);

  // Computed values
  const isReady = isFullyInitialized && isFlowReady && isChatReady;
  const hasError = Boolean(initError || flowError || chatError);
  const combinedError = initError || flowError || chatError;
  const isFlowStarted = session?.hasStarted ?? false;
  const isFlowEnded = session?.hasEnded ?? false;

  return {
    // State
    session,
    messages: messages || [],
    currentStepId,
    isTransitioning,
    isInitializing,
    isReady,
    hasError,
    error: combinedError,

    // Flow status
    isFlowStarted,
    isFlowEnded,

    // Flow control
    startFlow,
    resetFlow,
    resetSession,
    moveToNext,
    moveToStep: jumpToStep,

    // User interaction
    handleUserInput,
    processUserSelection,

    // Message management
    clearMessages,

    // Utilities
    getCurrentStep,
    clearError: () => {
      // Clear all errors - this could be more sophisticated
      console.log("Clearing orchestrator errors");
    },
  };
}
