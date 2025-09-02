import React from "react";
import { BrainIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { MessageOfType } from "@/types/flow-chat-messages.types";
import FlowChatMessageHeader from "../flow-chat.message-header";

interface Props {
  message: MessageOfType<"reflection">;
}

const FlowChatReflection: React.FC<Props> = ({ message }) => {
  const { title, reflection, error = "This is an error" } = message.content;
  return (
    <>
      <FlowChatMessageHeader
        isAccent={false}
        secondaryContent="Reflection"
        primaryContent={<BrainIcon className="size-6 shrink-0" />}
      />
      <h3 className={cn("card-title", " text-2xl font-bold  mb-2 leading-[1.3] -tracking-[0.3px]")}>{title}</h3>
      <p className={cn("card-content", "mb-4")}>{reflection}</p>
      {error && <p className={"mb-4 text-mir-bg-accent text-base font-medium"}>{error}</p>}
    </>
  );
};

export default FlowChatReflection;
