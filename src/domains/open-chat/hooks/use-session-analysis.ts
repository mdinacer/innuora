import { useCallback, useState } from "react";

import { useSessionState } from "@/domains/open-chat/hooks/use-session.state";
import { SessionSummary } from "@/domains/open-chat/open-chat.types";
import { SessionSummarySchema } from "@/domains/session-analysis/session-analysis.types";
import { combineToSessionAnalysis } from "@/domains/session-analysis/session-analysis.utils";
import { getSessionSummary } from "@/domains/session-summary/session-summary.action";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
import { parseJsonObject } from "@/lib/utils/parse-json";
import { useAppUserStore } from "@/stores/app-user.store";

export default function useSessionAnalysis({ sessionId, locale = "en" }: { sessionId: string; locale?: AppLocales }) {
  const { session, addTokenUsage, addCreditsUsed, updateSession } = useSessionState({ sessionId });
  const appUser = useAppUserStore((state) => state.user);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const summarizeSession = useCallback(async () => {
    setAnalysisError(null);

    if (!session) {
      const error = "No session available for analysis";
      logger.logWarning(error, {
        operation: "session_analysis_no_session",
        sessionId,
      });
      setAnalysisError(error);
      return { error };
    }

    if (!session.memoryStore) {
      const error = "Session memory store is empty";
      logger.logWarning(error, {
        operation: "session_analysis_no_memory",
        sessionId,
      });
      setAnalysisError(error);
      return { error };
    }

    if (!session.analysisSnapshots.length) {
      const error = "No analysis snapshots available";
      setAnalysisError(error);
      return { error };
    }

    setIsAnalyzing(true);

    try {
      const sessionAnalysis = combineToSessionAnalysis(session.analysisSnapshots);

      if (!sessionAnalysis) {
        const error = "Failed to combine analysis snapshots";
        setAnalysisError(error);
        return { error };
      }

      const result = await getSessionSummary(sessionAnalysis, session.memoryStore, locale, appUser?.authId, sessionId);

      // Unwrap ActionResult
      if (result.error) {
        const error = `AI analysis failed: ${result.error.message}`;
        setAnalysisError(error);
        return { error };
      }

      const aiResponse = result.data;
      if (!aiResponse) {
        const error = "AI analysis failed - no response received";
        setAnalysisError(error);
        return { error };
      }

      // Track token usage (credits already deducted in action)
      if (aiResponse.tokenUsage) {
        addTokenUsage({ ...aiResponse.tokenUsage, type: "summary" });
      }

      // Track credits used in session metadata
      if (aiResponse.creditsUsed > 0) {
        addCreditsUsed(aiResponse.creditsUsed);
      }

      if (!aiResponse.summary) {
        const error = "AI analysis returned empty response";
        setAnalysisError(error);
        return { error };
      }

      let parsedJSON;
      try {
        parsedJSON = parseJsonObject(aiResponse.summary);
      } catch {
        const error = "Invalid JSON in analysis result";

        setAnalysisError(error);
        return { error };
      }

      const parsedData = SessionSummarySchema.safeParse(parsedJSON);
      if (!parsedData.success) {
        const error = "Analysis result doesn't match expected format";

        setAnalysisError(error);
        return { error };
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

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      setAnalysisError(`Analysis failed: ${message}`);
      return { error: message };
    } finally {
      setIsAnalyzing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addTokenUsage, locale, session, updateSession]);

  return {
    summarizeSession,
    isAnalyzing,
    analysisError,
  };
}
