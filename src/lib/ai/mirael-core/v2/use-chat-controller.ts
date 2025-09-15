import { useCallback, useMemo, useState } from "react";

import useSessionInput from "@/lib/ai/mirael-core/v2/open-chat/use-process-input";
import useSessionAnalysis from "@/lib/ai/mirael-core/v2/open-chat/use-session-analysis";
import useSessionMemory from "@/lib/ai/mirael-core/v2/open-chat/use-session-memory";
import { useChatSessionState } from "@/lib/ai/mirael-core/v2/open-chat/use-session.state";
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
  } = useChatSessionState({
    sessionId,
  });

  const [isProcessing, setProcessing] = useState(false);
  const messages: OpenChatMessage[] = useMemo(() => session?.messages || [], [session?.messages]);
  const { updateSessionMemory } = useSessionMemory({ sessionId });
  const { summarizeSession } = useSessionAnalysis({ sessionId, locale });

  // Auto-sync is now handled automatically by the session state
  // No manual sync needed at round completion!
  const handleRoundComplete = useCallback(() => {
    // Optional: Force a manual sync if needed for critical operations
    // The auto-sync system handles this automatically now
  }, []);

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

        const { assistantMessage, shouldUpdateMemory } = result;

        appendAssistantMessage(assistantMessage);

        if (shouldUpdateMemory) {
          await updateSessionMemory(message);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setProcessing(false);
      }
    },
    [appendAssistantMessage, appendUserMessage, processInput, session, updateSessionMemory]
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
