import { useCallback, useEffect, useMemo, useState } from "react";

import { useOpenChatSessionStore } from "@/lib/ai/mirael-core/v2/open-chat-session.store";
import useSessionInput from "@/lib/ai/mirael-core/v2/open-chat/use-process-input";
import useSessionAnalysis from "@/lib/ai/mirael-core/v2/open-chat/use-session-analysis";
import useSessionMemory from "@/lib/ai/mirael-core/v2/open-chat/use-session-memory";
import { useChatSessionState } from "@/lib/ai/mirael-core/v2/open-chat/use-session.state";
import { AppLocales } from "@/lib/i18n";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface OpenChatProps {
  sessionId: string;
  autoCreateSession?: boolean;
  locale?: AppLocales;
}

export function useChatController({ sessionId, autoCreateSession = false, locale = "en" }: OpenChatProps) {
  const { hasHydrated, session, addMessage, addAnalysis, addTokenUsage, updateSession, resetSession } =
    useChatSessionState({
      sessionId,
    });

  const [isProcessing, setProcessing] = useState(false);
  const messages: OpenChatMessage[] = useMemo(() => session?.messages || [], [session?.messages]);
  const { updateSessionMemory } = useSessionMemory({ sessionId });
  const { summarizeSession } = useSessionAnalysis({ sessionId, locale });
  const { appendAssistantMessage, appendUserMessage, processInput } = useSessionInput({ sessionId, locale });

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

  useEffect(() => {
    if (autoCreateSession && hasHydrated && !session) {
      useOpenChatSessionStore.getState().createSession(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, session]);

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
      resetSession,
      updateSession,
      summarizeSession,
    },
  };
}
