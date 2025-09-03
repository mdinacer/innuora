// engines/useFlowEngine.ts

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SessionFlowState, useSessionStore } from "@/stores/session-store";
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
  const session = useSessionStore((state) => state.sessions[sessionFlow.id]) as SessionFlowState | undefined;
  const updateSession = useSessionStore((state) => state.updateSession);

  const currentStepId = session?.currentStepId || null;
  const [isTransitioning, setTransitioning] = useState(false);

  // Memoize steps map once
  const stepsMap = useMemo(
    () => Object.fromEntries(sessionFlow.steps.map((step) => [step.id, step])),
    [sessionFlow.steps]
  );

  // Single update function
  const update = useCallback(
    (updates: any) => {
      updateSession(sessionFlow.id, updates);
    },
    [sessionFlow.id, updateSession]
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
      update({
        currentStepId: stepId,
        isFlowEnded: step.type === StepType.FLOW_END,
      });
      setTransitioning(false);
    },
    [stepsMap, clearTimer, update, stepTransitionDelay, onError]
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
    update({ isFlowStarted: true });
    navigateToStep(startStepId);
  }, [resumeStepId, sessionFlow.initialStepId, update, navigateToStep]);

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
      if (autoStart) {
        navigateToStep(sessionFlow.initialStepId);
      } else {
        update({ isFlowStarted: false, currentStepId: null });
      }
    },
    [clearTimer, navigateToStep, sessionFlow.initialStepId, update]
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
