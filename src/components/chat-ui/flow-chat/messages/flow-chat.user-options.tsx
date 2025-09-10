"use client";

import React, { useCallback, useMemo, useState } from "react";
import { CheckIcon, ChevronDownIcon, ListCheckIcon, ListChecksIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import FlowChatMessageHeader from "@/components/chat-ui/flow-chat/flow-chat.message-header";
import { cn } from "@/lib/utils";
import { MessageOfType } from "@/types/flow-chat-messages.types";
import { UserOption } from "@/types/flow-session.types";

interface OptionItemProps {
  option: UserOption;
  isSelected: boolean;
  isVisible: boolean;
  className?: string;
  isDisabled?: boolean;
  onClick: () => void;
}

const OptionItem = ({ className, option, isSelected, isVisible, isDisabled, onClick }: OptionItemProps) => {
  const { label, description } = option;
  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "option-item w-full p-4 mb-2 rounded-[12px] text-base cursor-pointer",
        "ltr:text-left rtl:text-right",
        "border border-mir-border-light bg-mir-bg-input",
        "bg-mir-bg-card transition-all duration-200 ease-in-out",
        "hover:not-disabled:border-mir-bg-accent hover:not-disabled:bg-mir-bg-card",
        isVisible ? "block animate-fade-in" : "hidden",
        {
          "border-mir-bg-accent bg-mir-bg-card text-mir-bg-accent shadow-[0_0_0_1px] shadow-mir-bg-accent": isSelected,
        },
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <div className="option-content flex-1">
        <div className="w-full flex items-center justify-between">
          <div className="option-label font-semibold leading-[1.3]">{label}</div>
          <div
            className={cn(
              "option-checkbox",
              "size-5  border-2 border-mir-border-light",
              "flex items-center justify-center",
              "rounded-full shrink-0",
              "transition-all duration-200 ease-in",

              {
                "border-mir-bg-accent bg-mir-bg-accent ": isSelected,
              }
            )}
          >
            <CheckIcon className="size-3 shrink-0 text-white" />
          </div>
        </div>
        {description && (
          <div
            className={cn(
              "option-description",
              "text-sm rtl:text-lg  mt-1 leading-[1.4]",
              isSelected ? "text-mir-bg-accent/70" : "text-mir-text-secondary"
            )}
          >
            {description}
          </div>
        )}
      </div>
    </button>
  );
};

interface Props {
  message: MessageOfType<"options">;
  onUserSelect: (key: string, selection: UserOption | UserOption[]) => void;
}

const FlowChatUserOptions: React.FC<Props> = ({ message, onUserSelect }) => {
  const { t } = useTranslation("common", { keyPrefix: "actions" });
  const [isCollapsed, setCollapsed] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<UserOption[]>([]);
  const { mode, label, hint, maxSelected, options, key } = message.content;
  const modeText = mode === "single" ? "Select One" : "Select Multiple";

  const handleUserSelect = useCallback(() => {
    if (mode === "single") {
      onUserSelect(key, selectedOptions[0]);
    } else {
      onUserSelect(key, selectedOptions);
    }
  }, [key, mode, onUserSelect, selectedOptions]);

  const handleOptionSelect = useCallback(
    (option: UserOption) => {
      if (mode === "single") {
        setSelectedOptions([option]);
      } else {
        setSelectedOptions((prevSelected) => {
          if (prevSelected.some((o) => o.value === option.value)) {
            return prevSelected.filter((o) => o.value !== option.value);
          } else {
            return [...prevSelected, option];
          }
        });
      }
    },
    [mode]
  );

  const selectedSet = useMemo(() => new Set(selectedOptions.map((o) => o.value)), [selectedOptions]);

  const getItemState = useCallback(
    (option: UserOption, index: number) => ({
      isSelected: selectedSet.has(option.value),
      isVisible: !isCollapsed || index < 4,
      isDisabled:
        mode === "multiple" && !!maxSelected && selectedOptions.length >= maxSelected && !selectedSet.has(option.value),
    }),
    [isCollapsed, maxSelected, mode, selectedOptions.length, selectedSet]
  );

  return (
    <>
      <FlowChatMessageHeader
        isAccent={true}
        primaryContent={mode === "multiple" ? <ListChecksIcon /> : <ListCheckIcon />}
        secondaryContent={modeText}
      />

      <h3
        className={cn("card-title", " text-2xl font-bold text-mir-text-primary mb-2 leading-[1.3] -tracking-[0.3px]")}
      >
        {label}
      </h3>
      <div className="option-list mb-4">
        {options.map((option, index) => {
          const { isDisabled, isSelected, isVisible } = getItemState(option, index);
          return (
            <OptionItem
              isDisabled={isDisabled}
              isVisible={isVisible}
              isSelected={isSelected}
              option={option}
              key={index}
              onClick={() => handleOptionSelect(option)}
            />
          );
        })}
      </div>
      {options.length > 4 && (
        <div className="show-more-container text-center mt-3 mb-4 animate-pulse">
          <button
            className={cn(
              "show-more-btn",
              "bg-transparent border border-mir-border-light",
              "py-2 px-4 rounded-2xl text-sm rtl:text-base rtl:font-arabic-body font-medium cursor-pointer",
              "transition-all duration-200 ease-in-out",
              " inline-flex items-center gap-1.5",
              "hover:border-mir-bg-accent hover:text-mir-bg-accent"
            )}
            onClick={() => setCollapsed((prev) => !prev)}
          >
            <span>{isCollapsed ? t("showMoreWithCount", { count: options.length - 4 }) : t("showLess")}</span>
            <ChevronDownIcon className={cn("size-3.5", { "rotate-180": !isCollapsed })} />
          </button>
        </div>
      )}
      <div className="input-hint mb-4 text-mir-text-primary/70">{hint}</div>

      <button
        className={cn(
          "action-btn primary",
          "w-full py-3.5 px-5 rounded-[12px] border-none font-semibold cursor-pointer",
          "transition-all duration-200 ease-in-out",
          "bg-mir-bg-accent text-white",
          "hover:bg-[#ff5a4a]",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        disabled={!selectedOptions.length}
        onClick={handleUserSelect}
      >
        {t("continue")}
      </button>
    </>
  );
};

export default FlowChatUserOptions;
