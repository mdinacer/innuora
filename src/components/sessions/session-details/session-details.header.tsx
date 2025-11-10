import React, { useState } from "react";
import { format, formatDuration, intervalToDuration } from "date-fns";
import {
  ArrowDownIcon,
  ClockIcon,
  CoinsIcon,
  MessageSquareTextIcon,
  PencilIcon,
  TextIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { generateSessionTitle } from "@/app/actions/session-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { Session } from "@/domains/open-chat/open-chat.types";
import { CreditUtils } from "@/lib/credits/credit-config";
import { AppLocales, FNS_LOCALES_MAP } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import SessionNamingDialog from "../session-naming-dialog";

interface Props {
  className?: string;
  session: Session;
}

interface MetricCardProps {
  icon: LucideIcon;
  title: string;
  value: React.ReactNode;
  description?: string;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, title, value, description, className }) => (
  <Card className={cn("px-6 py-4 gap-2", className)}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className="size-4 text-primary" />
      <span className="text-sm font-medium text-muted-foreground">{title}</span>
    </div>
    <div className="text-xl font-bold">{value}</div>
    {description && <p className="text-xs text-muted-foreground">{description}</p>}
  </Card>
);

const SessionDetailsHeader: React.FC<Props> = ({ className, session }) => {
  const [sessionData, setSessionData] = useState({
    title: session.title,
    subtitle: session.subtitle,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isGenerating, setGenerating] = useState(false);
  const {
    t,
    i18n: { language },
  } = useTranslation("pages/session_details", { keyPrefix: "session_details.header" });

  const { cards, actions } = {
    actions: {
      generateTitle: t("actions.generate_title"),
      edit: t("actions.edit"),
    },
    cards: t("cards", { returnObjects: true }) as Record<
      "messages" | "credits" | "created" | "updated" | "duration",
      { title: string; description: string }
    >,
  };

  const fnsLocale = FNS_LOCALES_MAP[language as AppLocales];
  const { createdAt, updatedAt } = session;

  const handleGenerateTitle = async () => {
    setGenerating(true);
    try {
      const messages = session.messages.slice(-6);
      const result = await generateSessionTitle(session.id, messages, language as AppLocales);
      useSessionStore.getState().updateSession(session.id, {
        title: result.response.title,
        subtitle: result.response.subtitle,
        updatedAt: new Date(),
      });
      setSessionData({
        title: result.response.title,
        subtitle: result.response.subtitle,
      });
      setGenerating(false);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-center gap-x-6 mb-6">
        <div className="w-12 hidden md:flex h-12 shrink-0 rounded-full bg-muted border border-primary/25  items-center justify-center">
          <TextIcon className="size-6 text-primary" />
        </div>
        <div>
          <h1
            id="sessionTitle"
            className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight cursor-pointer hover:text-primary transition"
          >
            {sessionData.title}
          </h1>

          <p
            id="sessionSubtitle"
            className="text-lg text-muted-foreground cursor-pointer hover:text-foreground transition"
          >
            {sessionData.subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-x-4 justify-end w-full">
        <SessionNamingDialog session={session} onSubmitted={setSessionData} />

        <Button size={"sm"} variant={"outline"} onClick={handleGenerateTitle}>
          <PencilIcon className="size-4 shrink-0" />
          <span className="sr-only md:not-sr-only">{actions.edit}</span>
        </Button>
      </div>
      <div className="fex items-center mb-6"></div>

      {/* <!-- Session Meta Info --> */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          icon={MessageSquareTextIcon}
          title={cards.messages.title}
          value={session.metadata?.messageCount ?? 0}
        />
        <MetricCard
          icon={CoinsIcon}
          title={cards.credits.title}
          value={CreditUtils.formatCreditsForDisplay(session.metadata?.creditsUsed ?? 0)}
        />
        <MetricCard
          className="md:col-span-1 col-span-2"
          icon={ClockIcon}
          title={cards.duration.title}
          value={formatDuration(intervalToDuration({ start: 0, end: session.metadata?.activeDurationMs ?? 0 }), {
            format: ["hours", "minutes", "seconds"],
          })}
        />
      </div>

      {/* <!-- Session Timestamps --> */}
      <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-2">
          <ArrowDownIcon className="size-4" />
          <span>
            {cards.created.title} {format(new Date(createdAt), "PPPp", { locale: fnsLocale })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <PencilIcon className="size-4" />
          <span>
            {cards.updated.title} {format(new Date(updatedAt), "PPPp", { locale: fnsLocale })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionDetailsHeader;
