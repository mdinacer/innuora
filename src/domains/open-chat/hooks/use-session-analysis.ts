/**
 * Session Analysis Hook (TEMPORARILY DISABLED)
 *
 * This hook has been temporarily disabled as part of the server-side refactoring.
 * It previously relied on client-side access to session.memoryStore and session.analysisSnapshots,
 * which are now stored server-side only for security.
 *
 * TODO: Refactor this hook to:
 * 1. Create a new server action that fetches memory and analysis from getSessionContext()
 * 2. Generate summary on server-side
 * 3. Return only the summary result to client (no sensitive data exposure)
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { AppLocales } from "@/lib/i18n";

export default function useSessionAnalysis({
  sessionId: _sessionId,
  locale: _locale = "en",
}: {
  sessionId: string;
  locale?: AppLocales;
}) {
  const summarizeSession = async () => {
    console.warn("useSessionAnalysis is temporarily disabled - needs refactoring for server-side storage");
    return { error: "Session analysis is temporarily unavailable" };
  };

  return {
    summarizeSession,
    isAnalyzing: false,
    analysisError: "Session analysis feature is temporarily unavailable during refactoring",
  };
}
