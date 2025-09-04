"use client";

import React, { useCallback, useMemo } from "react";

import FlowChatMessageBubble from "@/components/chat-ui/flow-chat/flow-chat.message-bubble";
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
import { cn } from "@/lib/utils";
import { UserOption } from "@/lib/zod/session-flow-schema";
import { ChatMessage, MessageType } from "@/types/flow-chat-messages.types";

interface Props {
  className?: string;
  message: ChatMessage;
  actions: {
    moveToNextStep: () => void;
    moveToStep: (stepId: string) => void;
    onUserInput: (key: string, value: string, meta: { id: string; label: string }) => void;
    onUserSelect: (key: string, selection: UserOption | UserOption[], meta: { id: string; label: string }) => void;
  };
}

// Utility function to get message-specific styling
const getMessageStyling = (messageType: MessageType) => {
  const styleMap = {
    [MessageType.USER_MESSAGE]: "bg-mir-bg-accent dark:bg-mir-bg-accent-dark font-medium text-white",
    [MessageType.FLOW_END]: "bg-mir-bg-accent dark:bg-mir-bg-accent-dark font-medium text-white",
    [MessageType.USER_INPUT]: "bg-mir-bg-card text-mir-text-primary",
    [MessageType.OPTIONS]: "bg-mir-bg-card text-mir-text-primary",
    [MessageType.SYSTEM]: "bg-mir-bg-card text-mir-text-primary",
    [MessageType.ACTION]: "bg-mir-bg-secondary text-white",
    [MessageType.REFLECTION]: "bg-mir-bg-secondary text-white",
    [MessageType.TEXT]: "bg-mir-bg-secondary text-white",
  } as const;

  return styleMap[messageType as keyof typeof styleMap] || "bg-mir-bg-card text-mir-text-primary";
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
  actions: { moveToNextStep, moveToStep, onUserInput, onUserSelect },
}) => {
  const { type } = message;

  const isUser = type === MessageType.USER_MESSAGE;

  const handleUserInput = useCallback(
    (key: string, value: string) => {
      if (message.type !== MessageType.USER_INPUT) return;
      const { id, content } = message;
      onUserInput(key, value, { id: id, label: content.label });
    },
    [message, onUserInput]
  );

  const handleUserOptionSelect = useCallback(
    (key: string, selection: UserOption | UserOption[]) => {
      if (message.type !== MessageType.OPTIONS) return;
      const { id, content } = message;
      onUserSelect(key, selection, {
        id: id,
        label: content.label,
      });
    },
    [message, onUserSelect]
  );

  const messageContent = useMemo(() => {
    switch (type) {
      case MessageType.TEXT:
        return <FlowTextMessage message={message} />;
      case MessageType.USER_MESSAGE:
        return <FlowUserMessage message={message} />;
      case MessageType.PARAGRAPHS:
        return <FlowParagraphs message={message} onMoveToNextStep={moveToNextStep} />;
      case MessageType.USER_INPUT:
        return <FlowUserInput message={message} onUserInput={handleUserInput} />;
      case MessageType.OPTIONS:
        return <FlowUserOptions message={message} onUserSelect={handleUserOptionSelect} />;
      case MessageType.ACTION:
        return (
          <FlowAction
            message={message}
            onUserAction={(action, nextStepId) => {
              moveToStep(nextStepId);
            }}
          />
        );
      case MessageType.REFLECTION:
        return <FlowReflection message={message} />;
      case MessageType.SYSTEM:
        return <FlowSystemAction message={message} />;
      case MessageType.FLOW_END:
        return <FlowEnd message={message} onAction={() => {}} />;
      default:
        return <UnknownMessageFallback messageType={type} />;
    }
  }, [handleUserInput, handleUserOptionSelect, message, moveToNextStep, moveToStep, type]);

  const messageStyling = useMemo(() => getMessageStyling(type), [type]);

  return (
    <FlowChatMessageBubble className={cn("z-10", isUser ? "self-end" : "self-start w-full", className, messageStyling)}>
      {messageContent}
    </FlowChatMessageBubble>
  );
};

export default React.memo(FlowChatMessageRenderer, (prev, next) => {
  // Primary check: if message reference is the same, skip other checks
  if (prev.message === next.message) {
    return true;
  }

  // Deep comparison for message content if references differ
  const messageChanged =
    prev.message.id !== next.message.id ||
    prev.message.type !== next.message.type ||
    JSON.stringify(prev.message.content) !== JSON.stringify(next.message.content);

  if (messageChanged) {
    return false;
  }

  // For actions, we can be more lenient - they usually don't change often
  // Only do expensive action comparison if message is the same
  return prev.className === next.className;
});
