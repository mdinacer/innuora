"use client";

import React from "react";
import { format } from "date-fns";
import Markdown from "markdown-to-jsx";

import { cn } from "@/lib/utils";
import { ConversationMessage } from "../types/chat-message";

interface Props {
  message: ConversationMessage;
  className?: string;
}

const STYLES_MAP = {
  user: "bg-primary text-white rounded-[20px] rtl:rounded-tl-[6px] ltr:rounded-tr-[6px]",
  assistant: "bg-secondary rounded-[20px] ltr:rounded-tl-[6px] rtl:rounded-tr-[6px]",
  system: "bg-secondary rounded-[20px] rounded-tl-[6px]",
};

const MessageBubble: React.FC<Props> = ({ message, className }) => {
  const { role, content } = message;
  const isUser = role === "user";

  const formattedDate = format(new Date(message.timestamp), "HH:mm");
  const messageStyle = STYLES_MAP[role];
  return (
    <div className={cn("mb-8 animate-slide-in-up duration-[600ms] ease-in delay-200", className)}>
      <div className={cn("flex flex-col gap-3 mb-4 md:flex-row items-start", isUser ? " md:flex-row-reverse" : "")}>
        <div
          className={cn(
            "size-9 rounded-lg flex items-center justify-center",
            "text-sm font-semibold rtl:font-sans shrink-0 text-white",
            isUser ? "bg-secondary" : "bg-primary"
          )}
        >
          {isUser ? "U" : "I"}
        </div>
        <div
          className={cn(
            "message-bubble",
            "w-full md:max-w-[75%] py-4 px-5 rounded-3xl leading-[1.5] relative",
            "[&>ol]:list-inside [&>ol]:list-decimal [&>p:not(:last-child)]:my-2 [&>ul]:list-inside [&>ul]:list-disc [&_*>li]:my-4 ",
            messageStyle
          )}
        >
          {message.role === "user" ? (
            content
          ) : (
            <Markdown
              className="prose rtl:text-lg text-foreground [&>p]:mb-3 last:[&>p]:mb-0"
              options={{
                forceBlock: true,
                disableParsingRawHTML: true,
              }}
            >
              {content}
            </Markdown>
          )}

          {message.role === "assistant" && (
            <>{message.follow_up_question && <p className="mt-4 text-foreground/70">{message.follow_up_question}</p>}</>
          )}
        </div>
      </div>
      <div className={cn("message-time", " text-xs text-muted-foreground mt-2 text-center font-medium")}>
        {formattedDate}
      </div>
    </div>
  );
};

export default MessageBubble;
