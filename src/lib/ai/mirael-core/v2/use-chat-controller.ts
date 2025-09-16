import { useCallback, useMemo, useState } from "react";

import useSessionInput from "@/lib/ai/mirael-core/v2/open-chat/use-process-input";
import useSessionAnalysis from "@/lib/ai/mirael-core/v2/open-chat/use-session-analysis";
import useSessionMemory from "@/lib/ai/mirael-core/v2/open-chat/use-session-memory";
import { useChatSessionState } from "@/lib/ai/mirael-core/v2/open-chat/use-session.state";
import { AppLocales } from "@/lib/i18n";
import { useSessionServices } from "@/lib/points/simple-points";
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
  const { canAffordService, requestExtendedSession, consumeService } = useSessionServices();

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

      // Check if user can afford basic message
      const basicAffordability = canAffordService("basic_message");
      if (!basicAffordability.canAfford) {
        console.warn("Cannot afford basic message:", basicAffordability.reason);
        return { error: "Insufficient points for message", cost: basicAffordability.cost };
      }

      // Check if this is an extended session (more than 10 messages)
      const isExtendedSession = session.messages.length > 10;
      if (isExtendedSession) {
        const extendedAffordability = canAffordService("extended_session");
        if (!extendedAffordability.canAfford) {
          console.warn("Cannot afford extended session:", extendedAffordability.reason);
          return { error: "Insufficient points for extended session", cost: extendedAffordability.cost };
        }
      }

      // Deduct points for basic message
      try {
        const basicMessageResult = await consumeService("basic_message", { sessionId });
        if (!basicMessageResult.success) {
          console.error("Failed to deduct points for basic message:", basicMessageResult.error);
          return { error: "Failed to process payment", cost: basicAffordability.cost };
        }
      } catch (error) {
        console.error("Points deduction error:", error);
        return { error: "Failed to process payment" };
      }

      // Deduct points for extended session if applicable
      if (isExtendedSession) {
        try {
          const extendedResult = await requestExtendedSession(sessionId);
          if (!extendedResult.success) {
            console.error("Failed to deduct points for extended session:", extendedResult.error);
            // Note: We already charged for basic message, but this is an edge case
            return { error: "Failed to process extended session payment" };
          }
        } catch (error) {
          console.error("Extended session points deduction error:", error);
          return { error: "Failed to process extended session payment" };
        }
      }

      appendUserMessage(message.trim());

      try {
        setProcessing(true);
        const result = await processInput(message);
        if (!result) return;

        const { assistantMessage, shouldUpdateMemory } = result;

        appendAssistantMessage(assistantMessage);

        if (shouldUpdateMemory) {
          const memoryResult = await updateSessionMemory(message);
          if (memoryResult?.error) {
            console.warn("Memory enhancement failed:", memoryResult.error);
          }
        }

        return { success: true };
      } catch (error) {
        console.error("Error:", error);
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
      canAffordService,
      consumeService,
      requestExtendedSession,
      sessionId,
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
