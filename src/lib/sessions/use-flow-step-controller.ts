import { useCallback, useEffect, useMemo, useRef } from "react";

import { flowStepToChatMessage } from "@/lib/chat/flow/step-to-chat-message";
import useChatEngine from "@/lib/chat/use-chat";
import { useSessionState } from "@/lib/sessions/use-session-state";
import { useSessionStore } from "@/stores/session.store";
import {
  FlowStep,
  SessionFlow,
  StepOfType,
  StepType,
  SystemAction,
  SystemActionCallback,
} from "@/types/flow-session.types";

export interface FlowStepControllerOptions {
  sessionFlow: SessionFlow;
  options?: {
    autoCreateMessages?: boolean;
    skipStepTypes?: StepType[];
  };
  callbacks?: Record<string, SystemActionCallback>;
  onStepChange?: (step: FlowStep, previousStep: FlowStep | null) => void;
}
export default function useFlowStepController({
  sessionFlow,
  options = {},
  callbacks = {},
  onStepChange,
}: FlowStepControllerOptions) {
  const { id: sessionId } = sessionFlow;
  const { autoCreateMessages = true, skipStepTypes = [, "reflection"] } = options;
  const hasSessionHydrated = useSessionStore((state) => state.hasHydrated);
  const { session, updateSession } = useSessionState({ sessionId });

  const currentStepId = useMemo(() => session?.currentStepId || null, [session]);

  const previousStepIdRef = useRef<string | null>(null);

  const {
    hasHydrated: hasMessagesHydrated,
    addMessage,
    removeMessage,
    messageExistsByStepId,
    clearMessages,
  } = useChatEngine({ sessionId });

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

  const handleSystemAction = useCallback(
    async (action: SystemAction) => {
      const { type } = action;

      switch (type) {
        case "reset_flow":
          clearMessages();
          updateSession((prev) => ({
            ...prev,
            currentStepId: null,
          }));
          break;
        case "reset_session":
          clearMessages();
          updateSession((prev) => ({
            ...prev,
            currentStepId: null,
            inputValues: {},
          }));
          break;
        case "reset_values":
          updateSession((prev) => ({
            ...prev,
            inputValues: {},
          }));
          break;
        case "restart_session":
          const { resetValues, stepId } = action;
          clearMessages();
          updateSession((prev) => ({
            ...prev,
            currentStepId: stepId || sessionFlow.initialStepId,
            ...(resetValues ? { inputValues: {} } : {}),
          }));
          break;
        case "wipe_messages":
          clearMessages();
          break;
        case "callback":
          console.log("Running callback");
          const callback = callbacks[action.name];
          if (callback) {
            try {
              await callback(action.args ?? session.inputValues);
            } catch (err) {
              console.error("Callback error:", err);
            }
          }
          break;
      }
    },

    [callbacks, clearMessages, session?.inputValues, sessionFlow.initialStepId, updateSession]
  );

  const advanceToStep = useCallback(
    (stepId: string) => {
      updateSession((prev) => ({
        ...prev,
        currentStepId: stepId,
      }));
    },
    [updateSession]
  );

  const handleSystemStep = useCallback(
    (step: StepOfType<"system">, messageId: string) => {
      step.content.actions.forEach((action) => {
        handleSystemAction(action);
      });

      if (!step.nextStepId) return;

      if (step.autoAdvanceDelay) {
        setTimeout(() => advanceToStep(step.nextStepId!), 3000);
      } else {
        advanceToStep(step.nextStepId!);
      }

      setTimeout(() => removeMessage(messageId), 3000);
    },
    [advanceToStep, handleSystemAction, removeMessage]
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
          const systemMessage = flowStepToChatMessage(step);
          addMessage(systemMessage);
          handleSystemStep(step, systemMessage.id);

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
          const flowEndMessage = flowStepToChatMessage(step);
          addMessage(flowEndMessage);
          updateSession((prev) => ({
            ...prev,
            isFlowEnded: true,
          }));
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
    [
      autoCreateMessages,
      skipStepTypesSet,
      addMessage,
      handleSystemStep,
      messageExistsByStepId,
      onStepChange,
      updateSession,
    ]
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
