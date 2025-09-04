import React from "react";

import { cn } from "@/lib/utils";
import { MessageOfType } from "@/types/flow-chat-messages.types";

interface Props {
  message: MessageOfType<"user_message">;
}

const FlowChatUserMessage: React.FC<Props> = ({ message }) => {
  return Array.isArray(message.content) ? (
    <ul className=" list-disc list-inside">
      {message.content.map((item, index) => (
        <li key={index} className={"text-base rtl:text-lg list-item"}>
          {item}
        </li>
      ))}
    </ul>
  ) : (
    <p className={cn("card-content", "text-base rtl:text-lg")}>{message.content}</p>
  );
};

export default FlowChatUserMessage;
