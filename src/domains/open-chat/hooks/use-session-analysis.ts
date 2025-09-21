import { useCallback, useState } from "react";

import { calculateAIMessageCost, deductCredits } from "@/app/actions/credit-actions";
import { MODELS_CODES } from "@/domains/ai-conversation/ai-models";
import { useSessionState } from "@/domains/open-chat/hooks/use-session.state";
import { SessionSummary } from "@/domains/open-chat/open-chat.types";
import { SessionSummarySchema } from "@/domains/session-analysis/session-analysis.types";
import { combineToSessionAnalysis } from "@/domains/session-analysis/session-analysis.utils";
import { getSessionSummary } from "@/domains/session-summary/session-summary.action";
import { AppLocales } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { parseJsonObject } from "@/lib/utils/parse-json";
import { useUserDataStore } from "@/stores/user-data.store";

export default function useSessionAnalysis({ sessionId, locale = "en" }: { sessionId: string; locale?: AppLocales }) {
  const { session, addTokenUsage, updateSession } = useSessionState({ sessionId });
  const userProfile = useUserDataStore((state) => state.profile);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const summarizeSession = useCallback(async () => {
    setAnalysisError(null);

    if (!session) {
      const error = "No session available for analysis";
      console.error(error);
      setAnalysisError(error);
      return { error };
    }

    if (!session.memoryStore) {
      const error = "Session memory store is empty";
      console.error(error);
      setAnalysisError(error);
      return { error };
    }

    if (!session.analysisSnapshots.length) {
      const error = "No analysis snapshots available";
      console.error(error);
      setAnalysisError(error);
      return { error };
    }

    setIsAnalyzing(true);

    try {
      const sessionAnalysis = combineToSessionAnalysis(session.analysisSnapshots);

      if (!sessionAnalysis) {
        const error = "Failed to combine analysis snapshots";
        console.error(error);
        setAnalysisError(error);
        return { error };
      }

      const result = await getSessionSummary(sessionAnalysis, session.memoryStore, locale);

      if (!result) {
        const error = "AI analysis failed - no response received";
        console.error(error);
        setAnalysisError(error);
        return { error };
      }

      // Track token usage and deduct credits for summarization AI call
      if (result.modelTokenUsage) {
        addTokenUsage({ ...result.modelTokenUsage, type: "summary" });

        // Deduct credits for session summarization AI call
        if (userProfile?.userId) {
          const inputTokens = result.modelTokenUsage.usage?.prompt_tokens ?? 0;
          const outputTokens = result.modelTokenUsage.usage?.completion_tokens ?? 0;

          if (inputTokens > 0 || outputTokens > 0) {
            try {
              // Resolve authId from database user ID
              const user = await prisma.user.findUnique({
                where: { id: userProfile.userId },
                select: { authId: true },
              });

              if (!user?.authId) {
                throw new Error("User authId not found");
              }

              const summaryCredits = await calculateAIMessageCost(MODELS_CODES.M1, inputTokens, outputTokens);
              await deductCredits(user.authId, summaryCredits, "session_summarization", sessionId, {
                inputTokens,
                outputTokens,
                locale,
                sessionMemoryLength: session.memoryStore?.length ?? 0,
                analysisSnapshotCount: session.analysisSnapshots.length,
              });
            } catch (error) {
              console.warn("Failed to deduct credits for session summarization:", error);
              // Don't fail the summarization if credit deduction fails
            }
          }
        }
      }

      if (!result.message) {
        const error = "AI analysis returned empty response";
        console.error(error);
        setAnalysisError(error);
        return { error };
      }

      let parsedJSON;
      try {
        parsedJSON = parseJsonObject(result.message);
      } catch (err) {
        const error = "Invalid JSON in analysis result";
        console.error(error, result.message, err);
        setAnalysisError(error);
        return { error };
      }

      const parsedData = SessionSummarySchema.safeParse(parsedJSON);
      if (!parsedData.success) {
        const error = "Analysis result doesn't match expected format";
        console.error(error, parsedData.error.format());
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
      console.error("Session analysis failed:", error);
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
