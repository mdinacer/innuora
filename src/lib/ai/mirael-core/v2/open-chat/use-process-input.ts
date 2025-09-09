import { useCallback } from "react";

import { handleUserInput } from "@/lib/ai/mirael-core/v2/mirael-chat.action";
import { useChatSessionState } from "@/lib/ai/mirael-core/v2/open-chat/use-session.state";
import { generateMessageId } from "@/lib/chat/flow/generate-id";
import { MODELS_CODES } from "@/lib/constants/ai-models";
import { AppLocales } from "@/lib/i18n";
import { useUserDataStore } from "@/stores/user-data.store";
import { OpenChatMessage } from "@/types/open-chat-message.types";

const FALLBACK_MODEL = MODELS_CODES.M1;

export default function useSessionInput({ sessionId, locale = "en" }: { sessionId: string; locale?: AppLocales }) {
  const { session, addMessage, addAnalysis, addTokenUsage } = useChatSessionState({ sessionId });

  const appendMessage = useCallback(
    (content: string, role: "user" | "assistant" = "user") => {
      addMessage({
        id: generateMessageId(`${role}-message-${sessionId}`),
        role,
        content,
        timestamp: Date.now(),
      });
    },
    [addMessage, sessionId]
  );

  const appendUserMessage = useCallback((userInput: string) => appendMessage(userInput, "user"), [appendMessage]);

  const appendAssistantMessage = useCallback((message: string) => appendMessage(message, "assistant"), [appendMessage]);

  const processInput = useCallback(
    async (userInput: string) => {
      if (!session) {
        console.error("No session found");
        return null;
      }
      if (!userInput.trim()) {
        console.error("No user input found");
        return null;
      }

      const recentAnalysis = session.analysis?.slice(-3) ?? [];
      const history: OpenChatMessage[] = session.messages ?? [];
      const userProfile = useUserDataStore.getState().profile;

      const result = await handleUserInput(
        userInput,
        recentAnalysis,
        history,
        userProfile,
        session.sessionMemory,
        locale,
        session?.modelCode ?? FALLBACK_MODEL
      );

      if (!result) {
        throw new Error("Failed to process user input");
      }

      const {
        response: assistantMessage,
        analysis: newAnalysis,
        tokenUsage: { analysisUsage, responseUsage },
      } = result;

      if (newAnalysis) addAnalysis(newAnalysis);
      if (analysisUsage) addTokenUsage({ ...analysisUsage, type: "analysis" });
      if (responseUsage) addTokenUsage({ ...responseUsage, type: "completion" });

      return {
        assistantMessage,
        shouldUpdateMemory: newAnalysis?.update_memory ?? false,
      };
    },
    [addAnalysis, addTokenUsage, locale, session]
  );

  return { appendUserMessage, appendAssistantMessage, processInput };
}
