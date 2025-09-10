import React from "react";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  isAccent?: boolean;
  primaryContent?: React.ReactNode;
  secondaryContent?: React.ReactNode;
}
const FlowChatMessageHeader: React.FC<Props> = ({ className, isAccent = false, primaryContent, secondaryContent }) => {
  return (
    <div className={cn("card-header", "flex items-start justify-between mb-4", className)}>
      <div
        className={cn(
          "card-number ",
          "text-[64px] font-extrabold leading-[0.8] -tracking-[2px]",
          isAccent ? "text-white" : "text-inherit"
        )}
      >
        {primaryContent}
      </div>
      <div
        className={cn(
          "card-meta",
          "text-right text-sm  rtl:font-arabic rtl:text-base rtl:font-semibold",
          isAccent ? " text-white/70" : "text-inherit opacity-70"
        )}
      >
        {secondaryContent}
      </div>
    </div>
  );
};

export default FlowChatMessageHeader;
