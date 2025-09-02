import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  isVisible: boolean;
}

const OpenChatIndicator: React.FC<Props> = ({ className, isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className={cn("typing-indicator", "items-center flex gap-3 mb-6 opacity-0", "animate-slide-in-up", className)}>
      <div
        className={cn(
          "message-avatar",
          "size-9 rounded-lg flex items-center justify-center",
          "text-sm font-semibold shrink-0"
        )}
      >
        M
      </div>
      <div
        className={cn(
          "typing-bubble",
          "py-4 px-5 rounded-[20px] rounded-bl-[6px]",
          "bg-mir-bg-input",
          "flex gap-1 items-center"
        )}
      >
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "typing-dot",
              "size-2 bg-mir-text-secondary rounded-full",
              "animate-typing-bounce nth-[2]:delay-[0.2s] nth-[3]:delay-[0.4s]"
            )}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default OpenChatIndicator;
