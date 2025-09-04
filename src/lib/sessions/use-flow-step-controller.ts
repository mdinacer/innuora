import { useCallback, useEffect, useMemo, useRef } from "react";

import { SessionFlowState, useSessionStore } from "@/stores/session-store";
import { FlowStep, SessionFlow, StepType } from "@/types/flow-session.types";
import { flowStepToChatMessage } from "../chat/flow/step-to-chat-message";
import useChatEngine from "../chat/use-chat";

export interface FlowStepControllerOptions {
  sessionFlow: SessionFlow;
  options?: {
    autoCreateMessages?: boolean;
    skipStepTypes?: StepType[];
  };
  onStepChange?: (step: FlowStep, previousStep: FlowStep | null) => void;
}
export default function useFlowStepController({ sessionFlow, options = {}, onStepChange }: FlowStepControllerOptions) {
  const { id: sessionId } = sessionFlow;
  const { autoCreateMessages = true, skipStepTypes = ["system", "reflection"] } = options;
  const hasSessionHydrated = useSessionStore((state) => state.hasHydrated);
  const session = useSessionStore((state) => state.sessions[sessionId]) as SessionFlowState | undefined;

  const currentStepId = useMemo(() => session?.currentStepId || null, [session]);

  const previousStepIdRef = useRef<string | null>(null);

  const { addMessage, messageExistsByStepId, hasHydrated: hasMessagesHydrated } = useChatEngine({ sessionId });

  const isReady = useMemo(() => hasSessionHydrated && hasMessagesHydrated, [hasSessionHydrated, hasMessagesHydrated]);

  // Memoize steps map once (only recalculates if steps change)
  const stepLookupMap = useMemo(() => new Map(sessionFlow.steps.map((step) => [step.id, step])), [sessionFlow.steps]);

  // Memoize skip types set for faster lookups
  const skipStepTypesSet = useMemo(() => new Set(skipStepTypes), [skipStepTypes]);

  // Get current step (memoized)
  const currentStep = useMemo(
    () => (currentStepId ? stepLookupMap.get(currentStepId) || null : null),
    [currentStepId, stepLookupMap]
  );

  // Get previous step for comparison
  const previousStep = useMemo(
    () => (previousStepIdRef.current ? stepLookupMap.get(previousStepIdRef.current) || null : null),
    [stepLookupMap] // Note: Don't include previousStepIdRef.current as it would cause issues
  );

  // Core step change handler (optimized)
  const processStepChange = useCallback(
    (step: FlowStep, prevStep: FlowStep | null) => {
      // Skip if step type should be ignored
      if (skipStepTypesSet.has(step.type)) {
        return;
      }

      // Handle step-specific logic
      switch (step.type) {
        case StepType.SYSTEM:
          // System steps typically don't need messages
          break;

        case StepType.REFLECTION:
          // Reflection messages handled separately
          break;

        case StepType.BRANCH:
          // Branch steps are logic-only, no messages
          break;

        case StepType.FLOW_END:
          // Flow end might need special handling
          if (autoCreateMessages) {
            const message = flowStepToChatMessage(step);
            addMessage(message);
          }
          break;

        default:
          // Create message for regular steps
          if (autoCreateMessages) {
            // Only create if message doesn't already exist for this step
            if (!messageExistsByStepId(step.id)) {
              const message = flowStepToChatMessage(step);
              addMessage(message);
            }
          }
          break;
      }

      // Notify external handlers
      onStepChange?.(step, prevStep);
    },
    [skipStepTypesSet, autoCreateMessages, addMessage, messageExistsByStepId, onStepChange]
  );

  useEffect(() => {
    if (!isReady || !session || !currentStep) return;

    // Check if step actually changed
    const hasStepChanged = previousStepIdRef.current !== currentStepId;
    if (hasStepChanged) {
      processStepChange(currentStep, previousStep);

      // Update ref for next comparison
      previousStepIdRef.current = currentStepId || null;
    }
  }, [currentStep, currentStepId, isReady, previousStep, processStepChange, session]);
}
