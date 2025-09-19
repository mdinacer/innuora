import React, { useCallback, useState } from "react";
import { format } from "date-fns";
import { ArrowDownIcon, FileTextIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/mir-ui/button";
import Card from "@/components/mir-ui/card";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { updateStoreSession } from "@/domains/encrypted-session/encrypted-session.utils";
import { Session } from "@/domains/open-chat/open-chat.types";
import { getSessionMessagesSummary, getSessionSummary } from "@/domains/session-summary/session-summary.action";
import { AppLocales, FNS_LOCALES_MAP } from "@/lib/i18n";
import { parseJsonObject } from "@/lib/utils/parse-json";

interface Props {
  className?: string;
  session: Session;
}

const SessionDetailsSummary: React.FC<Props> = ({ className, session }) => {
  const {
    i18n: { language },
  } = useTranslation("session");

  const fnsLocale = FNS_LOCALES_MAP[language as AppLocales];

  const [summary, setSummary] = useState<string | null>(session.continuitySummary?.text ?? null);
  const { continuitySummary, aggregatedAnalysis, messages, memoryStore } = session;

  const handleGenerateSummary = useCallback(async () => {
    if (continuitySummary) return;

    const state = useSessionStore.getState();

    try {
      let summaryText: string | undefined;
      let title: string | undefined;
      let subtitle: string | undefined;

      if (aggregatedAnalysis && memoryStore) {
        const result = await getSessionSummary(aggregatedAnalysis, memoryStore, language as AppLocales);
        if (result.message) {
          const data = (await parseJsonObject(result.message)) as { title: string; subtitle: string; summary: string };
          summaryText = data.summary;
          title = data.title;
          subtitle = data.subtitle;
        }
      } else if (messages.length > 0) {
        const result = await getSessionMessagesSummary(messages, undefined, language as AppLocales);
        summaryText = result.message;
      }

      if (!summaryText) return;

      setSummary(summaryText);

      await updateStoreSession(
        session.id,
        {
          ...session,
          ...(title && subtitle && session.autoUpdateTitle ? { title, subtitle } : {}),
          continuitySummary: { text: summaryText, updatedAt: new Date(), lastMessageIndex: messages.length - 1 },
        },
        state
      );
    } catch (error) {
      console.error("Failed to generate session summary:", error);
    }
  }, [aggregatedAnalysis, continuitySummary, language, memoryStore, messages, session]);
  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileTextIcon className="size-5 text-mir-bg-accent" />
          <h2 className="text-xl font-bold">Session Summary</h2>
        </div>
        {!summary && !continuitySummary && (
          <Button variant={"outline"} onClick={handleGenerateSummary}>
            Generate Summary
          </Button>
        )}
      </div>
      {continuitySummary && (
        <>
          <div className="leading-7 mb-4 rtl:leading-loose tracking-normal rtl:text-lg [&>ol]:list-inside [&>ol]:list-decimal [&>ul]:list-inside [&>ul]:list-disc">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              allowedElements={["p", "strong", "em", "a", "ul", "ol", "li", "br", "del", "u"]}
            >
              {summary}
            </ReactMarkdown>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 text-sm text-mir-text-secondary mb-6">
            <div className="flex items-center gap-2">
              <ArrowDownIcon className="size-4" />
              <span>Created: {format(new Date(continuitySummary?.updatedAt), "PPPp", { locale: fnsLocale })}</span>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default SessionDetailsSummary;
