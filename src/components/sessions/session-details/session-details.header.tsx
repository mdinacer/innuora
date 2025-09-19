import React from "react";
import { format } from "date-fns";
import { ArrowDownIcon, CoinsIcon, MessageSquareTextIcon, PencilIcon, TextIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import InfoCard from "@/components/mir-ui/info-card";
import { Session } from "@/domains/open-chat/open-chat.types";
import { AppLocales, FNS_LOCALES_MAP } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  session: Session;
}

const SessionDetailsHeader: React.FC<Props> = ({ className, session }) => {
  const {
    i18n: { language },
  } = useTranslation(["pages"], { keyPrefix: "sessions" });

  const fnsLocale = FNS_LOCALES_MAP[language as AppLocales];
  const { title, subtitle, createdAt, updatedAt } = session;
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-center gap-x-6 mb-6">
        <div className="w-12 hidden md:flex h-12 shrink-0 rounded-full bg-mir-bg-soft border border-mir-bg-accent/25  items-center justify-center">
          <TextIcon className="size-6 text-mir-bg-accent" />
        </div>
        <div>
          <h1
            id="sessionTitle"
            className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight cursor-pointer hover:text-mir-bg-accent transition"
          >
            {title}
          </h1>

          <p
            id="sessionSubtitle"
            className="text-lg text-mir-text-secondary cursor-pointer hover:text-mir-text-primary transition"
          >
            {subtitle}
          </p>
        </div>
      </div>
      <div className="fex items-center mb-6"></div>

      {/* <!-- Session Meta Info --> */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6">
        <InfoCard
          icon={MessageSquareTextIcon}
          title="Messages"
          value={session.metadata?.messageCount ?? 0}
          classNames={{ icon: "text-mir-bg-accent" }}
        />
        <InfoCard
          icon={CoinsIcon}
          title="Points"
          value={session.metadata?.tokenCount ?? 0}
          classNames={{ icon: "text-mir-bg-accent" }}
        />
      </div>

      {/* <!-- Session Timestamps --> */}
      <div className="flex flex-col sm:flex-row gap-4 text-sm text-mir-text-secondary mb-6">
        <div className="flex items-center gap-2">
          <ArrowDownIcon className="size-4" />
          <span>Created: {format(new Date(createdAt), "PPPp", { locale: fnsLocale })}</span>
        </div>
        <div className="flex items-center gap-2">
          <PencilIcon className="size-4" />
          <span>Last updated: {format(new Date(updatedAt), "PPPp", { locale: fnsLocale })}</span>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsHeader;
