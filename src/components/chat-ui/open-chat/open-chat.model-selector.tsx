"use client";

import React, { useMemo } from "react";
import { ChevronDownIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModelCode, MODELS_CODES } from "@/domains/ai-conversation/ai-models";
import { cn } from "@/lib/utils";

type ModelType = "standard" | "professional";

const MODELS_MAP = {
  standard: MODELS_CODES.M1,
  professional: MODELS_CODES.M2,
  [MODELS_CODES.M1]: "standard",
  [MODELS_CODES.M2]: "professional",
};

interface Props {
  className?: string;
  defaultModel?: ModelCode;
  onModelSelect: (model: ModelCode) => void;
}

const OpenChatModelSelector: React.FC<Props> = ({ className, defaultModel = MODELS_CODES.M1, onModelSelect }) => {
  const { t } = useTranslation("pages", { keyPrefix: "chat-ui.open-chat" });
  const [model, setModel] = React.useState<ModelType>(MODELS_MAP[defaultModel as keyof typeof MODELS_MAP] as ModelType);

  const data = useMemo(
    () =>
      ({
        standard: {
          label: t("models.standard.label"),
          description: t("models.standard.description"),
        },
        professional: {
          label: t("models.professional.label"),
          description: t("models.professional.description"),
        },
      }) as Record<ModelType, { label: string; description: string }>,
    [t]
  );

  const handleModelSelect = (model: ModelType) => {
    setModel(model);
    onModelSelect(MODELS_MAP[model] as ModelCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "model-toggle",
            "bg-inn-bg-input border-none rounded-[12px] py-2 px-3 cursor-pointer",
            "flex items-center justify-between gap-2 text-sm font-medium text-inn-text-primary min-w-[200px]",
            "transition-all duration-200 ease-in",
            "hover:bg-inn-border-light",
            className
          )}
        >
          <div className="flex items-center gap-1.5">
            <div className="size-5 shrink-0 rounded-full bg-inn-bg-accent flex items-center justify-center text-sm font-bold text-white">
              {data[model].label.slice(0, 1)}
            </div>

            <span id="selectedModelName">Standard</span>
          </div>

          <ChevronDownIcon className="size-3 text-inn-text-secondary transition-all duration-200 ease-in" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          "model-dropdown",
          "bg-inn-bg-card border border-inn-border-light rounded-2xl shadow-[0_4px_20px] shadow-black/8",
          "overflow-hidden min-w-[260px] max-w-80 p-0"
        )}
        align="start"
      >
        {Array.from<ModelType>(["standard", "professional"]).map((value) => {
          const isSelected = model === value;
          return (
            <DropdownMenuItem
              key={value}
              className={cn(
                "gap-3 p-4 cursor-pointer",
                "border-none bg-none w-full ltr:text-left rtl:text-right",
                "transition-all duration-200 ease-in",
                "border-b border-b-inn-border-light last:border-b-0",
                "hover:!bg-inn-bg-input",
                "first:rounded-b-none last:rounded-t-none",
                {
                  "bg-inn-bg-accent text-white": isSelected,
                }
              )}
              onClick={() => handleModelSelect(value)}
            >
              <div className="model-option-content flex-1">
                <div
                  className={cn(
                    "model-option-title font-semibold",
                    isSelected ? "text-white" : "text-inn-text-primary"
                  )}
                >
                  {data[value].label}
                </div>
                <div className={cn("model-option-desc text-sm", isSelected ? "text-white" : "text-muted-foreground")}>
                  {data[value].description}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OpenChatModelSelector;
