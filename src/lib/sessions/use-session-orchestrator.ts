import { useCallback, useEffect } from "react";

import { MessageType } from "@/types/flow-chat-messages.types";
import { FlowStep, SessionFlow, StepType } from "@/types/flow-session.types";
import { createUserMessage } from "../chat/flow/step-to-chat-message";
import useChatEngine from "../chat/use-chat";
import { UserOption } from "../zod/session-flow-schema";
import { useInitSessionStores } from "./use-init-session";
import { useSessionFlowEngine } from "./use-session-flow";
import { useSessionState } from "./use-session-state";

export interface SessionOrchestratorOptions {
  autoCreateMessages?: boolean;
  skipStepTypes?: StepType[];
}

interface SessionOrchestratorProps {
  sessionFlow: SessionFlow;
  initStores?: boolean;
  autoStart?: boolean;
  onStepChange?: (step: FlowStep, previousStep: FlowStep | null) => void;
}

export default function useSessionOrchestrator({
  sessionFlow,
  autoStart = false,
  initStores = false,
}: SessionOrchestratorProps) {
  const { id: sessionId } = sessionFlow;
  useInitSessionStores({ sessionId, autoCreate: initStores });
  const { session, setInputValues, updateSession } = useSessionState({ sessionId });

  const { isTransitioning, resetFlow, startFlow, moveToNext, jumpToStep } = useSessionFlowEngine(sessionFlow);
  const { messages, addMessage, clearMessages, updateMessage } = useChatEngine({ sessionId });

  const resetSession = useCallback(() => {
    resetFlow();
    clearMessages();
    updateSession((prev) => ({ ...prev, inputValues: {}, isFlowStarted: false, isFlowEnded: false }));
  }, [clearMessages, resetFlow, updateSession]);

  const handleUserInput = useCallback(
    (key: string, value: string, meta: { id: string; label: string }) => {
      updateMessage(meta.id, {
        type: MessageType.TEXT,
        content: meta.label,
      });

      setInputValues((prev) => ({
        ...prev,
        [key]: value,
      }));
      addMessage(createUserMessage(value));
      moveToNext();
    },
    [updateMessage, setInputValues, addMessage, moveToNext]
  );

  const processUserSelection = useCallback(
    (key: string, selection: UserOption | UserOption[], meta: { id: string; label: string }) => {
      const isArray = Array.isArray(selection);
      const labels = isArray ? selection.map((s) => s.label) : selection.label;
      const values = isArray ? selection.map((s) => s.value) : selection.value;

      // Update the original message with the label
      updateMessage(meta.id, {
        type: MessageType.TEXT,
        content: meta.label,
      });

      setInputValues((prev) => ({
        ...prev,
        [key]: values,
      }));

      addMessage(createUserMessage(labels));
      moveToNext();
      return { labels, values };
    },
    [updateMessage, setInputValues, addMessage, moveToNext]
  );
  useEffect(() => {
    if (autoStart && session && !session.isFlowStarted) startFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, startFlow]);

  return {
    isTransitioning,
    session,
    messages: messages ?? [],
    clearMessages,
    startFlow,
    resetFlow,
    resetSession,
    moveToNext,
    moveToStep: jumpToStep,
    handleUserInput,
    processUserSelection,
  };
}
