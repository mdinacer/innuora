// =======================
// SESSION FLOW STATE HOOK
// =======================

import { useCallback, useEffect, useState } from "react";

import { useSessionFlowStore } from "../stores/session-flow.store";
import { SessionFlowActionResult, SessionFlowError, SessionFlowState } from "../types/session-flow-state.types";
import { createSessionFlowError } from "../utils/session-flow-validation";

export interface UseSessionFlowStateOptions {
  sessionId: string;
  autoCreate?: boolean;
}

export function useSessionFlowState({ sessionId, autoCreate = false }: UseSessionFlowStateOptions) {
  const [isLoading, setIsLoading] = useState(false);

  // Store selectors
  const session = useSessionFlowStore((state) => state.getSession(sessionId));
  const sessionExists = useSessionFlowStore((state) => state.sessionExists(sessionId));
  const sessionError = useSessionFlowStore((state) => state.getSessionError(sessionId));

  // Store actions
  const {
    createSession,
    deleteSession,
    resetSession,
    updateSession,
    setCurrentStepId,
    setInputValues,
    setChatSummary,
    markStarted,
    markEnded,
    addLog,
    addReflection,
    setError,
    clearError,
  } = useSessionFlowStore();

  // Auto-create session if needed
  useEffect(() => {
    if (autoCreate && !sessionExists) {
      try {
        setIsLoading(true);
        createSession(sessionId);
        addLog(sessionId, `Session flow created: ${sessionId}`);
      } catch (error) {
        const sessionError = createSessionFlowError(
          "INITIALIZATION_ERROR",
          error instanceof Error ? error.message : "Failed to auto-create session",
          undefined,
          { sessionId }
        );
        setError(sessionId, sessionError);
      } finally {
        setIsLoading(false);
      }
    }
  }, [sessionId, autoCreate, sessionExists, createSession, addLog, setError]);

  // Enhanced action wrappers with error handling
  const safeCreateSession = useCallback((): SessionFlowActionResult => {
    try {
      setIsLoading(true);
      clearError(sessionId);

      if (sessionExists) {
        return {
          success: false,
          error: createSessionFlowError("VALIDATION_ERROR", "Session already exists", undefined, { sessionId }),
        };
      }

      createSession(sessionId);
      addLog(sessionId, `Session flow created: ${sessionId}`);

      return { success: true };
    } catch (error) {
      const sessionError = createSessionFlowError(
        "INITIALIZATION_ERROR",
        error instanceof Error ? error.message : "Failed to create session",
        undefined,
        { sessionId }
      );
      setError(sessionId, sessionError);
      return { success: false, error: sessionError };
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, sessionExists, createSession, addLog, setError, clearError]);

  const safeResetSession = useCallback((): SessionFlowActionResult => {
    try {
      setIsLoading(true);
      clearError(sessionId);

      if (!sessionExists) {
        return {
          success: false,
          error: createSessionFlowError("VALIDATION_ERROR", "Session does not exist", undefined, { sessionId }),
        };
      }

      resetSession(sessionId);
      addLog(sessionId, `Session flow reset: ${sessionId}`);

      return { success: true };
    } catch (error) {
      const sessionError = createSessionFlowError(
        "VALIDATION_ERROR",
        error instanceof Error ? error.message : "Failed to reset session",
        undefined,
        { sessionId }
      );
      setError(sessionId, sessionError);
      return { success: false, error: sessionError };
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, sessionExists, resetSession, addLog, setError, clearError]);

  const safeDeleteSession = useCallback((): SessionFlowActionResult => {
    try {
      setIsLoading(true);

      if (!sessionExists) {
        return {
          success: false,
          error: createSessionFlowError("VALIDATION_ERROR", "Session does not exist", undefined, { sessionId }),
        };
      }

      deleteSession(sessionId);

      return { success: true };
    } catch (error) {
      const sessionError = createSessionFlowError(
        "VALIDATION_ERROR",
        error instanceof Error ? error.message : "Failed to delete session",
        undefined,
        { sessionId }
      );
      return { success: false, error: sessionError };
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, sessionExists, deleteSession]);

  const safeUpdateSession = useCallback(
    (updates: Partial<SessionFlowState> | ((prev: SessionFlowState) => SessionFlowState)): SessionFlowActionResult => {
      try {
        setIsLoading(true);
        clearError(sessionId);

        if (!sessionExists) {
          return {
            success: false,
            error: createSessionFlowError("VALIDATION_ERROR", "Session does not exist", undefined, { sessionId }),
          };
        }

        updateSession(sessionId, updates);

        return { success: true };
      } catch (error) {
        const sessionError = createSessionFlowError(
          "VALIDATION_ERROR",
          error instanceof Error ? error.message : "Failed to update session",
          undefined,
          { sessionId }
        );
        setError(sessionId, sessionError);
        return { success: false, error: sessionError };
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, sessionExists, updateSession, setError, clearError]
  );

  const safeSetCurrentStepId = useCallback(
    (stepId: string | null): SessionFlowActionResult => {
      try {
        clearError(sessionId);

        if (!sessionExists) {
          return {
            success: false,
            error: createSessionFlowError("VALIDATION_ERROR", "Session does not exist", undefined, { sessionId }),
          };
        }

        setCurrentStepId(sessionId, stepId);
        addLog(sessionId, `Step changed to: ${stepId || "null"}`);

        return { success: true };
      } catch (error) {
        const sessionError = createSessionFlowError(
          "TRANSITION_ERROR",
          error instanceof Error ? error.message : "Failed to set current step",
          stepId || undefined,
          { sessionId }
        );
        setError(sessionId, sessionError);
        return { success: false, error: sessionError };
      }
    },
    [sessionId, sessionExists, setCurrentStepId, addLog, setError, clearError]
  );

  const safeSetInputValues = useCallback(
    (
      inputValues: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)
    ): SessionFlowActionResult => {
      try {
        clearError(sessionId);

        if (!sessionExists) {
          return {
            success: false,
            error: createSessionFlowError("VALIDATION_ERROR", "Session does not exist", undefined, { sessionId }),
          };
        }

        setInputValues(sessionId, inputValues);

        return { success: true };
      } catch (error) {
        const sessionError = createSessionFlowError(
          "INVALID_INPUT",
          error instanceof Error ? error.message : "Failed to set input values",
          undefined,
          { sessionId }
        );
        setError(sessionId, sessionError);
        return { success: false, error: sessionError };
      }
    },
    [sessionId, sessionExists, setInputValues, setError, clearError]
  );

  const safeMarkStarted = useCallback((): SessionFlowActionResult => {
    try {
      clearError(sessionId);

      if (!sessionExists) {
        return {
          success: false,
          error: createSessionFlowError("VALIDATION_ERROR", "Session does not exist", undefined, { sessionId }),
        };
      }

      markStarted(sessionId);
      addLog(sessionId, "Flow started");

      return { success: true };
    } catch (error) {
      const sessionError = createSessionFlowError(
        "VALIDATION_ERROR",
        error instanceof Error ? error.message : "Failed to mark session as started",
        undefined,
        { sessionId }
      );
      setError(sessionId, sessionError);
      return { success: false, error: sessionError };
    }
  }, [sessionId, sessionExists, markStarted, addLog, setError, clearError]);

  const safeMarkEnded = useCallback((): SessionFlowActionResult => {
    try {
      clearError(sessionId);

      if (!sessionExists) {
        return {
          success: false,
          error: createSessionFlowError("VALIDATION_ERROR", "Session does not exist", undefined, { sessionId }),
        };
      }

      markEnded(sessionId);
      addLog(sessionId, "Flow ended");

      return { success: true };
    } catch (error) {
      const sessionError = createSessionFlowError(
        "VALIDATION_ERROR",
        error instanceof Error ? error.message : "Failed to mark session as ended",
        undefined,
        { sessionId }
      );
      setError(sessionId, sessionError);
      return { success: false, error: sessionError };
    }
  }, [sessionId, sessionExists, markEnded, addLog, setError, clearError]);

  // Computed values
  const isSessionReady = sessionExists && !isLoading;
  const hasError = Boolean(sessionError);
  const isFlowStarted = session?.hasStarted ?? false;
  const isFlowEnded = session?.hasEnded ?? false;
  const currentStepId = session?.currentStepId ?? null;
  const inputValues = session?.inputValues ?? {};

  return {
    // State
    session,
    sessionExists,
    isLoading,
    isSessionReady,
    hasError,
    error: sessionError,

    // Flow status
    isFlowStarted,
    isFlowEnded,
    currentStepId,
    inputValues,

    // Safe actions
    createSession: safeCreateSession,
    resetSession: safeResetSession,
    deleteSession: safeDeleteSession,
    updateSession: safeUpdateSession,
    setCurrentStepId: safeSetCurrentStepId,
    setInputValues: safeSetInputValues,
    setChatSummary: (summary: string | null) => setChatSummary(sessionId, summary),
    markStarted: safeMarkStarted,
    markEnded: safeMarkEnded,

    // Utility actions
    addLog: (message: string) => addLog(sessionId, message),
    addReflection: (reflection: string) => addReflection(sessionId, reflection),
    clearError: () => clearError(sessionId),
  };
}
