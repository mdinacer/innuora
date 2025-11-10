import React, { useState } from "react";
import { PartyPopperIcon } from "lucide-react";
import Markdown from "markdown-to-jsx";
import { useTranslation } from "react-i18next";

import FlowChatMessageHeader from "@/components/chat-ui/flow-chat/flow-chat.message-header";
import { cn } from "@/lib/utils";
import { AppMessage, AppMessageVariant } from "@/types/flow-chat-messages.types";

interface Props {
  message: AppMessage & { variant: typeof AppMessageVariant.END };
  isCurrentStep?: boolean;
  onAction: (actionType: "primary" | "secondary") => Promise<void>;
}

const FlowChatEnd: React.FC<Props> = ({ message, isCurrentStep = false, onAction }) => {
  const { t } = useTranslation("common");
  const [busy, setBusy] = useState(false);
  const isActionClickedRef = React.useRef(false);
  const { title, message: closureMessage, primaryAction, secondaryAction } = message.content;

  const handleOnAction = async (actionType: "primary" | "secondary") => {
    setBusy(true);
    await onAction(actionType);
    setBusy(false);
    isActionClickedRef.current = true;
  };
  return (
    <>
      <FlowChatMessageHeader
        isAccent={false}
        secondaryContent={t("finished")}
        primaryContent={<PartyPopperIcon className="size-6 shrink-0" />}
      />
      <h3 className={cn("card-title", " text-2xl font-bold  mb-2 leading-[1.3] -tracking-[0.3px]")}>{title}</h3>
      <div className={cn("card-content", "mb-4")}>
        <Markdown options={{ forceBlock: true, disableParsingRawHTML: true }}>{closureMessage}</Markdown>
      </div>
      {isCurrentStep && (
        <div className="action-buttons flex flex-col gap-4">
          <button
            disabled={busy || isActionClickedRef.current}
            onClick={() => handleOnAction("primary")}
            className={cn(
              "action-btn primary",
              "disabled:opacity-70 disabled:cursor-not-allowed",
              "w-full py-3.5 px-5 rounded-[12px] border-none font-semibold cursor-pointer",
              "transition-all duration-200 ease-in-out",
              "bg-white text-primary",
              "not-disabled:hover:bg-white/80",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {primaryAction}
          </button>
          {secondaryAction && (
            <button
              disabled={busy || isActionClickedRef.current}
              onClick={() => handleOnAction("secondary")}
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
      )}
    </>
  );
};

export default FlowChatEnd;
