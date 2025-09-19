// =======================
// SESSION FLOW INITIALIZATION HOOK
// =======================

import { useCallback, useEffect, useState } from "react";

import { useSessionFlowChatEngine } from "@/domains/session-flow/hooks/use-session-flow-chat-engine";
import { useSessionFlowState } from "@/domains/session-flow/hooks/use-session-flow-state";
import { SessionFlowActionResult, SessionFlowError } from "@/domains/session-flow/types/session-flow-state.types";
import { createSessionFlowError } from "@/domains/session-flow/utils/session-flow-validation";

export interface UseSessionFlowInitializationOptions {
  sessionId: string;
  autoCreateSession?: boolean;
  autoCreateMessages?: boolean;
}

export function useSessionFlowInitialization({
  sessionId,
  autoCreateSession = false,
  autoCreateMessages = false,
}: UseSessionFlowInitializationOptions) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<SessionFlowError | null>(null);

  // Session state hook
  const { sessionExists, createSession, error: sessionError } = useSessionFlowState({ sessionId, autoCreate: false });

  // Chat engine hook
  const {
    isSessionReady: isChatReady,
    createSession: createChatSession,
    error: chatError,
  } = useSessionFlowChatEngine({ sessionId, autoCreate: false });

  // Manual initialization function
  const initializeSession = useCallback(async (): Promise<SessionFlowActionResult> => {
    try {
      setIsInitializing(true);
      setInitializationError(null);

      // Initialize session store
      if (!sessionExists) {
        const sessionResult = createSession();
        if (!sessionResult.success) {
          setInitializationError(sessionResult.error!);
          return sessionResult;
        }
      }

      // Initialize chat messages store
      if (!isChatReady) {
        const chatResult = createChatSession();
        if (!chatResult.success) {
          setInitializationError(chatResult.error!);
          return chatResult;
        }
      }

      return { success: true };
    } catch (error) {
      const initError = createSessionFlowError(
        "INITIALIZATION_ERROR",
        error instanceof Error ? error.message : "Failed to initialize session",
        undefined,
        { sessionId }
      );
      setInitializationError(initError);
      return { success: false, error: initError };
    } finally {
      setIsInitializing(false);
    }
  }, [sessionId, sessionExists, createSession, isChatReady, createChatSession]);

  // Auto-initialization effect
  useEffect(() => {
    if (autoCreateSession || autoCreateMessages) {
      const shouldInitializeSession = autoCreateSession && !sessionExists;
      const shouldInitializeChat = autoCreateMessages && !isChatReady;

      if (shouldInitializeSession || shouldInitializeChat) {
        initializeSession();
      }
    }
  }, [sessionId, autoCreateSession, autoCreateMessages, sessionExists, isChatReady, initializeSession]);

  // Reset initialization state when session changes
  useEffect(() => {
    setInitializationError(null);
  }, [sessionId]);

  // Computed values
  const isFullyInitialized = sessionExists && isChatReady;
  const hasError = Boolean(initializationError || sessionError || chatError);
  const combinedError = initializationError || sessionError || chatError;

  return {
    // State
    isInitializing,
    isFullyInitialized,
    hasError,
    error: combinedError,

    // Individual states
    sessionExists,
    isChatReady,

    // Actions
    initializeSession,

    // Error management
    clearError: () => setInitializationError(null),
  };
}
