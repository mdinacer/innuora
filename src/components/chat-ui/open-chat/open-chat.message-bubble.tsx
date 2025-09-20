"use client";

import React from "react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { CreditUtils, CreditUXUtils } from "@/lib/credits/credit-config";
import { cn } from "@/lib/utils";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface Props {
  message: OpenChatMessage;
  className?: string;
}

const STYLES_MAP = {
  user: "bg-mir-bg-accent text-white rounded-[20px] rtl:rounded-tl-[6px] ltr:rounded-tr-[6px]",
  assistant: "bg-mir-bg-input rounded-[20px] ltr:rounded-tl-[6px] rtl:rounded-tr-[6px]",
  system: "bg-mir-bg-input rounded-[20px] rounded-tl-[6px]",
};

const OpenChatMessageBubble: React.FC<Props> = ({ message, className }) => {
  const { role, content } = message;
  const isUser = role === "user";

  const formattedDate = format(new Date(message.timestamp), "HH:mm");
  const messageStyle = STYLES_MAP[role];
  return (
    <div className={cn("mb-8 opacity-0 animate-slide-in-up duration-[600ms] ease-in delay-200", className)}>
      <div className={cn("flex flex-col gap-3 mb-4 md:flex-row items-start", isUser ? " md:flex-row-reverse" : "")}>
        <div
          className={cn(
            "size-9 rounded-lg flex items-center justify-center",
            "text-sm font-semibold rtl:font-sans shrink-0 text-white",
            isUser ? "bg-mir-bg-secondary" : "bg-mir-bg-accent"
          )}
        >
          {isUser ? "U" : "M"}
        </div>
        <div
          className={cn(
            "message-bubble",
            "w-full md:max-w-[75%] py-4 px-5 rounded-3xl leading-[1.5] relative",
            "[&>ol]:list-inside [&>ol]:list-decimal [&>p:not(:last-child)]:my-2 [&>ul]:list-inside [&>ul]:list-disc [&_*>li]:my-4 ",
            messageStyle
          )}
        >
          {isUser ? (
            content
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              allowedElements={["p", "strong", "em", "a", "ul", "ol", "li", "br", "del", "u"]}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
      </div>
      <div className={cn("message-time", " text-xs text-mir-text-secondary mt-2 text-center font-medium")}>
        {formattedDate}
        {message.role === "assistant" && message.creditsUsed && (
          <span className="ml-2 opacity-75">
            • {CreditUtils.formatCreditsForDisplay(message.creditsUsed)} credits for this reflection
          </span>
        )}
      </div>
    </div>
  );
};

export default OpenChatMessageBubble;
