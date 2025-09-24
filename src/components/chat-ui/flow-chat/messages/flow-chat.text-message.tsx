import React from "react";

import FlowChatMessageHeader from "@/components/chat-ui/flow-chat/flow-chat.message-header";
import { APP_CONFIG } from "@/config/app";
import { cn } from "@/lib/utils";
import { MessageOfType } from "@/types/flow-chat-messages.types";

interface Props {
  message: MessageOfType<"text">;
}

const FlowChatTextMessage: React.FC<Props> = ({ message }) => {
  return (
    <>
      <FlowChatMessageHeader isAccent={false} secondaryContent={APP_CONFIG.name} />
      <p className={cn("card-content", "mb-4")}>{message.content}</p>
    </>
  );
};

export default FlowChatTextMessage;
