import React from "react";
import { ChevronRightIcon, GraduationCapIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { MessageOfType } from "@/types/flow-chat-messages.types";
import FlowChatMessageHeader from "../flow-chat.message-header";

interface Props {
  message: MessageOfType<"paragraphs">;
}

const FlowChatParagraphs: React.FC<Props> = ({ message }) => {
  const { title, subtitle, paragraphs, buttonText } = message.content;
  return (
    <>
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
        <p key={index} className={cn("card-content", "mb-4")}>
          {paragraph}
        </p>
      ))}

      {buttonText && (
        <button
          className={
            "mt-4 flex items-center gap-1.5 text-mir-bg-accent text-base rtl:text-lg font-semibold cursor-pointer bg-none border-none p-0"
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
