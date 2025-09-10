import React from "react";
import Markdown from "react-markdown";

import { cn } from "@/lib/utils";

interface CodeViewProps {
  data: unknown;
  className?: string;
  isMarkdown?: boolean;
}

const CodeView: React.FC<CodeViewProps> = ({ data, className, isMarkdown = false }) => {
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
      {isMarkdown ? (
        <code className=" whitespace-pre leading-7 tracking-normal rtl:text-lg [&>ol]:list-inside [&>ol]:list-decimal [&>p:not(:last-child)]:my-2 [&>ul]:list-inside [&>ul]:list-disc">
          <Markdown allowedElements={["p", "strong", "em", "a", "ul", "ol", "li", "br", "del", "u"]}>
            {JSON.stringify(data, null, 2)}
          </Markdown>
        </code>
      ) : (
        <code className="text-start whitespace-pre">{JSON.stringify(data, null, 2)}</code>
      )}
    </div>
  );
};

export default CodeView;
