"use client";

import React, { useCallback, useMemo } from "react";

import FlowChatMessageBubble from "@/components/chat-ui/flow-chat/flow-chat.message-bubble";
import {
  FlowEnd,
  FlowParagraphs,
  FlowTextMessage,
  FlowUserInput,
  FlowUserMessage,
  FlowUserOptions,
} from "@/components/chat-ui/flow-chat/messages";
import { cn } from "@/lib/utils";
import { AppMessageVariant, ChatMessage, MessageType } from "@/types/flow-chat-messages.types";
import { UserOption } from "@/types/flow-session.types";

interface Props {
  className?: string;
  message: ChatMessage;
  isCurrentStep?: boolean;
  actions: {
    moveToNextStep: () => void;
    moveToStep: (stepId: string) => void;
    onUserInput: (key: string, value: string, meta: { id: string; label: string }) => void;
    onUserSelect: (key: string, selection: UserOption | UserOption[], meta: { id: string; label: string }) => void;
  };
  onFlowEnd: (actionType: "primary" | "secondary") => Promise<void>;
}

// Utility function to get message-specific styling
const getMessageStyling = (messageType: MessageType, variant?: AppMessageVariant) => {
  if (messageType === MessageType.USER) {
    return "bg-inn-bg-accent dark:bg-inn-bg-accent-dark font-medium text-white";
  }

  // APP message variants
  if (variant === AppMessageVariant.END) {
    return "bg-inn-bg-accent dark:bg-inn-bg-accent-dark font-medium text-white";
  }

  if (variant === AppMessageVariant.INPUT || variant === AppMessageVariant.SELECT) {
    return "bg-inn-bg-card text-inn-text-primary";
  }

  return "bg-inn-bg-secondary text-inn-text-primary";
};

// Fallback component for unknown message types
const UnknownMessageFallback: React.FC<{ messageType: string }> = ({ messageType }) => (
  <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
    <p className="text-yellow-800 font-medium">Unknown message type: {messageType}</p>
    <p className="text-yellow-700 text-sm mt-1">This message type is not supported by the current renderer.</p>
  </div>
);

const FlowChatMessageRenderer: React.FC<Props> = ({
  message,
  className,
  isCurrentStep = false,
  onFlowEnd,
  actions: { moveToNextStep, onUserInput, onUserSelect },
}) => {
  const { type } = message;
  const isUser = type === MessageType.USER;
  const variant = type === MessageType.APP ? message.variant : undefined;

  const handleUserInput = useCallback(
    (key: string, value: string) => {
      if (message.type !== MessageType.APP || message.variant !== AppMessageVariant.INPUT) return;
      const { id, content } = message;
      onUserInput(key, value, { id: id, label: content.label });
    },
    [message, onUserInput]
  );

  const handleUserOptionSelect = useCallback(
    (key: string, selection: UserOption | UserOption[]) => {
      if (message.type !== MessageType.APP || message.variant !== AppMessageVariant.SELECT) return;
      const { id, content } = message;
      onUserSelect(key, selection, {
        id: id,
        label: content.label,
      });
    },
    [message, onUserSelect]
  );

  const messageContent = useMemo(() => {
    if (type === MessageType.USER) {
      return <FlowUserMessage message={message} />;
    }

    // APP messages with variants
    if (type === MessageType.APP) {
      const appMessage = message;
      switch (appMessage.variant) {
        case AppMessageVariant.TEXT:
          return <FlowTextMessage message={appMessage} />;
        case AppMessageVariant.PARAGRAPHS:
          return <FlowParagraphs isDisabled={!isCurrentStep} message={appMessage} onMoveToNextStep={moveToNextStep} />;
        case AppMessageVariant.INPUT:
          return <FlowUserInput message={appMessage} onUserInput={handleUserInput} isCurrentStep={isCurrentStep} />;
        case AppMessageVariant.SELECT:
          return (
            <FlowUserOptions message={appMessage} onUserSelect={handleUserOptionSelect} isCurrentStep={isCurrentStep} />
          );
        case AppMessageVariant.END:
          return <FlowEnd isCurrentStep={isCurrentStep} message={appMessage} onAction={onFlowEnd} />;
        default: {
          //const _exhaustiveCheck: never = appMessage;
          return <UnknownMessageFallback messageType={`APP:unknown`} />;
        }
      }
    }

    return <UnknownMessageFallback messageType={type} />;
  }, [handleUserInput, handleUserOptionSelect, isCurrentStep, message, moveToNextStep, onFlowEnd, type]);

  // Simple styling lookup - no memoization needed
  const messageStyling = getMessageStyling(type, variant);

  return (
    <FlowChatMessageBubble
      className={cn(
        "z-10 ",
        isUser ? "self-end rtl:self-start" : "self-start rtl:self-end w-full",
        className,
        messageStyling
      )}
    >
      {messageContent}
    </FlowChatMessageBubble>
  );
};

export default FlowChatMessageRenderer;
