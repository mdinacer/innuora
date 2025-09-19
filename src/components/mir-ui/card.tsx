import React from "react";

import { cn } from "@/lib/utils";

interface Props extends React.PropsWithChildren {
  className?: string;
}
const Card: React.FC<Props> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "bg-mir-bg-card border border-mir-border-light rounded-2xl p-6 shadow-[0_2px_8px] shadow-black/5",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
