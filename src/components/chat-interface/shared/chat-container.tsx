"use client";

import React from "react";

import { cn } from "@/lib/utils";
import { ChatContainerProps } from "../types/chat.types";
import { ChatHeader } from "./chat-header";
import { MessagesContainer } from "./messages-container";

interface Props extends ChatContainerProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  input?: React.ReactNode;
}

export const ChatContainer: React.FC<Props> = ({
  mode,
  session,
  variant = "default",
  className,
  children,
  header,
  input,
}) => {
  const containerClass = cn(
    "flex flex-col h-full bg-white dark:bg-gray-900",
    {
      "max-w-4xl mx-auto": variant === "default",
      "w-full": variant === "compact",
    },
    className
  );

  return (
    <div className={containerClass}>
      {/* Header */}
      {header || <ChatHeader session={session} mode={mode} />}

      {/* Messages Container */}
      <MessagesContainer>{children}</MessagesContainer>

      {/* Input Area */}
      {input && <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-900">{input}</div>}
    </div>
  );
};
