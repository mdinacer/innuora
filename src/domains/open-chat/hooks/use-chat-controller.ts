import { useCallback, useMemo, useState } from "react";

import useSessionInput from "@/domains/open-chat/hooks/use-process-input";
import useSessionAnalysis from "@/domains/open-chat/hooks/use-session-analysis";
import { useSessionState } from "@/domains/open-chat/hooks/use-session.state";
import { analytics } from "@/lib/analytics/analytics";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
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
    // addAnalysis,
    // addTokenUsage,
    addCreditsUsed,
    updateSession,
    resetSession,
    resetEncryptedSession,
  } = useSessionState({
    sessionId,
  });

  const [isProcessing, setProcessing] = useState(false);
  const messages: OpenChatMessage[] = useMemo(() => session?.messages || [], [session?.messages]);
  //const { updateSessionMemory } = useSessionMemory({ sessionId });
  const { summarizeSession } = useSessionAnalysis({ sessionId, locale });

  // Round completion sync - the main sync point after all data is updated
  const handleRoundComplete = useCallback(() => {
    logger.logInfo("Chat round completed - triggering session sync", {
      operation: "chat_controller_round_complete",
      sessionId,
      metadata: { locale },
    });
    // Import sessionSynchronizer and get fresh session state

    import("@/domains/simple-session-sync").then(({ localSyncService }) => {
      import("@/domains/active-session/active-session.store").then(({ useActiveSessionStore }) => {
        const currentSession = useActiveSessionStore.getState().session;
        if (currentSession) {
          localSyncService.syncSession(currentSession);
        }
      });
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const { appendAssistantMessage, appendUserMessage, processInput, processingError } = useSessionInput({
    sessionId,
    locale,
    onRoundComplete: handleRoundComplete,
  });

  const processMessage = useCallback(
    async (message: string) => {
      if (!session) return;

      const messageId = appendUserMessage(message.trim());

      if (!messageId) return;
      try {
        setProcessing(true);
        const result = await processInput(message, messageId);
        if (!result) return;

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

        // Track credits used in session metadata
        if (creditsUsed > 0) addCreditsUsed(creditsUsed);

        // Track AI message interaction for business analytics
        analytics.trackSession("message_sent", {
          sessionId,
          userId: session.userId,
          creditsUsed,
          //modelUsed: tokenUsage?.responseUsage?.model || "unknown",
          messageCount: messages.length + 1, // +1 for the new message being processed
        });

        // Evaluate session wellness using AI (optimized frequency to reduce token waste)
        // Track token usage and credits from wellness checks
        // NOTE: Wellness service now fetches analysisSnapshots from server-side storage
        if ((session.messages.filter((m) => m.role === "user").length + 1) % 10 === 0) {
          setTimeout(() => {
            import("@/domains/session-wellness/session-wellness-simple-service").then(({ runSessionWellnessCheck }) => {
              runSessionWellnessCheck(session, message)
                .then((res) => {
                  if (res?.creditsUsed && res.creditsUsed > 0) addCreditsUsed(res.creditsUsed);
                })
                .catch((err) => {
                  logger.logWarning("Periodic wellness check failed", {
                    operation: "session_wellness_check_error",
                    sessionId,
                    metadata: { error: String(err) },
                  });
                });
            });

            import("@/domains/simple-session-sync").then(({ cloudSyncService }) => {
              import("@/domains/active-session/active-session.store").then(({ useActiveSessionStore }) => {
                const currentSession = useActiveSessionStore.getState().session;
                if (currentSession) {
                  cloudSyncService.syncToCloud(currentSession.id);
                }
              });
            });
          }, 0);
        }
        // setTimeout(() => {
        //   import("@/domains/session-wellness/session-wellness.service").then(({ sessionWellnessService }) => {
        //     const appUser = useAppUserStore.getState().user;
        //     sessionWellnessService
        //       .evaluateAfterMessage(session, message, sessionId, locale, appUser?.authId)
        //       .then((result) => {
        //         if (result) {
        //           //if (result.tokenUsage) addTokenUsage({ ...result.tokenUsage, type: "other" });
        //           if (result.creditsUsed > 0) addCreditsUsed(result.creditsUsed);
        //         }
        //       })
        //       .catch((error) => {
        //         logger.logWarning("Wellness check tracking failed", {
        //           operation: "wellness_check_tracking_failed",
        //           sessionId,
        //           metadata: {
        //             error: error instanceof Error ? error.message : String(error),
        //           },
        //         });
        //       });
        //   });
        // }, 0);

        return {
          success: true,
        };
      } catch (error) {
        logger.logWarning("Chat processing error occurred", {
          operation: "chat_controller_process_error",
          sessionId,
          metadata: {
            error: error instanceof Error ? error.message : String(error),
            locale,
          },
        });
        // Trigger sync for error cases to save user message even if AI failed
        handleRoundComplete();
        return { error: "Failed to process message" };
      } finally {
        setProcessing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      appendAssistantMessage,
      appendUserMessage,
      processInput,
      session,
      //updateSessionMemory,
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
