"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

import { cn } from "@/lib/utils";
import { MessageBubble } from "../shared/message-bubble";
import { ChatMessage, MessageRendererProps } from "../types/chat.types";

export const OpenMessageRenderer: React.FC<MessageRendererProps<ChatMessage>> = ({ message }) => {
  const { role, content, timestamp } = message;

  const renderContent = () => {
    if (role === "assistant") {
      return (
        <div
          className={cn(
            "prose prose-sm max-w-none",
            "prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
            "prose-headings:text-gray-900 dark:prose-headings:text-gray-100",
            "prose-p:text-gray-900 dark:prose-p:text-gray-100",
            "prose-strong:text-gray-900 dark:prose-strong:text-gray-100",
            "prose-code:bg-gray-100 dark:prose-code:bg-gray-700",
            "prose-code:text-gray-900 dark:prose-code:text-gray-100",
            "prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800"
          )}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      );
    }

    return <div className="whitespace-pre-wrap">{content}</div>;
  };

  return (
    <MessageBubble role={role} timestamp={timestamp}>
      {renderContent()}
    </MessageBubble>
  );
};
