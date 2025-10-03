import React from "react";

import FlowChatMessageHeader from "@/components/chat-ui/flow-chat/flow-chat.message-header";
import { APP_CONFIG } from "@/config/app";
import { AppMessage, AppMessageVariant } from "@/types/flow-chat-messages.types";

interface Props {
  message: AppMessage & { variant: typeof AppMessageVariant.TEXT };
}

const FlowChatTextMessage: React.FC<Props> = ({ message }) => {
  return (
    <>
      <FlowChatMessageHeader isAccent={false} secondaryContent={APP_CONFIG.name} />
      <p className={"mb-4"}>{message.content}</p>
    </>
  );
};

export default FlowChatTextMessage;
