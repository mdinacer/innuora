"use client";

import React from "react";

import { Container } from "@/components/chat-ui";
import { MessageBubble } from "@/components/chat-ui/open-chat";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface OpenChanUIProps {
  isLoading?: boolean;
  messages: OpenChatMessage[];
  onUserMessageSent: (message: string) => Promise<void>;
}

const OpenChat: React.FC<OpenChanUIProps> = ({ messages, isLoading = false, onUserMessageSent }) => {
  return (
    <Container
      onUserInput={onUserMessageSent}
      messages={messages}
      isLoading={isLoading}
      renderItem={(message, index) => <MessageBubble key={index} message={message} />}
    />
  );
};

export default OpenChat;
