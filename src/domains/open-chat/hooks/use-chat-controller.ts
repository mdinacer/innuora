import { useCallback, useMemo, useState } from "react";

import useSessionInput from "@/domains/open-chat/hooks/use-process-input";
import useSessionAnalysis from "@/domains/open-chat/hooks/use-session-analysis";
import useSessionMemory from "@/domains/open-chat/hooks/use-session-memory";
import { useSessionState } from "@/domains/open-chat/hooks/use-session.state";
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
    logger.logInfo("Chat round completed - triggering session sync", {
      operation: "chat_controller_round_complete",
      sessionId,
      metadata: { locale },
    });
    // Import sessionSynchronizer and get fresh session state
    import("@/domains/session-sync").then(({ sessionSynchronizer }) => {
      import("@/domains/active-session/active-session.store").then(({ useActiveSessionStore }) => {
        const currentSession = useActiveSessionStore.getState().session;
        if (currentSession) {
          sessionSynchronizer.queueLocalSync(sessionId, "update", currentSession);
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          logger.logWarning("No assistant message found in chat response", {
            operation: "chat_controller_process_input",
            sessionId,
            metadata: { locale },
          });
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

        // Move memory update to background to avoid blocking UI
        if (shouldUpdateMemory) {
          // Non-blocking memory update
          updateSessionMemory(message).catch((error) => {
            logger.logWarning("Memory enhancement failed during chat processing", {
              operation: "chat_controller_memory_enhancement",
              sessionId,
              metadata: {
                error: error instanceof Error ? error.message : String(error),
                locale,
              },
            });
          });
        }

        // Evaluate session wellness using AI (optimized frequency to reduce token waste)
        setTimeout(() => {
          import("@/domains/session-wellness/session-wellness.frequency-manager").then(
            ({ wellnessFrequencyManager }) => {
              const currentSession = session;
              if (currentSession) {
                const messageCount = currentSession.messages.length;
                const latestAnalysis = currentSession.analysisSnapshots[currentSession.analysisSnapshots.length - 1];
                const hasCrisisIndicators = latestAnalysis?.crisis !== "none" || latestAnalysis?.intensity === "high";

                // Check if wellness analysis should run based on frequency optimization
                if (wellnessFrequencyManager.shouldCheckWellness(sessionId, messageCount, hasCrisisIndicators)) {
                  import("@/domains/session-wellness/session-wellness.ai").then(({ AISessionWellnessEngine }) => {
                    const aiWellnessEngine = new AISessionWellnessEngine();

                    // Log wellness check execution with frequency stats
                    const stats = wellnessFrequencyManager.getCheckStats(sessionId, messageCount);
                    const savings = wellnessFrequencyManager.getTokenSavingsEstimate(sessionId, messageCount);

                    logger.logInfo("Executing wellness check with frequency optimization", {
                      operation: "chat_controller_wellness_check_optimized",
                      sessionId,
                      metadata: {
                        messageCount,
                        messagesSinceLastCheck: stats.messagesSinceLastCheck,
                        estimatedTokensSaved: savings.estimatedTokensSaved,
                        hasCrisisIndicators,
                        locale,
                      },
                    });

                    aiWellnessEngine
                      .evaluateSessionWellness(currentSession, currentSession.analysisSnapshots, message)
                      .then((wellness) => {
                        if (wellness.suggest_conclusion) {
                          logger.logInfo("AI session wellness evaluation completed", {
                            operation: "chat_controller_session_wellness",
                            sessionId,
                            metadata: {
                              shouldEnd: wellness.suggest_conclusion,
                              reason: wellness.reason,
                              locale,
                            },
                          });
                          // TODO: Implement gentle conclusion guidance based on wellness.reason
                        }
                      })
                      .catch((error) => {
                        logger.logWarning("Session wellness evaluation failed", {
                          operation: "chat_controller_session_wellness_failed",
                          sessionId,
                          metadata: {
                            error: error instanceof Error ? error.message : String(error),
                            locale,
                          },
                        });
                      });
                  });
                } else {
                  // Log when wellness check is skipped for frequency optimization
                  const stats = wellnessFrequencyManager.getCheckStats(sessionId, messageCount);
                  logger.logInfo("Wellness check skipped for frequency optimization", {
                    operation: "chat_controller_wellness_check_skipped",
                    sessionId,
                    metadata: {
                      messageCount,
                      messagesSinceLastCheck: stats.messagesSinceLastCheck,
                      timeSinceLastCheckMs: stats.timeSinceLastCheck,
                      hasCrisisIndicators,
                      locale,
                    },
                  });
                }
              }
            }
          );
        }, 0);

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
