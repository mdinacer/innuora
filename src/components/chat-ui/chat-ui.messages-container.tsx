import React, { forwardRef } from "react";

import { cn } from "@/lib/utils";

interface MessagesContainerProps extends React.PropsWithChildren {
  className?: string;
}

const ChatUIMessagesContainer = forwardRef<HTMLDivElement, MessagesContainerProps>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "chat-messages",
        "flex-1 overflow-y-auto px-6 py-6 scroll-smooth",
        "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent scrollbar-thumb-rounded-sm",
        className
      )}
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {children}
    </div>
  );
});

ChatUIMessagesContainer.displayName = "OpenChatMessagesContainer";

export default ChatUIMessagesContainer;
