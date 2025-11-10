import React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DiagnosticTheme } from "@/lib/zod/advanced-diagnostic.schema";

interface Props {
  className?: string;
  theme: DiagnosticTheme;
  severityClassName?: string;
  trajectoryClassName?: string;
}

const DiagnosticThemeCard: React.FC<Props> = ({ theme, severityClassName, trajectoryClassName }) => {
  const { title, description, severity, trajectory, evidence } = theme;
  return (
    <div className="rounded-xl border border-border bg-muted p-4">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex gap-2">
          <Badge className={cn("capitalize", severityClassName)} variant="destructive">
            {severity}
          </Badge>
          <Badge className={cn("capitalize", trajectoryClassName)} variant="info">
            {trajectory}
          </Badge>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div className="text-sm text-muted-foreground">
        <div className="font-semibold mb-1">Evidence:</div>
        <ul className="list-disc list-inside space-y-0.5">
          {evidence.map((item, index) => (
            <li className="list-item" key={index}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DiagnosticThemeCard;
