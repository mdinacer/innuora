"use client";

import React from "react";
import { ChevronRightIcon, GraduationCapIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import { MessageOfType } from "@/types/flow-chat-messages.types";
import FlowChatMessageHeader from "../flow-chat.message-header";

interface Props {
  message: MessageOfType<"paragraphs">;
  isDisabled?: boolean;
  onMoveToNextStep: () => void;
}

const FlowChatParagraphs: React.FC<Props> = ({ message, isDisabled = false, onMoveToNextStep }) => {
  const { title, subtitle, paragraphs, buttonText } = message.content;
  return (
    <>
      <p>{isDisabled ? "Disabled" : "Enabled"}</p>
      <FlowChatMessageHeader
        isAccent={false}
        secondaryContent="Mirael"
        primaryContent={<GraduationCapIcon className="size-6 shrink-0" />}
      />
      <h3
        className={cn("card-title", " text-2xl font-bold text-mir-text-primary mb-2 leading-[1.3] -tracking-[0.3px]")}
      >
        {title}
      </h3>
      <p className={"mb-4 text-mir-text-primary/70"}>{subtitle}</p>
      {paragraphs.map((paragraph, index) => (
        <div
          key={index}
          className="leading-7 tracking-normal rtl:text-lg [&>ol]:list-inside [&>ol]:list-decimal [&>p:not(:last-child)]:my-2 [&>ul]:list-inside [&>ul]:list-disc"
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            allowedElements={["p", "strong", "em", "a", "ul", "ol", "li", "br", "del", "u"]}
          >
            {paragraph}
          </ReactMarkdown>
        </div>
      ))}

      {!isDisabled && buttonText && (
        <button
          onClick={onMoveToNextStep}
          className={
            "mt-4 ltr:ml-auto rtl:mr-auto flex items-center gap-1.5 text-mir-bg-accent text-base rtl:text-lg font-semibold cursor-pointer bg-none border-none p-0"
          }
        >
          <span>{buttonText}</span>
          <ChevronRightIcon className="size-4 shrink-0" />
        </button>
      )}
    </>
  );
};

export default FlowChatParagraphs;
