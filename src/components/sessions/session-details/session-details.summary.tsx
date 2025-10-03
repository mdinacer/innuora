import React, { useCallback, useState } from "react";
import { format } from "date-fns";
import { ArrowDownIcon, FileTextIcon } from "lucide-react";
import Markdown from "markdown-to-jsx";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/mir-ui/button";
import Card from "@/components/mir-ui/card";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { updateStoreSession } from "@/domains/encrypted-session/encrypted-session.utils";
import { Session } from "@/domains/open-chat/open-chat.types";
import { getSessionSummary } from "@/domains/session-summary/session-summary.action";
import { AppLocales, FNS_LOCALES_MAP } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
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
    if (!aggregatedAnalysis || !memoryStore) return;

    const state = useSessionStore.getState();

    try {
      let summaryText: string | undefined;
      let title: string | undefined;
      let subtitle: string | undefined;

      if (aggregatedAnalysis && memoryStore) {
        const result = await getSessionSummary(aggregatedAnalysis, memoryStore, language as AppLocales);

        if (result.error) {
          logger.logWarning("Failed to get session summary", {
            operation: "session_summary_fetch_failed",
            sessionId: session.id,
            metadata: { error: result.error.message },
          });
          return;
        }

        if (result.data.summary) {
          const data = (await parseJsonObject(result.data.summary)) as {
            title: string;
            subtitle: string;
            summary: string;
          };
          summaryText = data.summary;
          title = data.title;
          subtitle = data.subtitle;
        }
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
      logger.logWarning("Failed to generate session summary", {
        operation: "session_summary_generation_failed",
        sessionId: session.id,
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          messageCount: session.messages.length,
        },
      });
    }
  }, [aggregatedAnalysis, continuitySummary, language, memoryStore, messages, session]);
  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileTextIcon className="size-5 text-inn-bg-accent" />
          <h2 className="text-xl font-bold">Session Summary</h2>
        </div>
        {!summary && !continuitySummary && aggregatedAnalysis && memoryStore && (
          <Button variant={"outline"} onClick={handleGenerateSummary}>
            Generate Summary
          </Button>
        )}
      </div>

      {!continuitySummary && !summary && (!aggregatedAnalysis || !memoryStore) && (
        <div className="text-inn-text-secondary text-sm p-4 bg-inn-bg-secondary rounded-lg">
          <p>
            Session summaries are available after you've had some conversation rounds with analysis and memory
            collection.
          </p>
          <p className="mt-2">Continue chatting to build up session context for summary generation.</p>
        </div>
      )}

      {continuitySummary && (
        <>
          <div className="leading-7 mb-4 rtl:leading-loose tracking-normal rtl:text-lg [&>ol]:list-inside [&>ol]:list-decimal [&>ul]:list-inside [&>ul]:list-disc">
            <Markdown options={{ forceBlock: true, disableParsingRawHTML: true }}>{summary || ""}</Markdown>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 text-sm text-inn-text-secondary mb-6">
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
