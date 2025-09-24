import { ChevronRightIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

export interface FlowChatHeroProps {
  title: string;
  subtitle: string;
  paragraphs: string[];
  buttonText: string;
}

interface Props {
  data: FlowChatHeroProps;
  onStartSession: () => void;
}

const FlowChatHeroCard = (props: Props) => {
  const { title, subtitle, paragraphs, buttonText } = props.data;
  return (
    <div
      className={cn(
        "hero-card z-10",
        " bg-inn-bg-card rounded-3xl py-8 px-7 mb-6 relative overflow-hidden shrink-0",
        "border border-inn-border-light",
        "shadow-[0_4px_20px] shadow-black/5",
        "animate-slide-in-up opacity-0"
      )}
    >
      <div
        className={cn(
          "hero-decoration",
          "absolute -top-[30px] -right-[30px] size-[120px]",
          "bg-inn-bg-accent rounded-full opacity-10",
          "after:content-[''] after:absolute after:bg-inn-bg-accent",
          "after:top-[60px] after:left-[60px] after:size-[40px] after:rounded-full after:opacity-60"
        )}
      ></div>
      <div className={cn("hero-content", "relative z-[2]")}>
        <h2
          className={cn("hero-title", "text-2xl font-bold text-inn-text-primary leading-[1.2] -tracking-[0.5px] mb-3")}
        >
          {title}
        </h2>
        <p className={cn("hero-subtitle", "text-base text-inn-text-primary/70 leading-[1.5] mb-5 ")}>{subtitle}</p>
        <div className={cn("hero-paragraphs", "my-5")}>
          {paragraphs?.map((paragraph, index) => (
            <div
              key={index}
              className="leading-7 tracking-normal rtl:text-lg [&>ol]:list-inside [&>ol]:list-decimal [&>p:not(:last-child)]:my-3 [&>ul]:list-inside [&>ul]:list-disc"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                allowedElements={["p", "strong", "em", "a", "ul", "ol", "li", "br", "del", "u"]}
              >
                {paragraph}
              </ReactMarkdown>
            </div>
          ))}
        </div>
        <button
          onClick={props.onStartSession}
          className={cn(
            "hero-action",
            "flex  ltr:flex-row  items-center gap-2",
            "text-inn-bg-accent font-semibold",
            "cursor-pointer bg-none",
            "border-none p-0",
            "ltr:ml-auto rtl:mr-auto"
          )}
        >
          <span>{buttonText}</span>

          <ChevronRightIcon className="size-4 shrink-0 ltr:rotate-0 rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
};

export default FlowChatHeroCard;
