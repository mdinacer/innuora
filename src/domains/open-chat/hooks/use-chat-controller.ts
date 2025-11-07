import { useCallback, useMemo, useState } from "react";

import { useActiveSessionStore } from "@/domains/active-session/active-session.store";
import useSessionInput from "@/domains/open-chat/hooks/use-process-input";
import useSessionAnalysis from "@/domains/open-chat/hooks/use-session-analysis";
import { useSessionState } from "@/domains/open-chat/hooks/use-session.state";
import { Session } from "@/domains/open-chat/open-chat.types";
import { sessionSynchronizer } from "@/domains/session-sync";
import { analytics } from "@/lib/analytics/analytics";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/logger.client";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface OpenChatProps {
  sessionId: string;
  locale?: AppLocales;
}

const WELLNESS_CHECK_INTERVAL = 10;

function shouldRunWellnessCheck(session: Session): boolean {
  const userMessageCount = session.messages.filter((message) => message.role === "user").length;
  return userMessageCount > 0 && userMessageCount % WELLNESS_CHECK_INTERVAL === 0;
}

async function runWellnessCheck(session: Session, userMessage: string, addCreditsUsed: (credits: number) => void) {
  if (!shouldRunWellnessCheck(session)) return;

  try {
    const { runSessionWellnessCheck } = await import("@/domains/session-wellness/session-wellness-simple-service");
    const result = await runSessionWellnessCheck(session, userMessage);
    if (result?.creditsUsed && result.creditsUsed > 0) {
      addCreditsUsed(result.creditsUsed);
    }
  } catch (error) {
    logger.logWarning("Periodic wellness check failed", {
      operation: "session_wellness_check_error",
      sessionId: session.id,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
  }
}

export function useChatController({ sessionId, locale = "en" }: OpenChatProps) {
  const {
    isReady: hasHydrated,
    session,
    addMessage,
    addCreditsUsed,
    updateSession,
    resetSession,
    resetEncryptedSession,
  } = useSessionState({ sessionId });

  const [isProcessing, setProcessing] = useState(false);
  const messages: OpenChatMessage[] = useMemo(() => session?.messages || [], [session?.messages]);
  const { summarizeSession } = useSessionAnalysis({ sessionId, locale });

  const handleRoundComplete = useCallback(() => {
    const latestSession = useActiveSessionStore.getState().session;
    if (!latestSession) return;

    logger.logInfo("Chat round completed - triggering session sync", {
      operation: "chat_controller_round_complete",
      sessionId,
      metadata: { locale },
    });

    sessionSynchronizer.queueSync(sessionId, "update", latestSession);
  }, [locale, sessionId]);

  const { appendAssistantMessage, appendUserMessage, processInput, processingError } = useSessionInput({
    sessionId,
    locale,
    onRoundComplete: handleRoundComplete,
  });

  const processMessage = useCallback(
    async (message: string) => {
      if (!session) return;

      const trimmedMessage = message.trim();
      if (!trimmedMessage) return { error: "Message is empty" };

      const messageId = appendUserMessage(trimmedMessage);
      if (!messageId) return { error: "Failed to queue user message" };

      setProcessing(true);

      try {
        const result = await processInput(trimmedMessage, messageId);
        if (!result) return { error: "No response from assistant" };

        const { assistantMessage, creditsUsed } = result;

        if (!assistantMessage) {
          logger.logWarning("No assistant message found in chat response", {
            operation: "chat_controller_process_input",
            sessionId,
            metadata: { locale },
          });
          return { error: "No assistant message found" };
        }

        appendAssistantMessage(assistantMessage, creditsUsed);

        if (creditsUsed > 0) {
          addCreditsUsed(creditsUsed);
        }

        void analytics
          .trackSession("message_sent", {
            sessionId,
            userId: session.userId,
            creditsUsed,
            messageCount: messages.length + 1,
          })
          .catch(() => {});

        const latestSession = useActiveSessionStore.getState().session;
        if (latestSession) {
          void runWellnessCheck(latestSession, trimmedMessage, addCreditsUsed);
        }

        return { success: true };
      } catch (error) {
        logger.logWarning("Chat processing error occurred", {
          operation: "chat_controller_process_error",
          sessionId,
          metadata: {
            error: error instanceof Error ? error.message : String(error),
            locale,
          },
        });
        handleRoundComplete();
        return { error: "Failed to process message" };
      } finally {
        setProcessing(false);
      }
    },
    [
      addCreditsUsed,
      appendAssistantMessage,
      appendUserMessage,
      handleRoundComplete,
      locale,
      messages.length,
      processInput,
      session,
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
      processingError,
    },
    actions: {
      processMessage,
      addMessage,
      resetSession: handleSessionReset,
      updateSession,
      summarizeSession,
    },
  };
}
