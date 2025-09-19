import { useCallback, useMemo, useState } from "react";

import useSessionInput from "@/domains/open-chat/hooks/use-process-input";
import useSessionAnalysis from "@/domains/open-chat/hooks/use-session-analysis";
import useSessionMemory from "@/domains/open-chat/hooks/use-session-memory";
import { useSessionState } from "@/domains/open-chat/hooks/use-session.state";
import { sessionSynchronizer } from "@/domains/session-sync";
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

  // Sync session after each complete conversation round (local sync only)
  const handleRoundComplete = useCallback(() => {
    if (session) {
      // Use local sync for frequent round completion - cloud sync is debounced separately
      sessionSynchronizer.queueLocalSync(sessionId, "update", session);
    }
  }, [session, sessionId]);

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

        const { assistantMessage, shouldUpdateMemory, tokenUsage } = result;

        if (!assistantMessage) {
          console.error("No assistant message found");
          return { error: "No assistant message found" };
        }

        // Collect all token usages from the conversation round
        const allTokenUsages = [];
        if (tokenUsage?.analysisUsage) allTokenUsages.push(tokenUsage.analysisUsage);
        if (tokenUsage?.responseUsage) allTokenUsages.push(tokenUsage.responseUsage);

        // Check if this is an extended session (more than 10 messages)

        appendAssistantMessage(assistantMessage);

        // Add token usage to session for tracking
        if (tokenUsage?.analysisUsage) addTokenUsage(tokenUsage.analysisUsage);
        if (tokenUsage?.responseUsage) addTokenUsage(tokenUsage.responseUsage);

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
        return { error: "Failed to process message" };
      } finally {
        setProcessing(false);
      }
    },
    [appendAssistantMessage, appendUserMessage, processInput, session, updateSessionMemory, addTokenUsage]
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
