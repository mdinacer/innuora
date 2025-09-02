import { ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const FlowChatHeroCard = () => {
  const { title, subtitle, paragraphs, buttonText } = {
    title: "Welcome To Your Emotional Journey",
    subtitle: "I'm here to help you slow down, reflect, and gain clarity on what you're truly feeling.",
    paragraphs: [
      "This is a safe space for emotional exploration and healing.",
      "Take your time and be honest with yourself as we work together.",
    ],
    buttonText: "Begin reflection",
  };
  return (
    <div
      className={cn(
        "hero-card z-10",
        " bg-mir-bg-card rounded-3xl py-8 px-7 mb-6 relative overflow-hidden shrink-0",
        "border border-mir-border-light",
        "shadow-[0_4px_20px] shadow-black/5",
        "animate-slide-in-up opacity-0"
      )}
    >
      <div
        className={cn(
          "hero-decoration",
          "absolute -top-[30px] -right-[30px] size-[120px]",
          "bg-mir-bg-accent rounded-full opacity-10",
          "after:content-[''] after:absolute after:bg-mir-bg-accent",
          "after:top-[60px] after:left-[60px] after:size-[40px] after:rounded-full after:opacity-60"
        )}
      ></div>
      <div className={cn("hero-content", "relative z-[2]")}>
        <h2
          className={cn("hero-title", "text-2xl font-bold text-mir-text-primary leading-[1.2] -tracking-[0.5px] mb-3")}
        >
          {title}
        </h2>
        <p className={cn("hero-subtitle", "text-base text-mir-text-primary/70 leading-[1.5] mb-5 ")}>{subtitle}</p>
        <div className={cn("hero-paragraphs", "my-5")}>
          {paragraphs.map((paragraph, index) => (
            <p className="text-mir-text-primary/70 leading-[1.5] mb-3" key={index}>
              {paragraph}
            </p>
          ))}
        </div>
        <button
          className={cn(
            "hero-action",
            "flex items-center gap-2",
            "text-mir-bg-accent font-semibold",
            "cursor-pointer bg-none",
            "border-none p-0"
          )}
        >
          <span>{buttonText}</span>

          <ChevronRightIcon className="size-4 shrink-0" />
        </button>
      </div>
    </div>
  );
};

export default FlowChatHeroCard;
