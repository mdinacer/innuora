import { useCallback, useState } from "react";
import { Profile } from "@prisma/client";

import { handleHolisticUserInput } from "@/domains/conversation-engine";
import { useSessionState } from "@/domains/open-chat/hooks/use-session.state";
import { trackAIOperationFromResponse } from "@/lib/dev-tools/use-consumption-tracker";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/logger.client";
import { useAppUserStore } from "@/stores/app-user.store";
//import { useUserDataStore } from "@/stores/user-data.store";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface Props {
  sessionId: string;
  locale?: AppLocales;
  onRoundComplete?: () => void;
}

export default function useSessionInput({ sessionId, locale = "en", onRoundComplete }: Props) {
  const { session, appendMessage } = useSessionState({ sessionId });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const appendUserMessage = useCallback((userInput: string) => appendMessage(userInput, "user"), [appendMessage]);

  const appendAssistantMessage = useCallback(
    (message: string, creditsUsed?: number) => appendMessage(message, "assistant", creditsUsed),
    [appendMessage]
  );

  const processInput = useCallback(
    async (userInput: string, messageId: string) => {
      setProcessingError(null);
      setIsProcessing(true);

      const userProfile = useAppUserStore.getState().user?.profile as Profile;
      const deductCredits = useAppUserStore.getState().deductCredits;

      try {
        if (!session) {
          const error = "No session found";
          setProcessingError(error);
          return { error };
        }

        if (!userInput.trim()) {
          const error = "User input is required";
          setProcessingError(error);
          return { error };
        }

        const history: OpenChatMessage[] = session.messages ?? [];

        // NOTE: Holistic engine fetches all context (relationalTrace, profile) server-side
        // No longer passing user profile from client (security best practice)
        const result = await handleHolisticUserInput(
          userInput,
          history,
          locale,
          sessionId, // sessionId
          messageId // messageId for AI operation logging
        );

        if (!result) {
          const error = "AI processing failed - no response received";
          setProcessingError(error);
          return { error };
        }

        const {
          response: assistantMessage,
          creditsUsed,
          signals, // Crisis/resistance detection from holistic engine
          _devTracking, // Development-only tracking data
        } = result;

        // Track AI operation for development/testing (dev tools)
        if (_devTracking) {
          trackAIOperationFromResponse(
            _devTracking.operationType,
            "Holistic Conversation Response",
            _devTracking.modelType,
            _devTracking.tokenUsage,
            {
              messageId,
              locale,
              signals: signals,
            }
          );
        }

        // Update client-side balance to reflect server-side deduction
        // Credits were already deducted on the server, just sync the UI
        deductCredits(creditsUsed);

        // Validate response content
        if (!assistantMessage || typeof assistantMessage !== "string") {
          const error = "Invalid AI response format";
          setProcessingError(error);
          return { error };
        }

        // NOTE: Analysis is now saved server-side automatically - no client-side storage
        // addAnalysis(newAnalysis, messageId); // REMOVED - server-side only now

        // if (analysisUsage) addTokenUsage({ ...analysisUsage, type: "analysis" });
        // if (responseUsage) addTokenUsage({ ...responseUsage, type: "completion" });

        // Trigger sync in background - don't block user interaction
        setTimeout(() => {
          onRoundComplete?.();
        }, 0);

        logger.logInfo("User input processed successfully", {
          operation: "holistic_process_input_success",
          sessionId,
          userId: userProfile?.userId,
          metadata: {
            hasResponse: !!assistantMessage,
            locale,
            signals: signals,
          },
        });

        return {
          assistantMessage,
          creditsUsed,
          //shouldUpdateMemory: newAnalysis?.update_memory ?? false,
          //tokenUsage: { analysisUsage, responseUsage },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        logger.logWarning("Input processing failed", {
          operation: "holistic_process_input_failed",
          sessionId,
          userId: userProfile?.userId,
          metadata: {
            error: error instanceof Error ? error.message : String(error),
            locale,
          },
        });
        setProcessingError(`Processing failed: ${message}`);
        return { error: message };
      } finally {
        setIsProcessing(false);
      }
    },
    [locale, onRoundComplete, session, sessionId]
  );

  return {
    appendUserMessage,
    appendAssistantMessage,
    processInput,
    isProcessing,
    processingError,
  };
}
