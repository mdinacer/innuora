import React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DiagnosticCognitiveDistortion } from "@/lib/zod/advanced-diagnostic.schema";

const MAX_VISIBLE_ITEMS = 1;

interface Props {
  className?: string;
  distortion: DiagnosticCognitiveDistortion;
  messages?: string[];
  severityClassName?: string;
}

const DiagnosticDistortionCard: React.FC<Props> = ({ distortion, messages = [], severityClassName }) => {
  const [collapsed, setCollapsed] = React.useState(true);
  const { title, description, severity, frequency } = distortion;
  return (
    <div className="rounded-xl flex flex-col border border-border bg-muted p-4">
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          <Badge className={cn("capitalize", severityClassName)} variant="destructive">
            {severity}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
        <div className="text-xs text-muted-foreground mb-3">
          <div className="font-semibold mb-1">Session Excerpts:</div>
          <ol className=" list-decimal list-inside space-y-3">
            {messages.map((item, index) => (
              <li className={cn("list-item", collapsed && index + 1 > MAX_VISIBLE_ITEMS ? "hidden" : "")} key={index}>
                {item}
              </li>
            ))}
          </ol>
          {messages.length > MAX_VISIBLE_ITEMS && (
            <div className="flex items-center justify-end py-2 px-4">
              <button
                className=" text-muted-foreground hover:text-foreground transition"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? "Show more" : "Show less"}
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--text-secondary)]">Frequency</span>
        <span className="font-semibold">{frequency} occurrences</span>
      </div>
    </div>
  );
};

export default DiagnosticDistortionCard;
