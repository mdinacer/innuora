import { useCallback } from "react";

import { SessionSummary } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { useChatSessionState } from "@/lib/ai/mirael-core/v2/open-chat/use-session.state";
import { getSessionSummary } from "@/lib/ai/mirael-core/v2/session-analysis/session-analysis.action";
import { SessionSummarySchema } from "@/lib/ai/mirael-core/v2/session-analysis/session-analysis.types";
import { combineToSessionAnalysis } from "@/lib/ai/mirael-core/v2/session-analysis/session-analysis.utils";
import { parseJsonObject } from "@/lib/ai/shared/parse-json";
import { AppLocales } from "@/lib/i18n";
import { useSessionServices } from "@/lib/points/simple-points";

export default function useSessionAnalysis({ sessionId, locale = "en" }: { sessionId: string; locale?: AppLocales }) {
  const { session, addTokenUsage, updateSession } = useChatSessionState({ sessionId });
  const { requestSessionAnalysis, canAffordService } = useSessionServices();

  const summarizeSession = useCallback(async () => {
    if (!session || !session.memoryStore || !session.analysisSnapshots.length) return;

    // Check if user can afford session analysis
    const affordabilityCheck = canAffordService("session_analysis");
    if (!affordabilityCheck.canAfford) {
      console.warn("Cannot afford session analysis:", affordabilityCheck.reason);
      return { error: "Insufficient points for session analysis", cost: affordabilityCheck.cost };
    }

    try {
      // Consume points for session analysis
      const pointsResult = await requestSessionAnalysis(sessionId);
      if (!pointsResult.success) {
        console.error("Failed to consume points for session analysis:", pointsResult.error);
        return { error: pointsResult.error };
      }
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

      return { success: true, pointsConsumed: pointsResult.cost };
    } catch (error) {
      console.error("Error generating session summary:", error);
      return { error: "Failed to generate session summary" };
    }
  }, [addTokenUsage, locale, session, updateSession, canAffordService, requestSessionAnalysis, sessionId]);

  return {
    summarizeSession,
  };
}
