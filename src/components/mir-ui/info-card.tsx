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
  description?: string;
}

const InfoCard: React.FC<Props> = ({ className, icon: Icon, title, value, classNames, description }) => {
  return (
    <div className={cn("bg-inn-bg-card border border-inn-border-light rounded-2xl p-4", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("size-4 text-inn-bg-accent", classNames?.icon)} />
        <span className={cn("text-sm font-medium text-inn-text-secondary", classNames?.title)}>{title}</span>
      </div>
      <div className={cn("text-xl font-bold", classNames?.value)}>{value}</div>
      {description && <div className="text-xs text-inn-text-secondary">{description}</div>}
    </div>
  );
};

export default InfoCard;
