"use client";

import React from "react";

import { Container } from "@/components/chat-ui";
import { ChatMessage } from "@/types/flow-chat-messages.types";
import FlowChatMessageRenderer from "./flow-chat.message-renderer";

interface OpenChanUIProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

const SessionFlowChat: React.FC<OpenChanUIProps> = ({ messages, isLoading = false }) => {
  return (
    <Container
      messages={messages}
      isLoading={isLoading}
      renderItem={(message, index) => <FlowChatMessageRenderer key={index} message={message} />}
    />
  );
};

export default SessionFlowChat;
