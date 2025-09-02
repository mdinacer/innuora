import React from "react";

import { cn } from "@/lib/utils";
import { MessageOfType } from "@/types/flow-chat-messages.types";
import FlowChatMessageHeader from "../flow-chat.message-header";

interface Props {
  message: MessageOfType<"text">;
}

const FlowChatTextMessage: React.FC<Props> = ({ message }) => {
  return (
    <>
      <FlowChatMessageHeader isAccent={false} secondaryContent="Mirael" />
      <p className={cn("card-content", "mb-4")}>{message.content}</p>
    </>
  );
};

export default FlowChatTextMessage;
