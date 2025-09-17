import React from "react";
import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  classNames?: {
    icon?: string;
    title?: string;
    value?: string;
  };

  icon: LucideIcon;
  title: string;
  value: React.ReactNode;
}

const InfoCard: React.FC<Props> = ({ className, icon: Icon, title, value, classNames }) => {
  return (
    <div className={cn("bg-mir-bg-card border border-mir-border-light rounded-2xl p-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("size-4 text-mir-bg-accent", classNames?.icon)} />
        <span className={cn("text-sm font-medium text-mir-text-secondary", classNames?.title)}>{title}</span>
      </div>
      <span className={cn("text-xl font-bold", classNames?.value)}>{value}</span>
    </div>
  );
};

export default InfoCard;
