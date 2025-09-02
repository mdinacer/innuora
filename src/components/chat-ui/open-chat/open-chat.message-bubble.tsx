import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  role: "assistant" | "user";
  content: string;
  className?: string;
}

const OpenChatMessageBubble: React.FC<Props> = ({ role, content, className }) => {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "message-group",
        "mb-8 opacity-0 animate-slide-in-up duration-[600ms] ease-in delay-200",
        className
      )}
    >
      <div className={cn("flex gap-3 mb-4 items-start", isUser ? " flex-row-reverse" : "")}>
        <div
          className={cn(
            "size-9 rounded-lg flex items-center justify-center",
            "text-sm font-semibold shrink-0 text-white",
            isUser ? "bg-mir-bg-secondary" : "bg-mir-bg-accent"
          )}
        >
          {isUser ? "U" : "M"}
        </div>
        <div
          className={cn("message-bubble", "max-w-[75%] py-4 px-5 rounded-3xl leading-[1.5] relative", {
            "bg-mir-bg-accent text-white rounded-[20px] rounded-tr-[6px]": isUser,
            "bg-mir-bg-input rounded-[20px] rounded-tl-[6px]": !isUser,
          })}
        >
          {content}
        </div>
      </div>
      <div className={cn("message-time", " text-xs text-mir-text-secondary mt-2 text-center font-medium")}>2:34 PM</div>
    </div>
  );
};

export default OpenChatMessageBubble;
