"use client";

import React from "react";
import { ChevronRightIcon, GraduationCapIcon } from "lucide-react";
import Markdown from "markdown-to-jsx";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { AppMessage, AppMessageVariant } from "@/types/flow-chat-messages.types";
import FlowChatMessageHeader from "../flow-chat.message-header";

interface Props {
  message: AppMessage & { variant: typeof AppMessageVariant.PARAGRAPHS };
  isDisabled?: boolean;
  onMoveToNextStep: () => void;
}

const FlowChatParagraphs: React.FC<Props> = ({ message, isDisabled = false, onMoveToNextStep }) => {
  const { t } = useTranslation("common");
  const { title, subtitle, paragraphs, buttonText } = message.content;
  return (
    <>
      <FlowChatMessageHeader
        isAccent={false}
        secondaryContent={t("guide")}
        primaryContent={<GraduationCapIcon className="size-6 shrink-0" />}
      />
      <h3 className={cn("card-title", "text-2xl font-bold text-foreground mb-2 leading-[1.3] -tracking-[0.3px]")}>
        {title}
      </h3>
      <p className={"mb-4 text-foreground/70"}>{subtitle}</p>
      {paragraphs.map((paragraph, index) => (
        <div
          key={index}
          className="leading-7 rtl:leading-loose tracking-normal rtl:text-lg [&>ol]:list-inside [&>ol]:list-decimal [&>ul]:list-inside [&>ul]:list-disc mb-4 last:mb-0"
        >
          <Markdown options={{ forceBlock: true, disableParsingRawHTML: true }}>{paragraph}</Markdown>
        </div>
      ))}

      {!isDisabled && buttonText && (
        <button
          onClick={onMoveToNextStep}
          className={
            "mt-4 ltr:ml-auto rtl:mr-auto flex items-center gap-1.5 text-primary text-base rtl:text-lg font-semibold cursor-pointer bg-none border-none p-0"
          }
        >
          <span>{buttonText}</span>
          <ChevronRightIcon className="size-4 shrink-0 rtl:rotate-180" />
        </button>
      )}
    </>
  );
};

export default FlowChatParagraphs;
