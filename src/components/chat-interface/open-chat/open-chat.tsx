"use client";

import React from 'react';
import { ChatContainer } from '../shared/chat-container';
import { ChatInput } from './chat-input';
import { OpenMessageRenderer } from './open-message-renderer';
import { ChatContainerProps, ChatMessage } from '../types/chat.types';

interface Props extends Omit<ChatContainerProps, 'mode'> {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  inputPlaceholder?: string;
}

export const OpenChat: React.FC<Props> = ({
  session,
  messages,
  onSendMessage,
  isLoading = false,
  inputPlaceholder = "Ask me anything...",
  variant,
  className
}) => {
  return (
    <ChatContainer
      mode="open"
      session={session}
      variant={variant}
      className={className}
      input={
        <ChatInput
          onSend={onSendMessage}
          disabled={isLoading}
          placeholder={inputPlaceholder}
        />
      }
    >
      {messages.map((message) => (
        <OpenMessageRenderer
          key={message.id}
          message={message}
        />
      ))}
      
      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 max-w-[80%]">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
    </ChatContainer>
  );
};