"use client";

import React, { useCallback, useState } from "react";
import { PencilLineIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import FlowChatMessageHeader from "@/components/chat-ui/flow-chat/flow-chat.message-header";
import { cn } from "@/lib/utils";
import { AppMessage, AppMessageVariant } from "@/types/flow-chat-messages.types";

interface Props {
  message: AppMessage & { variant: typeof AppMessageVariant.INPUT };
  isCurrentStep?: boolean;
  onUserInput: (key: string, value: string) => void;
}

const FlowChatUserInput: React.FC<Props> = ({ message, isCurrentStep = false, onUserInput }) => {
  const { t } = useTranslation("common");

  const [inputValue, setInputValue] = useState<string>("");

  const { label, placeholder, hint, charLimit = 255, key } = message.content;

  const handleUserInput = useCallback(() => {
    onUserInput(key, inputValue);
    setInputValue("");
  }, [inputValue, key, onUserInput]);

  const handleOnKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleUserInput();
      }
    },
    [handleUserInput]
  );

  return (
    <>
      {isCurrentStep ? (
        <>
          <FlowChatMessageHeader
            isAccent={true}
            primaryContent={<PencilLineIcon className="size-6 shrink-0" />}
            secondaryContent={t("your_turn")}
          />
          <h3
            className={cn(
              "card-title",
              " text-2xl font-bold text-inn-text-primary mb-2 leading-[1.3] -tracking-[0.3px]"
            )}
          >
            {label}
          </h3>
          <div className="my-4">
            <textarea
              className={cn(
                "input-field",
                " w-full bg-inn-bg-card min-h-20 max-h-28",
                "border border-inn-border-light rounded-[12px]",
                "py-3 px-4 resize-y mb-3",
                "transition-all duration-300 ease-in",
                "focus:outline-none focus:border-inn-bg-accent focus:shadow-[0_0_0_3px] focus:shadow-inn-bg-accent/10",
                "placeholder:text-inn-text-secondary"
              )}
              placeholder={placeholder}
              maxLength={charLimit}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleOnKeyDown}
            />
            <div className="char-counter text-right text-xs text-inn-text-secondary mb-3">0/{charLimit}</div>
            <div className="input-hint mb-3 text-inn-text-primary/70">{hint}</div>
            <button
              disabled={inputValue.length === 0}
              onClick={handleUserInput}
              className={cn(
                "action-btn primary",
                "w-full  py-3 px-4 rounded-[12px]",
                "font-semibold cursor-pointer border-none",
                "transition-all duration-200 ease-in",
                "text-white bg-inn-bg-accent",
                "hover:-translate-y-[1px]",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {t("continue", { keyPrefix: "actions" })}
            </button>
          </div>
        </>
      ) : (
        label
      )}
    </>
  );
};

export default FlowChatUserInput;
