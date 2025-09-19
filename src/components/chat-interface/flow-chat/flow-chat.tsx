"use client";

import React from "react";

import { UserOption } from "@/lib/zod/session-flow-schema";
import { ChatMessage } from "@/types/flow-chat-messages.types";
import { ChatContainer } from "../shared/chat-container";
import { ChatContainerProps } from "../types/chat.types";
import { FlowMessageRenderer } from "./flow-message-renderer";

interface Props extends Omit<ChatContainerProps, "mode"> {
  messages: ChatMessage[];
  currentStep?: number;
  onUserInput: (key: string, value: string, meta: { id: string; label: string }) => void;
  onUserSelect: (key: string, selection: UserOption | UserOption[], meta: { id: string; label: string }) => void;
  onFlowEnd?: (actionType: "primary" | "secondary") => void;
  onMoveToNextStep: () => void;
  onMoveToStep: (stepId: string) => void;
}

export const FlowChat: React.FC<Props> = ({
  session,
  messages,
  currentStep = 0,
  variant,
  className,
  onUserInput,
  onUserSelect,
  onFlowEnd,
  onMoveToNextStep,
  onMoveToStep,
}) => {
  const actions = {
    moveToNextStep: onMoveToNextStep,
    moveToStep: onMoveToStep,
    onUserInput,
    onUserSelect,
  };

  return (
    <ChatContainer mode="flow" session={session} variant={variant} className={className}>
      {messages.map((message, index) => (
        <FlowMessageRenderer
          key={message.id}
          message={message}
          isCurrentStep={index === currentStep}
          actions={actions}
          onFlowEnd={onFlowEnd}
        />
      ))}
    </ChatContainer>
  );
};
