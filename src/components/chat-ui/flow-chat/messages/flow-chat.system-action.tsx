import React from "react";
import { ActivityIcon } from "lucide-react";

import FlowChatMessageHeader from "@/components/chat-ui/flow-chat/flow-chat.message-header";
import { MessageOfType } from "@/types/flow-chat-messages.types";

interface Props {
  message: MessageOfType<"system">;
}

const FlowChatSystemAction: React.FC<Props> = ({ message }) => {
  const { title, message: actionMessage } = message.content;
  return (
    <>
      <FlowChatMessageHeader
        isAccent={false}
        secondaryContent="System"
        primaryContent={<ActivityIcon className="size-6 shrink-0" />}
      />
      {message.id}
      <h3 className={"text-2xl font-bold text-mir-text-primary mb-2 leading-[1.3] -tracking-[0.3px]"}>
        {title || "Processing State"}
      </h3>
      <div className="flex items-center gap-3 text-white/70">
        <div className="loading-spinner size-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin repeat-infinite"></div>
        <span>{actionMessage || "Processing your reflection..."}</span>
      </div>
    </>
  );
};

export default FlowChatSystemAction;
