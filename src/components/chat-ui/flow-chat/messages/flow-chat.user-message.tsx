import React from "react";

import { cn } from "@/lib/utils";
import { MessageOfType } from "@/types/flow-chat-messages.types";

interface Props {
  message: MessageOfType<"user_message">;
}

const FlowChatUserMessage: React.FC<Props> = ({ message }) => {
  return <p className={cn("card-content", "text-base rtl:text-lg")}>{message.content}</p>;
};

export default FlowChatUserMessage;
