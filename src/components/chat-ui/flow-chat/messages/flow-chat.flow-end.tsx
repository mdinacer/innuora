import React from "react";
import { PartyPopperIcon } from "lucide-react";

import FlowChatMessageHeader from "@/components/chat-ui/flow-chat/flow-chat.message-header";
import { cn } from "@/lib/utils";
import { MessageOfType } from "@/types/flow-chat-messages.types";

interface Props {
  message: MessageOfType<"flow_end">;
  isDisabled?: boolean;
  onAction: (actionType: "primary" | "secondary") => void;
}

const FlowChatEnd: React.FC<Props> = ({ message, isDisabled = false, onAction }) => {
  const { title, message: closureMessage, primaryAction, secondaryAction } = message.content;
  return (
    <>
      <FlowChatMessageHeader
        isAccent={false}
        secondaryContent="Complete"
        primaryContent={<PartyPopperIcon className="size-6 shrink-0" />}
      />
      <h3 className={cn("card-title", " text-2xl font-bold  mb-2 leading-[1.3] -tracking-[0.3px]")}>{title}</h3>
      <p className={cn("card-content", "mb-4")}>{closureMessage}</p>
      <div className="action-buttons flex flex-col gap-4">
        <button
          disabled={isDisabled}
          onClick={() => onAction("primary")}
          className={cn(
            "action-btn primary",
            "disabled:opacity-70 disabled:cursor-not-allowed",
            "w-full py-3.5 px-5 rounded-[12px] border-none font-semibold cursor-pointer",
            "transition-all duration-200 ease-in-out",
            "bg-white text-inn-bg-accent",
            "not-disabled:hover:bg-white/80",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {primaryAction}
        </button>
        {secondaryAction && (
          <button
            disabled={isDisabled}
            onClick={() => onAction("secondary")}
            className={cn(
              "action-btn primary",
              "disabled:opacity-70 disabled:cursor-not-allowed",
              "w-full py-3.5 px-5 rounded-[12px] font-semibold cursor-pointer",
              "transition-all duration-200 ease-in-out",
              "bg-transparent text-white border border-white",
              "not-disabled:hover:bg-white/10"
            )}
          >
            {secondaryAction}
          </button>
        )}
      </div>
    </>
  );
};

export default FlowChatEnd;
