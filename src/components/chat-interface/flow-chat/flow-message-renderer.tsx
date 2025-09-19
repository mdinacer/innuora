"use client";

import React, { useCallback, useMemo } from "react";

// Import existing flow message components
import {
  FlowAction,
  FlowEnd,
  FlowParagraphs,
  FlowReflection,
  FlowSystemAction,
  FlowTextMessage,
  FlowUserInput,
  FlowUserMessage,
  FlowUserOptions,
} from "@/components/chat-ui/flow-chat/messages";
import { UserOption } from "@/lib/zod/session-flow-schema";
// Import your existing flow message types
import { ChatMessage, MessageType } from "@/types/flow-chat-messages.types";
import { MessageBubble } from "../shared/message-bubble";
import { MessageRendererProps } from "../types/chat.types";

interface Props extends MessageRendererProps<ChatMessage> {
  isCurrentStep?: boolean;
  actions: {
    moveToNextStep: () => void;
    moveToStep: (stepId: string) => void;
    onUserInput: (key: string, value: string, meta: { id: string; label: string }) => void;
    onUserSelect: (key: string, selection: UserOption | UserOption[], meta: { id: string; label: string }) => void;
  };
  onFlowEnd?: (actionType: "primary" | "secondary") => void;
}

export const FlowMessageRenderer: React.FC<Props> = ({ message, isCurrentStep = false, actions, onFlowEnd }) => {
  const { type } = message;

  // Wrapper functions to match component signatures
  const handleUserInputAdapter = useCallback(
    (key: string, value: string) => {
      actions.onUserInput(key, value, { id: message.id, label: `User input: ${key}` });
    },
    [actions, message.id]
  );

  const handleUserSelectAdapter = useCallback(
    (key: string, selection: UserOption | UserOption[]) => {
      actions.onUserSelect(key, selection, { id: message.id, label: `User selection: ${key}` });
    },
    [actions, message.id]
  );

  const handleUserAction = useCallback(
    (actionType: "primary" | "secondary", nextStepId: string) => {
      actions.moveToStep(nextStepId);
    },
    [actions]
  );

  const handleFlowEnd = useCallback(
    (actionType: "primary" | "secondary") => {
      onFlowEnd?.(actionType);
    },
    [onFlowEnd]
  );

  const messageContent = useMemo(() => {
    const baseProps = {
      isCurrentStep,
      moveToNextStep: actions.moveToNextStep,
      moveToStep: actions.moveToStep,
    };

    switch (type) {
      case MessageType.TEXT:
        return <FlowTextMessage message={message as any} {...baseProps} />;

      case MessageType.USER_INPUT:
        return <FlowUserInput message={message as any} {...baseProps} onUserInput={handleUserInputAdapter} />;

      case MessageType.OPTIONS:
        return <FlowUserOptions message={message as any} {...baseProps} onUserSelect={handleUserSelectAdapter} />;

      case MessageType.ACTION:
        return <FlowAction message={message as any} {...baseProps} onUserAction={handleUserAction} />;

      case MessageType.REFLECTION:
        return <FlowReflection message={message as any} {...baseProps} />;

      case MessageType.SYSTEM:
        return <FlowSystemAction message={message as any} {...baseProps} />;

      case MessageType.USER_MESSAGE:
        return <FlowUserMessage message={message as any} {...baseProps} />;

      case MessageType.FLOW_END:
        return <FlowEnd message={message as any} {...baseProps} onAction={handleFlowEnd} />;

      case MessageType.PARAGRAPHS:
        return <FlowParagraphs message={message as any} {...baseProps} onMoveToNextStep={actions.moveToNextStep} />;

      default:
        return (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
            Unknown message type: {type}
          </div>
        );
    }
  }, [
    type,
    message,
    isCurrentStep,
    actions,
    handleUserInputAdapter,
    handleUserSelectAdapter,
    handleUserAction,
    handleFlowEnd,
  ]);

  const role = type === MessageType.USER_MESSAGE ? "user" : type === MessageType.SYSTEM ? "system" : "assistant";

  return (
    <MessageBubble role={role} timestamp={message.timestamp}>
      {messageContent}
    </MessageBubble>
  );
};
