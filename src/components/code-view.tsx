import React from "react";

import { cn } from "@/lib/utils";

interface CodeViewProps {
  data: unknown;
  className?: string;
}

const CodeView: React.FC<CodeViewProps> = ({ data, className }) => {
  return (
    <div
      dir="ltr"
      className={cn(
        "max-h-[80vh] max-w-md overflow-y-auto rounded-lg transition-all duration-700",
        "bg-primary text-primary-foreground p-4 text-left font-mono",
        "scale-50 hover:scale-100 origin-top-left",

        className
      )}
    >
      <code className="text-start whitespace-pre">{JSON.stringify(data, null, 2)}</code>
    </div>
  );
};

export default CodeView;
