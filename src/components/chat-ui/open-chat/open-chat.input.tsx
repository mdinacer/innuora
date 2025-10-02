"use client";

import React, { useEffect, useState } from "react";
import { SendIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  isLoading?: boolean;
  onSendMessage: (value: string) => void;
}

const OpenChatInput: React.FC<Props> = ({ className, isLoading = false, onSendMessage }) => {
  const { t } = useTranslation("pages", { keyPrefix: "chat-ui.open-chat.input" });

  const [inputValue, setInputValue] = useState("");
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    onSendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
  }, [inputValue]);

  const isDisabled = inputValue.length === 0 || isLoading;

  return (
    <div className={cn("p-6 pt-0 bg-inn-bg-card/50 backdrop-blur-lg backdrop-saturate-150", className)}>
      <div
        className={cn(
          "flex gap-3 items-center",
          "bg-inn-bg-input",
          "rounded-3xl p-1",
          "transition-all duration-300 ease-in-out",
          "focus-within:bg-inn-border-light",
          "rtl:pl-4 ltr:pr-4"
        )}
      >
        <textarea
          ref={inputRef}
          className={cn(
            "flex-1 bg-transparent border-none focus:outline-none py-3.5 px-4",
            "resize-none min-h-6 max-h-[100px] leading-6 placeholder:text-inn-text-secondary"
          )}
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label={t("label")}
          placeholder={t("placeholder")}
          aria-placeholder={t("placeholder")}
        />
        <button
          onClick={handleSendMessage}
          disabled={isDisabled}
          type="button"
          aria-label={t("actionTitle")}
          title={t("actionTitle")}
          className={cn(
            "size-10 border-none rounded-full flex items-center justify-center",
            "bg-inn-bg-accent",
            "cursor-pointer transition-all duration-300 ease-in-out shrink-0",
            "hover:not-disabled:scale-105 hover:not-disabled:shadow-[0_4px_12px] shadow-inn-bg-accent/40",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          )}
        >
          <SendIcon className="size-[18px] text-white shrink-0" />
        </button>
      </div>
    </div>
  );
};

export default OpenChatInput;
