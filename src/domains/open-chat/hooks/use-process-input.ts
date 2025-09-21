import { useCallback, useState } from "react";

import { MODELS_CODES } from "@/domains/ai-conversation/ai-models";
import { useSessionState } from "@/domains/open-chat/hooks/use-session.state";
import { handleUserInput } from "@/domains/open-chat/open-chat.action";
import { AppLocales } from "@/lib/i18n";
import { logger } from "@/lib/logging/unified-logger";
import { useUserDataStore } from "@/stores/user-data.store";
import { OpenChatMessage } from "@/types/open-chat-message.types";

const FALLBACK_MODEL = MODELS_CODES.M1;
const RECENT_ANALYSIS_COUNT = 3;

interface Props {
  sessionId: string;
  locale?: AppLocales;
  onRoundComplete?: () => void;
}

export default function useSessionInput({ sessionId, locale = "en", onRoundComplete }: Props) {
  const { session, appendMessage, addAnalysis, addTokenUsage } = useSessionState({ sessionId });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const appendUserMessage = useCallback((userInput: string) => appendMessage(userInput, "user"), [appendMessage]);

  const appendAssistantMessage = useCallback(
    (message: string, creditsUsed?: number) => appendMessage(message, "assistant", creditsUsed),
    [appendMessage]
  );

  const processInput = useCallback(
    async (userInput: string) => {
      setProcessingError(null);
      setIsProcessing(true);

      const userProfile = useUserDataStore.getState().profile;

      try {
        if (!session) {
          const error = "No session found";
          console.error(error);
          setProcessingError(error);
          return { error };
        }

        if (!userInput.trim()) {
          const error = "User input is required";
          console.error(error);
          setProcessingError(error);
          return { error };
        }

        const recentAnalysis = session.analysisSnapshots?.slice(-RECENT_ANALYSIS_COUNT) ?? [];
        const history: OpenChatMessage[] = session.messages ?? [];

        const result = await handleUserInput(
          userInput,
          recentAnalysis,
          history,
          userProfile,
          session.memoryStore,
          locale,
          session?.modelCode ?? FALLBACK_MODEL,
          userProfile?.userId, // userId
          sessionId // sessionId
        );

        if (!result) {
          const error = "AI processing failed - no response received";
          console.error(error);
          setProcessingError(error);
          return { error };
        }

        const {
          response: assistantMessage,
          analysis: newAnalysis,
          tokenUsage: { analysisUsage, responseUsage },
          creditsUsed,
        } = result;

        // Validate response content
        if (!assistantMessage || typeof assistantMessage !== "string") {
          const error = "Invalid AI response format";
          console.error(error, { assistantMessage });
          setProcessingError(error);
          return { error };
        }

        if (newAnalysis) addAnalysis(newAnalysis);
        if (analysisUsage) addTokenUsage({ ...analysisUsage, type: "analysis" });
        if (responseUsage) addTokenUsage({ ...responseUsage, type: "completion" });

        // Trigger sync in background - don't block user interaction
        setTimeout(() => {
          onRoundComplete?.();
        }, 0);

        logger.logInfo("User input processed successfully", {
          operation: "process_input_success",
          sessionId,
          userId: userProfile?.userId,
          metadata: {
            hasAnalysis: !!newAnalysis,
            hasResponse: !!assistantMessage,
            analysisTokens: (analysisUsage?.usage?.prompt_tokens ?? 0) + (analysisUsage?.usage?.completion_tokens ?? 0),
            responseTokens: (responseUsage?.usage?.prompt_tokens ?? 0) + (responseUsage?.usage?.completion_tokens ?? 0),
            locale,
          },
        });

        return {
          assistantMessage,
          shouldUpdateMemory: newAnalysis?.update_memory ?? false,
          tokenUsage: { analysisUsage, responseUsage },
          creditsUsed,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error occurred";
        logger.logWarning("Input processing failed", {
          operation: "process_input_failed",
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
    [addAnalysis, addTokenUsage, locale, onRoundComplete, session, sessionId]
  );

  return {
    appendUserMessage,
    appendAssistantMessage,
    processInput,
    isProcessing,
    processingError,
  };
}
