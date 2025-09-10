// engines/useFlowEngine.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSessionState } from "@/lib/sessions/use-session-state";
import { AdvanceMode, SessionFlow, StepType } from "@/types/flow-session.types";

export interface FlowEngineOptions {
  resumeStepId?: string;
  defaultAutoAdvanceDelay?: number;
  stepTransitionDelay?: number;
  onError?: (error: Error, stepId: string) => void;
}

export function useSessionFlowEngine(sessionFlow: SessionFlow, options: FlowEngineOptions = {}) {
  const { resumeStepId, defaultAutoAdvanceDelay = 3000, stepTransitionDelay = 800, onError } = options;

  // Single ref for timeout management
  const timeoutRef = useRef<number | null>(null);

  // Get session state
  const { session, updateSession } = useSessionState({ sessionId: sessionFlow.id });

  const currentStepId = session?.currentStepId || null;
  const [isTransitioning, setTransitioning] = useState(false);

  // Memoize steps map once
  const stepsMap = useMemo(
    () => Object.fromEntries(sessionFlow.steps.map((step) => [step.id, step])),
    [sessionFlow.steps]
  );

  // Clear timeouts helper
  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Core navigation function
  const navigateToStep = useCallback(
    async (stepId: string) => {
      const step = stepsMap[stepId];
      if (!step) {
        onError?.(new Error(`Step not found: ${stepId}`), stepId);
        return;
      }

      clearTimer();

      // Set transitioning state
      setTransitioning(true);

      // Transition delay for UX
      if (stepTransitionDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, stepTransitionDelay));
      }

      // Update current step
      updateSession({
        currentStepId: stepId,
        isFlowEnded: step.type === StepType.FLOW_END,
      });
      setTransitioning(false);
    },
    [stepsMap, clearTimer, stepTransitionDelay, updateSession, onError]
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

  // Public API
  const startFlow = useCallback(() => {
    const startStepId = resumeStepId || sessionFlow.initialStepId;
    updateSession({ isFlowStarted: true });
    navigateToStep(startStepId);
  }, [resumeStepId, sessionFlow.initialStepId, updateSession, navigateToStep]);

  const moveToNext = useCallback(() => {
    if (!currentStepId) return;

    const currentStep = stepsMap[currentStepId];
    if (!currentStep || !("nextStepId" in currentStep)) return;

    navigateToStep(currentStep.nextStepId!);
  }, [currentStepId, stepsMap, navigateToStep]);

  const jumpToStep = useCallback(
    (stepId: string) => {
      navigateToStep(stepId);
    },
    [navigateToStep]
  );

  const endFlow = useCallback(() => {
    const flowEndStep = sessionFlow.steps.find((step) => step.type === StepType.FLOW_END);
    if (!flowEndStep) {
      throw new Error("Flow end step not found");
    }

    navigateToStep(flowEndStep.id);
  }, [navigateToStep, sessionFlow.steps]);

  const resetFlow = useCallback(
    (autoStart = false) => {
      clearTimer();
      updateSession({
        inputValues: {},
        isFlowStarted: autoStart,
        currentStepId: autoStart ? sessionFlow.initialStepId : null,
      });
    },
    [clearTimer, sessionFlow.initialStepId, updateSession]
  );

  // Auto-advance effect - SINGLE EFFECT
  useEffect(() => {
    if (!currentStepId || isTransitioning) return;

    const step = stepsMap[currentStepId];
    if (!step || !("advanceMode" in step) || !("nextStepId" in step)) return;

    // Handle auto-advance
    if (step.advanceMode === AdvanceMode.AUTO && "nextStepId" in step) {
      const delay = step.autoAdvanceDelay ?? sessionFlow.defaultAutoAdvanceDelay ?? defaultAutoAdvanceDelay;

      scheduleAutoAdvance(delay, step.nextStepId!);
    }

    // Cleanup on step change
    return clearTimer;
  }, [
    currentStepId,
    isTransitioning,
    stepsMap,
    sessionFlow.defaultAutoAdvanceDelay,
    defaultAutoAdvanceDelay,
    scheduleAutoAdvance,
    clearTimer,
  ]);

  // Cleanup on unmount
  useEffect(() => clearTimer, [clearTimer]);

  const getCurrentStep = useCallback(() => {
    return currentStepId ? stepsMap[currentStepId] : null;
  }, [currentStepId, stepsMap]);

  return {
    // State
    currentStepId,
    isTransitioning,
    getCurrentStep,
    // Actions
    startFlow,
    endFlow,
    moveToNext,
    jumpToStep,
    resetFlow,
  };
}
