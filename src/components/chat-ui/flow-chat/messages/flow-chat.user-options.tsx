"use client";

import React, { useCallback, useMemo, useState } from "react";
import { CheckIcon, ChevronDownIcon, ListCheckIcon, ListChecksIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import FlowChatMessageHeader from "@/components/chat-ui/flow-chat/flow-chat.message-header";
import { cn } from "@/lib/utils";
import { AppMessage, AppMessageVariant } from "@/types/flow-chat-messages.types";
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
        "border border-border bg-secondary",
        "bg-card transition-all duration-200 ease-in-out",
        "hover:not-disabled:border-primary hover:not-disabled:bg-card",
        isVisible ? "block animate-fade-in" : "hidden",
        {
          "border-primary bg-card text-primary shadow-[0_0_0_1px] shadow-xl": isSelected,
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
              "size-5  border-2 border-border",
              "flex items-center justify-center",
              "rounded-full shrink-0",
              "transition-all duration-200 ease-in",

              {
                "border-primary bg-primary ": isSelected,
              }
            )}
            role="checkbox"
            aria-checked={isSelected}
            aria-hidden="true"
          >
            <CheckIcon className="size-3 shrink-0 text-white" />
          </div>
        </div>
        {description && (
          <div
            className={cn(
              "option-description",
              "text-sm rtl:text-lg  mt-1 leading-[1.4]",
              isSelected ? "text-primary/70" : "text-muted-foreground"
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
  message: AppMessage & { variant: typeof AppMessageVariant.SELECT };
  isCurrentStep?: boolean;
  onUserSelect: (key: string, selection: UserOption | UserOption[]) => void;
}

const FlowChatUserOptions: React.FC<Props> = ({ message, isCurrentStep, onUserSelect }) => {
  const { t } = useTranslation("common");
  const [isCollapsed, setCollapsed] = useState(true);
  const [selectedOptions, setSelectedOptions] = useState<UserOption[]>([]);
  const { mode, label, hint, maxSelected, options, key } = message.content;
  const modeText = t(mode === "single" ? "select_single" : "select_multiple");

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

  if (!isCurrentStep) {
    return label;
  }

  return (
    <>
      <FlowChatMessageHeader
        isAccent={true}
        primaryContent={mode === "multiple" ? <ListChecksIcon /> : <ListCheckIcon />}
        secondaryContent={modeText}
      />

      <h3 className={cn("card-title", "text-2xl font-bold text-foreground mb-2 leading-[1.3] -tracking-[0.3px]")}>
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
              "bg-muted border border-border",
              "py-2 px-4 rounded-2xl text-sm rtl:text-base rtl:font-arabic-body font-medium cursor-pointer",
              "transition-all duration-200 ease-in-out",
              "inline-flex items-center gap-1.5",
              "hover:border-accent hover:text-accent"
            )}
            onClick={() => setCollapsed((prev) => !prev)}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? "Show more options" : "Show fewer options"}
          >
            <span>
              {isCollapsed ? t("showMore", { keyPrefix: "actions" }) : t("showLess", { keyPrefix: "actions" })}
            </span>
            <ChevronDownIcon className={cn("size-3.5", { "rotate-180": !isCollapsed })} aria-hidden="true" />
          </button>
        </div>
      )}
      <div className="input-hint mb-4 text-foreground/70">{hint}</div>

      <button
        className={cn(
          "action-btn primary",
          "w-full py-3.5 px-5 rounded-[12px] border-none font-semibold cursor-pointer",
          "transition-all duration-200 ease-in-out",
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        disabled={!selectedOptions.length}
        onClick={handleUserSelect}
      >
        {t("continue", { keyPrefix: "actions" })}
      </button>
    </>
  );
};

export default FlowChatUserOptions;
