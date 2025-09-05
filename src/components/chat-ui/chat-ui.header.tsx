"use client";

import { useTranslation } from "react-i18next";

import ChatUIThemeToggle from "@/components/chat-ui/chat-ui.theme-toggle";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
}

const ChatUIHeader: React.FC<Props> = ({ className, title, subtitle, headerActions }) => {
  const { t } = useTranslation("common");
  const defaultData = {
    title: t("chat-headers.default-session.title", { defaultValue: "Mirael" }),
    subtitle: t("chat-headers.default-session.subtitle", { defaultValue: "Your emotional mirror" }),
    avatarLetter: t("avatar-letter", { defaultValue: "M" }),
  };
  return (
    <div className={cn("chat-header", "p-6  pb-4 flex items-center justify-between relative z-[20]", className)}>
      <div className={cn("header-left", "flex items-center gap-4")}>
        <div
          className={cn(
            "rtl:font-arabic rtl:leading-4",
            "size-12 flex items-center justify-center",
            "bg-mir-bg-accent",
            "rounded-2xl text-xl font-semibold ",
            "text-white"
          )}
        >
          <span className="rtl:-translate-y-1">{defaultData.avatarLetter}</span>
        </div>
        <div className="header-info">
          <h1 className=" text-mir-text-primary rtl:text-lg rtl:mt-1 font-bold rtl:font-arabic mb-0.5 -tracking-[0.5px]">
            {title || defaultData.title}
          </h1>
          <p className="text-mir-text-secondary text-sm">{subtitle || defaultData.subtitle}</p>
        </div>
      </div>
      <div className={cn("header-actions ", "flex items-center gap-3")}>
        <ChatUIThemeToggle />
        {headerActions}
      </div>
    </div>
  );
};

export default ChatUIHeader;
