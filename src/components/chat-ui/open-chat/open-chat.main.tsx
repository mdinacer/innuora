"use client";

import React, { useCallback, useState } from "react";

import { Container } from "@/components/chat-ui";
import { MessageBubble } from "@/components/chat-ui/open-chat";

type BaseMessage = {
  role: "assistant" | "user";
  content: string;
};

interface OpenChanUIProps {
  messages: BaseMessage[];
  onAddMessage: (message: BaseMessage) => void;
  onUserMessageSent: (message: string) => Promise<string>;
}

const OpenChat: React.FC<OpenChanUIProps> = ({ messages, onAddMessage, onUserMessageSent }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleUserInput = useCallback(
    async (value: string) => {
      const userMessage: BaseMessage = {
        role: "user",
        content: value,
      };

      onAddMessage(userMessage);
      setIsLoading(true);

      const response = await onUserMessageSent(value);

      const assistantMessage: BaseMessage = {
        role: "assistant",
        content: response,
      };

      if (response) {
        onAddMessage(assistantMessage);
      }

      setIsLoading(false);
    },
    [onAddMessage, onUserMessageSent]
  );
  return (
    <Container
      onUserInput={handleUserInput}
      messages={messages}
      isLoading={isLoading}
      renderItem={(message, index) => <MessageBubble key={index} {...message} />}
    />
  );
};

export default OpenChat;
