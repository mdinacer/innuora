import ChatUIMenu from "@/components/chat-ui/chat-ui.menu";
import ChatUIThemeToggle from "@/components/chat-ui/chat-ui.theme-toggle";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

const ChatUIHeader: React.FC<Props> = ({ className }) => {
  const { title, subtitle } = {
    title: "Mirael",
    subtitle: "Your emotional mirror",
  };
  return (
    <div className={cn("chat-header", "p-6  pb-4 flex items-center justify-between relative z-[20]", className)}>
      <div className={cn("header-left", "flex items-center gap-4")}>
        <div
          className={cn(
            "ai-avatar",
            "size-12 flex items-center justify-center",
            "bg-mir-bg-accent",
            "rounded-2xl text-xl font-semibold",
            "text-white"
          )}
        >
          M
        </div>
        <div className="header-info">
          <h1 className=" text-mir-text-primary font-bold mb-0.5 -tracking-[0.5px]">{title}</h1>
          <p className="text-mir-text-secondary text-base">{subtitle}</p>
        </div>
      </div>
      <div className={cn("header-actions ", "flex items-center gap-3")}>
        <ChatUIThemeToggle />
        <ChatUIMenu />
      </div>
    </div>
  );
};

export default ChatUIHeader;
