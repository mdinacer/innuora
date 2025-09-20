"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SendIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { CreditsBalance } from "@/components/credits";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  isLoading?: boolean;
  onSendMessage: (value: string) => void;
  userId?: string;
}

const OpenChatInput: React.FC<Props> = ({ className, isLoading = false, onSendMessage, userId }) => {
  const { t } = useTranslation("pages", { keyPrefix: "chat-ui.open-chat.input" });

  const { label, placeholder, actionTitle } = useMemo(
    () => ({
      label: t("label"),
      placeholder: t("placeholder"),
      actionTitle: t("actionTitle"),
    }),
    [t]
  );
  const [inputValue, setInputValue] = useState("");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = useCallback(() => {
    onSendMessage(inputValue);
    setInputValue("");
  }, [inputValue, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
  }, [inputValue]);

  const isDisabled = inputValue.length === 0 || isLoading;

  return (
    <div className={cn("p-6 pt-0 bg-mir-bg-card/50 backdrop-blur-lg backdrop-saturate-150", className)}>
      <div
        className={cn(
          "flex gap-3 items-center",
          "bg-mir-bg-input",
          "rounded-3xl p-1",
          "transition-all duration-300 ease-in-out",
          "focus-within:bg-mir-border-light",
          "rtl:pl-4 ltr:pr-4"
        )}
      >
        <textarea
          ref={inputRef}
          className={cn(
            "flex-1 bg-transparent border-none focus:outline-none py-3.5 px-4",
            "resize-none min-h-6 max-h-[100px] leading-6 placeholder:text-mir-text-secondary"
          )}
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={label}
          placeholder={placeholder}
          aria-placeholder={placeholder}
        />
        <button
          onClick={handleSendMessage}
          disabled={isDisabled}
          type="button"
          aria-label={actionTitle}
          title={actionTitle}
          className={cn(
            "size-10 border-none rounded-full flex items-center justify-center",
            "bg-mir-bg-accent",
            "cursor-pointer transition-all duration-300 ease-in-out shrink-0",
            "hover:not-disabled:scale-105 hover:not-disabled:shadow-[0_4px_12px] shadow-mir-bg-accent/40",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          )}
        >
          <SendIcon className="size-[18px] text-white shrink-0" />
        </button>
      </div>

      {/* General Cost Context */}
      {userId && (
        <div className="mt-2 px-4">
          <div className="text-xs text-mir-text-secondary opacity-75 flex items-center gap-2">
            <span>Affordable therapeutic support</span>
            <span>•</span>
            <CreditsBalance userId={userId} className="inline" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenChatInput;
