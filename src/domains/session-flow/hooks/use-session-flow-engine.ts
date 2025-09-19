// =======================
// SESSION FLOW ENGINE HOOK
// =======================

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SESSION_FLOW_DEFAULTS } from "../constants/session-flow.constants";
import { SessionFlowActionResult, SessionFlowError } from "../types/session-flow-state.types";
import { SessionFlow, StepType } from "../types/session-flow.types";
import {
  createStepsMap,
  findNextStep,
  getAutoAdvanceDelay,
  isAutoAdvancingStep,
  isFlowEndStep,
} from "../utils/session-flow-helpers";
import { createSessionFlowError, validateSessionFlow } from "../utils/session-flow-validation";
import { useSessionFlowState } from "./use-session-flow-state";

export interface SessionFlowEngineOptions {
  resumeStepId?: string;
  defaultAutoAdvanceDelay?: number;
  stepTransitionDelay?: number;
  onError?: (error: SessionFlowError, stepId?: string) => void;
  onStepChange?: (stepId: string, previousStepId: string | null) => void;
}

export function useSessionFlowEngine(sessionFlow: SessionFlow, options: SessionFlowEngineOptions = {}) {
  const {
    resumeStepId,
    defaultAutoAdvanceDelay = SESSION_FLOW_DEFAULTS.AUTO_ADVANCE_DELAY,
    stepTransitionDelay = SESSION_FLOW_DEFAULTS.STEP_TRANSITION_DELAY,
    onError,
    onStepChange,
  } = options;

  // Local state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [engineError, setEngineError] = useState<SessionFlowError | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // Session state
  const {
    session,
    isSessionReady,
    currentStepId,
    inputValues,
    setCurrentStepId: setStepId,
    updateSession,
    markStarted,
    markEnded,
    addLog,
    error: sessionError,
  } = useSessionFlowState({ sessionId: sessionFlow.id, autoCreate: true });

  // Validate flow on mount
  const flowValidation = useMemo(() => {
    return validateSessionFlow(sessionFlow);
  }, [sessionFlow]);

  useEffect(() => {
    if (!flowValidation.isValid) {
      const error = createSessionFlowError(
        "VALIDATION_ERROR",
        `Flow validation failed: ${flowValidation.errors.join(", ")}`,
        undefined,
        { flowId: sessionFlow.id, errors: flowValidation.errors }
      );
      setEngineError(error);
      onError?.(error);
    }
  }, [flowValidation, sessionFlow.id, onError]);

  // Memoize steps map
  const stepsMap = useMemo(() => createStepsMap(sessionFlow.steps), [sessionFlow.steps]);

  // Clear timeouts helper
  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer]);

  // Core navigation function
  const navigateToStep = useCallback(
    async (stepId: string): Promise<SessionFlowActionResult> => {
      try {
        if (!isSessionReady) {
          return {
            success: false,
            error: createSessionFlowError("VALIDATION_ERROR", "Session not ready", stepId, {
              sessionId: sessionFlow.id,
            }),
          };
        }

        const step = stepsMap[stepId];
        if (!step) {
          const error = createSessionFlowError("STEP_NOT_FOUND", `Step not found: ${stepId}`, stepId, {
            sessionId: sessionFlow.id,
          });
          setEngineError(error);
          onError?.(error, stepId);
          return { success: false, error };
        }

        clearTimer();
        setEngineError(null);

        // Set transitioning state
        setIsTransitioning(true);

        // Transition delay for UX
        if (stepTransitionDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, stepTransitionDelay));
        }

        const previousStepId = currentStepId;

        // Update current step
        const result = setStepId(stepId);
        if (!result.success) {
          setIsTransitioning(false);
          return result;
        }

        // Mark as ended if it's a flow end step
        if (isFlowEndStep(step)) {
          markEnded();
          addLog(`Flow completed at step: ${stepId}`);
        }

        setIsTransitioning(false);
        addLog(`Navigated to step: ${stepId}`);
        onStepChange?.(stepId, previousStepId);

        return { success: true };
      } catch (error) {
        setIsTransitioning(false);
        const sessionError = createSessionFlowError(
          "TRANSITION_ERROR",
          error instanceof Error ? error.message : "Failed to navigate to step",
          stepId,
          { sessionId: sessionFlow.id }
        );
        setEngineError(sessionError);
        onError?.(sessionError, stepId);
        return { success: false, error: sessionError };
      }
    },
    [
      isSessionReady,
      stepsMap,
      clearTimer,
      stepTransitionDelay,
      currentStepId,
      setStepId,
      markEnded,
      addLog,
      onStepChange,
      onError,
      sessionFlow.id,
    ]
  );

  // Auto-advance scheduler
  const scheduleAutoAdvance = useCallback(
    (delay: number, nextStepId: string) => {
      clearTimer();
      timeoutRef.current = window.setTimeout(() => {
        navigateToStep(nextStepId);
      }, delay);
    },
    [clearTimer, navigateToStep]
  );

  // Public API functions
  const startFlow = useCallback(async (): Promise<SessionFlowActionResult> => {
    try {
      if (!isSessionReady) {
        return {
          success: false,
          error: createSessionFlowError("VALIDATION_ERROR", "Session not ready", undefined, {
            sessionId: sessionFlow.id,
          }),
        };
      }

      const startStepId = resumeStepId || sessionFlow.initialStepId;

      const markResult = markStarted();
      if (!markResult.success) {
        return markResult;
      }

      addLog("Flow started");
      return await navigateToStep(startStepId);
    } catch (error) {
      const sessionError = createSessionFlowError(
        "INITIALIZATION_ERROR",
        error instanceof Error ? error.message : "Failed to start flow",
        undefined,
        { sessionId: sessionFlow.id }
      );
      setEngineError(sessionError);
      onError?.(sessionError);
      return { success: false, error: sessionError };
    }
  }, [
    isSessionReady,
    resumeStepId,
    sessionFlow.initialStepId,
    sessionFlow.id,
    markStarted,
    addLog,
    navigateToStep,
    onError,
  ]);

  const moveToNext = useCallback(async (): Promise<SessionFlowActionResult> => {
    try {
      if (!currentStepId) {
        return {
          success: false,
          error: createSessionFlowError("VALIDATION_ERROR", "No current step to advance from", undefined, {
            sessionId: sessionFlow.id,
          }),
        };
      }

      const currentStep = stepsMap[currentStepId];
      if (!currentStep) {
        const error = createSessionFlowError(
          "STEP_NOT_FOUND",
          `Current step not found: ${currentStepId}`,
          currentStepId,
          { sessionId: sessionFlow.id }
        );
        setEngineError(error);
        onError?.(error, currentStepId);
        return { success: false, error };
      }

      const nextStepId = findNextStep(currentStep, inputValues);
      if (!nextStepId) {
        return {
          success: false,
          error: createSessionFlowError("VALIDATION_ERROR", "No next step available", currentStepId, {
            sessionId: sessionFlow.id,
          }),
        };
      }

      return await navigateToStep(nextStepId);
    } catch (error) {
      const sessionError = createSessionFlowError(
        "TRANSITION_ERROR",
        error instanceof Error ? error.message : "Failed to move to next step",
        currentStepId || undefined,
        { sessionId: sessionFlow.id }
      );
      setEngineError(sessionError);
      onError?.(sessionError, currentStepId || undefined);
      return { success: false, error: sessionError };
    }
  }, [currentStepId, stepsMap, inputValues, navigateToStep, onError, sessionFlow.id]);

  const jumpToStep = useCallback(
    async (stepId: string): Promise<SessionFlowActionResult> => {
      addLog(`Jumping to step: ${stepId}`);
      return await navigateToStep(stepId);
    },
    [navigateToStep, addLog]
  );

  const endFlow = useCallback(async (): Promise<SessionFlowActionResult> => {
    try {
      const flowEndStep = sessionFlow.steps.find((step) => step.type === StepType.FLOW_END);
      if (!flowEndStep) {
        const error = createSessionFlowError("STEP_NOT_FOUND", "Flow end step not found", undefined, {
          sessionId: sessionFlow.id,
        });
        setEngineError(error);
        onError?.(error);
        return { success: false, error };
      }

      return await navigateToStep(flowEndStep.id);
    } catch (error) {
      const sessionError = createSessionFlowError(
        "TRANSITION_ERROR",
        error instanceof Error ? error.message : "Failed to end flow",
        undefined,
        { sessionId: sessionFlow.id }
      );
      setEngineError(sessionError);
      onError?.(sessionError);
      return { success: false, error: sessionError };
    }
  }, [navigateToStep, sessionFlow.steps, sessionFlow.id, onError]);

  const resetFlow = useCallback(
    async (autoStart = false): Promise<SessionFlowActionResult> => {
      try {
        clearTimer();
        setEngineError(null);

        const resetData = {
          inputValues: {},
          isFlowStarted: autoStart,
          currentStepId: autoStart ? sessionFlow.initialStepId : null,
          isFlowEnded: false,
        };

        const result = updateSession(resetData);
        if (!result.success) {
          return result;
        }

        addLog(autoStart ? "Flow reset and restarted" : "Flow reset");

        return { success: true };
      } catch (error) {
        const sessionError = createSessionFlowError(
          "VALIDATION_ERROR",
          error instanceof Error ? error.message : "Failed to reset flow",
          undefined,
          { sessionId: sessionFlow.id }
        );
        setEngineError(sessionError);
        onError?.(sessionError);
        return { success: false, error: sessionError };
      }
    },
    [clearTimer, sessionFlow.initialStepId, sessionFlow.id, updateSession, addLog, onError]
  );

  // Auto-advance effect
  useEffect(() => {
    if (!currentStepId || isTransitioning || !isSessionReady) return;

    const step = stepsMap[currentStepId];
    if (!step || !isAutoAdvancingStep(step)) return;

    const delay = getAutoAdvanceDelay(step, sessionFlow.defaultAutoAdvanceDelay, defaultAutoAdvanceDelay);
    const nextStepId = findNextStep(step, inputValues);

    if (nextStepId) {
      scheduleAutoAdvance(delay, nextStepId);
    }

    return clearTimer;
  }, [
    currentStepId,
    isTransitioning,
    isSessionReady,
    stepsMap,
    sessionFlow.defaultAutoAdvanceDelay,
    defaultAutoAdvanceDelay,
    inputValues,
    scheduleAutoAdvance,
    clearTimer,
  ]);

  // Get current step helper
  const getCurrentStep = useCallback(() => {
    return currentStepId ? stepsMap[currentStepId] : null;
  }, [currentStepId, stepsMap]);

  // Combined error state
  const hasError = Boolean(engineError || sessionError);
  const combinedError = engineError || sessionError;

  return {
    // State
    session,
    currentStepId,
    isTransitioning,
    isSessionReady,
    hasError,
    error: combinedError,
    flowValidation,

    // Current step helpers
    getCurrentStep,

    // Navigation actions
    startFlow,
    endFlow,
    moveToNext,
    jumpToStep,
    resetFlow,

    // Error management
    clearError: () => setEngineError(null),
  };
}
