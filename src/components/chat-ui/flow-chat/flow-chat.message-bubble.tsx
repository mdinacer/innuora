import React from "react";

import { cn } from "@/lib/utils";

interface Props extends React.PropsWithChildren {
  className?: string;
}

const FlowChatMessageBubble: React.FC<Props> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "max-w-[95%] min-w-[40%] rounded-[20px]",
        "animate-slide-in-up delay-200 opacity-0",
        "mb-[56px] p-6 border border-mir-border-light",
        "shadow-[0_2px_12px] shadow-black/5",
        className
      )}
    >
      {children}
    </div>
  );
};

export default FlowChatMessageBubble;
