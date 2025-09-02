"use client";

import React, { useMemo } from "react";
import { ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { ChatMessage, MessageType } from "@/types/flow-chat-messages.types";
import FlowChatMessageBubble from "./flow-chat.message-bubble";
import FlowChatMessageHeader from "./flow-chat.message-header";
import FlowChatAction from "./messages/flow-chat.flow-action";
import FlowChatEnd from "./messages/flow-chat.flow-end";
import FlowChatReflection from "./messages/flow-chat.reflection";
import FlowChatSystemAction from "./messages/flow-chat.system-action";
import FlowChatTextMessage from "./messages/flow-chat.text-message";
import FlowChatUserInput from "./messages/flow-chat.user-input";
import FlowChatUserMessage from "./messages/flow-chat.user-message";
import FlowChatUserOptions from "./messages/flow-chat.user-options";
import FlowChatParagraphs from "./messages/flow-chat.user-paragraphs";

interface Props {
  className?: string;
  message: ChatMessage;
}

const FlowChatMessageRenderer: React.FC<Props> = ({ message, className }) => {
  const { type } = message;

  const isUser = type === MessageType.USER_MESSAGE;
  const isAccent = ["user_message"].includes(type);

  const messageContent = useMemo(() => {
    switch (type) {
      case MessageType.TEXT:
        return <FlowChatTextMessage message={message} />;
      case MessageType.USER_MESSAGE:
        return <FlowChatUserMessage message={message} />;
      case MessageType.PARAGRAPHS:
        return <FlowChatParagraphs message={message} />;
      case MessageType.USER_INPUT:
        return <FlowChatUserInput message={message} onUserInput={() => {}} />;
      case MessageType.OPTIONS:
        return <FlowChatUserOptions message={message} onUserSelect={() => {}} />;
      case MessageType.ACTION:
        return <FlowChatAction message={message} onUserAction={() => {}} />;
      case MessageType.REFLECTION:
        return <FlowChatReflection message={message} />;
      case MessageType.SYSTEM:
        return <FlowChatSystemAction message={message} />;
      case MessageType.FLOW_END:
        return <FlowChatEnd message={message} onAction={() => {}} />;
      default:
        return (
          <>
            <FlowChatMessageHeader isAccent={isAccent} primaryContent="01" secondaryContent="How Are You Feeling?" />
            <h3
              className={cn(
                "card-title",
                " text-2xl font-bold text-mir-text-primary mb-2 leading-[1.3] -tracking-[0.3px]"
              )}
            >
              How Are You Feeling?
            </h3>
            <p className={cn("card-content", "mb-4")}>
              Take a moment to notice what's present for you right now. There's no right or wrong answer—just what's
              true for you in this moment.
            </p>
            <button
              className={cn(
                "card-action",
                "mt-4 flex items-center gap-1.5 text-sm font-semibold cursor-pointer bg-none border-none p-0",
                isAccent ? "text-white" : "text-mir-bg-accent"
              )}
            >
              <span>Share your feelings</span>
              <ChevronRightIcon className="size-4 shrink-0" />
            </button>
          </>
        );
    }
  }, [isAccent, message, type]);

  return (
    <FlowChatMessageBubble
      className={cn("z-10", isUser ? "self-end" : "self-start w-full", className, {
        "bg-mir-bg-accent dark:bg-mir-bg-accent-dark font-medium text-white":
          message.type === MessageType.USER_MESSAGE || message.type === MessageType.FLOW_END,

        "bg-mir-bg-card text-mir-text-primary":
          message.type === MessageType.USER_INPUT ||
          message.type === MessageType.OPTIONS ||
          message.type === MessageType.SYSTEM,

        "bg-mir-bg-secondary text-white":
          message.type === MessageType.ACTION ||
          message.type === MessageType.REFLECTION ||
          message.type === MessageType.TEXT,
      })}
    >
      {messageContent}
    </FlowChatMessageBubble>
    // <div
    //   className={cn(
    //     "message-card",
    //     " max-w-[75%] rounded-[20px]",
    //     "animate-slide-in-up delay-200 opacity-0",
    //     "mb-4 p-6 border border-mir-border-light",
    //     "shadow-[0_2px_12px] shadow-black/5",
    //     isAccent ? "bg-mir-bg-accent" : "bg-mir-bg-card ",
    //     isUser ? "self-end" : "self-start",

    //     className
    //   )}
    // >

    // </div>
  );
};

export default FlowChatMessageRenderer;
