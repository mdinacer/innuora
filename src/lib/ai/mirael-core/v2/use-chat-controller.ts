import { useCallback, useMemo, useState } from "react";

import useSessionInput from "@/lib/ai/mirael-core/v2/open-chat/use-process-input";
import useSessionAnalysis from "@/lib/ai/mirael-core/v2/open-chat/use-session-analysis";
import useSessionMemory from "@/lib/ai/mirael-core/v2/open-chat/use-session-memory";
import { useChatSessionState } from "@/lib/ai/mirael-core/v2/open-chat/use-session.state";
import { AppLocales } from "@/lib/i18n";
import { simpleSessionSync } from "@/lib/session-sync/simple-sync";
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
  } = useChatSessionState({
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
      simpleSessionSync.queueLocalSync(sessionId, "update", session);
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
