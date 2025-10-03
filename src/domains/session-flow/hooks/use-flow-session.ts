// =======================
// SIMPLIFIED FLOW SESSION HOOK
// =======================

import { useCallback, useEffect, useRef } from "react";

import { createUserMessage } from "@/types/flow-chat-messages.types";
import { SessionFlow, StepType } from "@/types/flow-session.types";
import { useFlowSessionStore } from "../stores/flow-session.store";

export interface UseFlowSessionOptions {
  sessionId: string;
  flow: SessionFlow;
  autoStart?: boolean;
}

export function useFlowSession({ sessionId, flow, autoStart = false }: UseFlowSessionOptions) {
  const hasInitialized = useRef(false);

  // Store selectors
  const session = useFlowSessionStore((state) => state.getSession(sessionId));
  const currentStep = useFlowSessionStore((state) => state.getCurrentStep(sessionId));

  // Store actions
  const {
    createSession,
    deleteSession,
    resetSession,
    advance: storeAdvance,
    jumpToStep,
    setResponse,
    addMessage,
  } = useFlowSessionStore();

  // Initialize session
  useEffect(() => {
    if (!hasInitialized.current && autoStart) {
      createSession(sessionId, flow);
      hasInitialized.current = true;
    }
  }, [sessionId, flow, autoStart, createSession]);

  // Auto-advance for APP_MESSAGE steps with autoAdvanceDelay
  useEffect(() => {
    if (!currentStep || !session) return;

    if (currentStep.type === StepType.APP_MESSAGE && currentStep.autoAdvanceDelay) {
      const timer = setTimeout(() => {
        storeAdvance(sessionId);
      }, currentStep.autoAdvanceDelay);

      return () => clearTimeout(timer);
    }
  }, [currentStep, session, sessionId, storeAdvance]);

  // =======================
  // PUBLIC API
  // =======================

  const start = useCallback(() => {
    if (!session) {
      createSession(sessionId, flow);
    }
  }, [session, sessionId, flow, createSession]);

  const advance = useCallback(() => {
    storeAdvance(sessionId);
  }, [sessionId, storeAdvance]);

  const goToStep = useCallback(
    (stepId: string) => {
      jumpToStep(sessionId, stepId);
    },
    [sessionId, jumpToStep]
  );

  const handleUserInput = useCallback(
    (key: string, value: string) => {
      // Save response
      setResponse(sessionId, key, value);

      // Add user message
      const userMessage = createUserMessage(value, currentStep?.id);
      addMessage(sessionId, userMessage);

      // Move to next step
      storeAdvance(sessionId);
    },
    [sessionId, currentStep, setResponse, addMessage, storeAdvance]
  );

  const handleUserSelect = useCallback(
    (key: string, value: any, label: string | string[]) => {
      // Save response value
      setResponse(sessionId, key, value);

      // Add user message with label
      const userMessage = createUserMessage(label, currentStep?.id);
      addMessage(sessionId, userMessage);

      // Move to next step
      storeAdvance(sessionId);
    },
    [sessionId, currentStep, setResponse, addMessage, storeAdvance]
  );

  const reset = useCallback(() => {
    resetSession(sessionId);
  }, [sessionId, resetSession]);

  const cleanup = useCallback(() => {
    deleteSession(sessionId);
  }, [sessionId, deleteSession]);

  return {
    // State
    session,
    currentStep,
    messages: session?.messages || [],
    responses: session?.responses || {},
    isComplete: session?.isComplete || false,
    isReady: Boolean(session),

    // Actions
    start,
    advance,
    goToStep,
    handleUserInput,
    handleUserSelect,
    reset,
    cleanup,
  };
}
