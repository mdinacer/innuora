import React, { useMemo } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronRightIcon,
  CloudIcon,
  InfoIcon,
  MessageSquareTextIcon,
  MonitorSmartphoneIcon,
  TextIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { SessionOverview } from "@/domains/open-chat/open-chat.types";
import { AppLocales } from "@/lib/i18n";
import { fnsLocalesMap } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type SessionCardProps = {
  session: SessionOverview;
};

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("pages", { keyPrefix: "sessions.card" });

  const isOnCloud = session.persistOnCloud; //useSessionStore((state) => state.onlineSessionIds.includes(session.id));
  const updatesData = undefined; //useSessionStore((state) => state.changesMap[session.id]) as SessionChangeState | undefined;

  const fnsLocale = fnsLocalesMap[language as AppLocales];

  const publicId = useMemo(() => {
    return useSessionStore.getState().getSessionPublicId(session.id);
  }, [session.id]);

  const {
    cloud,
    local,
    messages,
    hasUpdates,
    continue: continueText,
  } = {
    cloud: t("cloud"),
    local: t("local"),
    messages: t("messages"),
    hasUpdates: t("hasUpdates"),
    continue: t("continue"),
  };

  return (
    <div
      role="group"
      aria-labelledby={`session-title-${session.id}`}
      className={cn(
        "w-full group",
        "bg-inn-bg-card border border-inn-border-light/30 rounded-3xl overflow-hidden",
        "flex flex-col",
        "sm:backdrop-blur-xs sm:backdrop-saturate-200 sm:bg-inn-bg-card/30",
        "hover:border-inn-bg-accent/30 hover:-translate-y-0.5",
        "transition-all duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-inn-bg-accent"
      )}
    >
      {updatesData && (
        <div role="status" aria-live="polite" className="sr-only">
          {hasUpdates}
        </div>
      )}

      {/* Header with session type */}
      <div className="min-h-1/5 p-6 pb-0 w-full flex items-start justify-between">
        <div className="bg-gradient-to-br from-inn-bg-accent to-[#ff8a7a] size-12 flex items-center justify-center shrink-0 rounded-2xl">
          <TextIcon className="size-6 shrink-0" aria-hidden="true" />
        </div>

        <div className="flex items-center gap-x-4">
          <div
            className={cn(
              "inline-flex items-center h-[30px] w-[34px] sm:w-auto border gap-x-2 text-sm px-2 py-1 rounded-lg",
              isOnCloud
                ? "border-inn-bg-accent/20 bg-inn-bg-soft text-inn-bg-accent"
                : "bg-inn-bg-input border-inn-border-light"
            )}
            aria-label={isOnCloud ? cloud : local} // screen reader text
          >
            {isOnCloud ? (
              <CloudIcon className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <MonitorSmartphoneIcon className="size-4 shrink-0" aria-hidden="true" />
            )}
            <span className="rtl:mt-0.5 sr-only sm:not-sr-only">{isOnCloud ? cloud : local}</span>
          </div>

          <div
            className="inline-flex items-center border gap-x-2 text-sm px-2 py-1 rounded-lg bg-inn-bg-input border-inn-border-light text-inn-text-secondary"
            aria-label={`${session.metadata.messageCount} ${messages}`}
          >
            <MessageSquareTextIcon className="size-4 shrink-0" aria-hidden="true" />
            <span className="rtl:mt-0.5 sr-only sm:not-sr-only">{messages} </span>
            <span className="tabular-nums font-sans font-semibold">{session.metadata.messageCount}</span>
          </div>

          <Link
            href={`/sessions/${publicId}/details`}
            className="inline-flex aspect-square items-center border border-transparent gap-x-2 text-sm p-1 rounded-lg hover:bg-inn-bg-input hover:border-inn-border-light text-inn-text-secondary hover:text-inn-bg-accent"
            aria-label={`${continueText} details`}
          >
            <InfoIcon className="size-5 shrink-0" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* Session title and subtitle */}
      <div className="flex-1 px-6 py-6 flex flex-col gap-2">
        <h3
          id={`session-title-${session.id}`}
          className="font-bold text-inn-text-primary group-hover:text-inn-bg-accent transition-colors duration-300 leading-tight"
        >
          {session.title}
        </h3>
        <p
          className={cn(
            "text-inn-text-secondary leading-relaxed text-base rtl:text-base line-clamp-2",
            "group-hover:text-opacity-80 transition-all duration-300"
          )}
        >
          {session.subtitle}
        </p>
      </div>

      {/* Bottom actions */}
      <div className="min-h-1/5 p-6 pt-4 border-t border-inn-border-light/30 flex items-center justify-between">
        <Link
          href={`/sessions/${publicId || session.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-inn-bg-accent text-white font-medium text-sm hover:shadow-[0_4px_20px] hover:shadow-black/10 hover:scale-105 transition-all"
          aria-label={`${continueText} to session`}
        >
          <ChevronRightIcon className="size-3.5 shrink-0 rtl:rotate-180" aria-hidden="true" />
          <span className="rtl:mt-0.5">{continueText}</span>
        </Link>

        <div>
          <div
            className="text-xs rtl:text-base rtl:font-arabic-body text-inn-text-secondary font-medium"
            aria-label={`Last updated ${formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true, locale: fnsLocale })}`}
          >
            {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true, locale: fnsLocale })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
