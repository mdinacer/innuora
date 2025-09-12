import { useCallback } from "react";

import { SessionSummary } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { useChatSessionState } from "@/lib/ai/mirael-core/v2/open-chat/use-session.state";
import { getSessionSummary } from "@/lib/ai/mirael-core/v2/session-analysis/session-analysis.action";
import { SessionSummarySchema } from "@/lib/ai/mirael-core/v2/session-analysis/session-analysis.types";
import { combineToSessionAnalysis } from "@/lib/ai/mirael-core/v2/session-analysis/session-analysis.utils";
import { parseJsonObject } from "@/lib/ai/shared/parse-json";
import { AppLocales } from "@/lib/i18n";

export default function useSessionAnalysis({ sessionId, locale = "en" }: { sessionId: string; locale?: AppLocales }) {
  const { session, addTokenUsage, updateSession } = useChatSessionState({ sessionId });

  const summarizeSession = useCallback(async () => {
    if (!session || !session.memoryStore || !session.analysisSnapshots.length) return;

    try {
      const sessionAnalysis = combineToSessionAnalysis(session.analysisSnapshots);
      const result = await getSessionSummary(sessionAnalysis, session.memoryStore, locale);

      if (result.modelTokenUsage) {
        addTokenUsage({ ...result.modelTokenUsage, type: "summary" });
      }

      let parsedJSON;
      try {
        parsedJSON = parseJsonObject(result.message);
      } catch (err) {
        console.error("Invalid JSON in summary result:", result.message, err);
        return;
      }

      const parsedData = SessionSummarySchema.safeParse(parsedJSON);
      if (!parsedData.success) {
        console.error("Invalid SessionSummary:", parsedData.error.format());
        return;
      }

      const { title, subtitle, summary } = parsedData.data;

      if (summary?.trim()) {
        const sessionSummary: SessionSummary = {
          text: summary.trim(),
          updatedAt: new Date(),
          lastMessageIndex: session.messages.length - 1,
        };
        updateSession((prev) => ({
          ...prev,
          continuitySummary: sessionSummary,
        }));
      }

      if (title || subtitle) {
        updateSession((prev) => ({
          ...prev,
          title: title ?? prev.title,
          subtitle: subtitle ?? prev.subtitle,
        }));
      }
    } catch (error) {
      console.error("Error generating session summary:", error);
    }
  }, [addTokenUsage, locale, session, updateSession]);

  return {
    summarizeSession,
  };
}
