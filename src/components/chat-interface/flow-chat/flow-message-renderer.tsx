"use client";

import React, { useCallback, useMemo } from "react";
import { MessageBubble } from "../shared/message-bubble";
import { MessageRendererProps } from "../types/chat.types";

// Import your existing flow message types
import { ChatMessage, MessageType } from "@/types/flow-chat-messages.types";
import { UserOption } from "@/lib/zod/session-flow-schema";

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

export const FlowMessageRenderer: React.FC<Props> = ({
  message,
  isCurrentStep = false,
  actions,
  onFlowEnd
}) => {
  const { type } = message;

  const handleUserInput = useCallback((key: string, value: string, meta: { id: string; label: string }) => {
    actions.onUserInput(key, value, meta);
  }, [actions]);

  const handleUserSelect = useCallback((key: string, selection: UserOption | UserOption[], meta: { id: string; label: string }) => {
    actions.onUserSelect(key, selection, meta);
  }, [actions]);

  const handleFlowEnd = useCallback((actionType: "primary" | "secondary") => {
    onFlowEnd?.(actionType);
  }, [onFlowEnd]);

  const messageContent = useMemo(() => {
    const commonProps = {
      message,
      isCurrentStep,
      moveToNextStep: actions.moveToNextStep,
      moveToStep: actions.moveToStep
    };

    switch (type) {
      case MessageType.TEXT:
        return <FlowTextMessage {...commonProps} />;

      case MessageType.USER_INPUT:
        return (
          <FlowUserInput
            {...commonProps}
            onUserInput={handleUserInput}
          />
        );

      case MessageType.OPTIONS:
        return (
          <FlowUserOptions
            {...commonProps}
            onUserSelect={handleUserSelect}
          />
        );

      case MessageType.ACTION:
        return <FlowAction {...commonProps} />;

      case MessageType.REFLECTION:
        return <FlowReflection {...commonProps} />;

      case MessageType.SYSTEM:
        return <FlowSystemAction {...commonProps} />;

      case MessageType.USER_MESSAGE:
        return <FlowUserMessage {...commonProps} />;

      case MessageType.FLOW_END:
        return (
          <FlowEnd
            {...commonProps}
            onFlowEnd={handleFlowEnd}
          />
        );

      case MessageType.PARAGRAPHS:
        return <FlowParagraphs {...commonProps} />;

      default:
        return (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
            Unknown message type: {type}
          </div>
        );
    }
  }, [type, message, isCurrentStep, actions, handleUserInput, handleUserSelect, handleFlowEnd]);

  const role = type === MessageType.USER_MESSAGE ? 'user' : 
               type === MessageType.SYSTEM ? 'system' : 'assistant';

  return (
    <MessageBubble role={role} timestamp={message.timestamp}>
      {messageContent}
    </MessageBubble>
  );
};