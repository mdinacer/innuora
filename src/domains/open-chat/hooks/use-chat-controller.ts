import { useCallback, useMemo, useState } from "react";

import useSessionInput from "@/domains/open-chat/hooks/use-process-input";
import useSessionAnalysis from "@/domains/open-chat/hooks/use-session-analysis";
import useSessionMemory from "@/domains/open-chat/hooks/use-session-memory";
import { useSessionState } from "@/domains/open-chat/hooks/use-session.state";
import { AppLocales } from "@/lib/i18n";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface OpenChatProps {
  sessionId: string; // Obfuscated Session ID
  locale?: AppLocales;
}

export function useChatController({ sessionId, locale = "en" }: OpenChatProps) {
  const {
    isReady: hasHydrated,
    session,
    addMessage,
    addAnalysis,
    addTokenUsage,
    addCreditsUsed,
    updateSession,
    resetSession,
    resetEncryptedSession,
  } = useSessionState({
    sessionId,
  });

  const [isProcessing, setProcessing] = useState(false);
  const messages: OpenChatMessage[] = useMemo(() => session?.messages || [], [session?.messages]);
  const { updateSessionMemory } = useSessionMemory({ sessionId });
  const { summarizeSession } = useSessionAnalysis({ sessionId, locale });

  // Round completion sync - the main sync point after all data is updated
  const handleRoundComplete = useCallback(() => {
    console.log(`[ChatController] Round completed for session ${sessionId} - triggering sync`);
    // Import sessionSynchronizer and get fresh session state
    import("@/domains/session-sync").then(({ sessionSynchronizer }) => {
      import("@/domains/active-session/active-session.store").then(({ useActiveSessionStore }) => {
        const currentSession = useActiveSessionStore.getState().session;
        if (currentSession) {
          sessionSynchronizer.queueLocalSync(sessionId, "update", currentSession);
        }
      });
    });
  }, [sessionId]);

  const { appendAssistantMessage, appendUserMessage, processInput } = useSessionInput({
    sessionId,
    locale,
    onRoundComplete: handleRoundComplete,
  });

  const processMessage = useCallback(
    async (message: string) => {
      if (!session) return;

      appendUserMessage(message.trim());

      try {
        setProcessing(true);
        const result = await processInput(message);
        if (!result) return;

        const { assistantMessage, shouldUpdateMemory, tokenUsage, creditsUsed } = result;

        if (!assistantMessage) {
          console.error("No assistant message found");
          return { error: "No assistant message found" };
        }

        // Collect all token usages from the conversation round
        const allTokenUsages = [];
        if (tokenUsage?.analysisUsage) allTokenUsages.push(tokenUsage.analysisUsage);
        if (tokenUsage?.responseUsage) allTokenUsages.push(tokenUsage.responseUsage);

        // Check if this is an extended session (more than 10 messages)

        appendAssistantMessage(assistantMessage, creditsUsed);

        // Add token usage to session for tracking
        if (tokenUsage?.analysisUsage) addTokenUsage(tokenUsage.analysisUsage);
        if (tokenUsage?.responseUsage) addTokenUsage(tokenUsage.responseUsage);

        // Track credits used in session metadata
        if (creditsUsed > 0) addCreditsUsed(creditsUsed);

        if (shouldUpdateMemory) {
          const memoryResult = await updateSessionMemory(message);
          if (memoryResult?.error) {
            console.warn("Memory enhancement failed:", memoryResult.error);
          }
        }

        return {
          success: true,
        };
      } catch (error) {
        console.error("Error:", error);
        // Trigger sync for error cases to save user message even if AI failed
        handleRoundComplete();
        return { error: "Failed to process message" };
      } finally {
        setProcessing(false);
      }
    },
    [
      appendAssistantMessage,
      appendUserMessage,
      processInput,
      session,
      updateSessionMemory,
      addTokenUsage,
      addCreditsUsed,
      handleRoundComplete,
    ]
  );

  const handleSessionReset = useCallback(() => {
    resetSession();
    resetEncryptedSession();
  }, [resetEncryptedSession, resetSession]);

  return {
    state: {
      hasHydrated,
      session,
      messages,
      isProcessing,
    },
    actions: {
      processMessage,
      addMessage,
      addAnalysis,
      addTokenUsage,
      resetSession: handleSessionReset,
      updateSession,
      summarizeSession,
    },
  };
}
