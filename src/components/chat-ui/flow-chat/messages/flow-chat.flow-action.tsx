"use client";

import React from "react";
import { SplitIcon } from "lucide-react";

import FlowChatMessageHeader from "@/components/chat-ui/flow-chat/flow-chat.message-header";
import { cn } from "@/lib/utils";
import { MessageOfType } from "@/types/flow-chat-messages.types";

interface Props {
  message: MessageOfType<"action">;
  isDisabled?: boolean;
  onUserAction: (actionType: "primary" | "secondary", nextStepId: string) => void;
}

const FlowChatAction: React.FC<Props> = ({ message, isDisabled = false, onUserAction }) => {
  const { prompt, primary, secondary } = message.content;

  return (
    <>
      <FlowChatMessageHeader
        isAccent={true}
        primaryContent={<SplitIcon className="size-6 shrink-0" />}
        secondaryContent="Choose Action"
      />

      <h3 className={"text-2xl font-bold  mb-2 leading-[1.3] -tracking-[0.3px]"}>Decision Point</h3>

      <p className=" mb-5 leading-[1.5] text-[15px]">{prompt}</p>
      <div className="action-buttons flex flex-col gap-4">
        <button
          disabled={isDisabled}
          onClick={() => onUserAction("primary", primary.nextStepId)}
          className={cn(
            "action-btn primary",
            "disabled:opacity-70 disabled:cursor-not-allowed",
            "w-full py-3.5 px-5 rounded-[12px] border-none font-semibold cursor-pointer",
            "transition-all duration-200 ease-in-out",
            "bg-mir-bg-accent text-white",
            "hover:bg-mir-bg-accent-dark",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {primary.label}
        </button>
        {secondary && (
          <button
            disabled={isDisabled}
            onClick={() => onUserAction("secondary", secondary.nextStepId)}
            className={cn(
              "action-btn primary",
              "disabled:opacity-70 disabled:cursor-not-allowed",
              "w-full py-3.5 px-5 rounded-[12px] font-semibold cursor-pointer",
              "transition-all duration-200 ease-in-out",
              "bg-transparent text-white border border-white",
              "not-disabled:hover:bg-white/10"
            )}
          >
            {secondary.label}
          </button>
        )}
      </div>
    </>
  );
};

export default FlowChatAction;
