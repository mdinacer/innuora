"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { handleUserInput } from "@/app/actions/user-input-actions";
import { Container } from "@/components/chat-ui";
import { MessageBubble } from "@/components/chat-ui/open-chat";
import CodeView from "@/components/code-view";
import { MODELS_CODES } from "@/constants/ai-models";
import { generateMessageId } from "@/lib/chat/flow/generate-message-id";
import { useOpenChat } from "@/lib/chat/use-open-chat";
import { AppLocales } from "@/lib/i18n";
import { useOpenChatSessionStore } from "@/stores/open-chat-session.store";
import { OpenChatMessage as ChatMessage } from "@/types/open-chat-message.types";

const sessionId = "test-session";
const MODEL_CODE = MODELS_CODES.M1;

export default function ChatRoute() {
  const {
    i18n: { language },
  } = useTranslation();
  const [isTyping, setIsTyping] = useState(false);

  const { session, messages, addMessage, addAnalysis, addTokenUsage, hasHydrated } = useOpenChat({
    sessionId,
    autoCreateSession: true,
  });
  const handleOnSendMessage = useCallback(
    async (message: string) => {
      console.log("handleOnSendMessage", message);

      if (!session) return;
      console.log(session);

      const userMessage: ChatMessage = {
        id: generateMessageId(`user-message-${session.id}`), //`user-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: Date.now(),
      };
      addMessage(userMessage);
      try {
        setIsTyping(true);

        const result = await handleUserInput(
          message,
          [],
          messages,
          language as AppLocales,
          session.modelCode || MODEL_CODE
        );

        const {
          response: miraelMessage,
          analysis: stateAnalysis,
          tokenUsage: { analysisUsage, responseUsage },
        } = result;

        if (stateAnalysis) addAnalysis(stateAnalysis);

        if (analysisUsage) addTokenUsage(analysisUsage);
        if (responseUsage) addTokenUsage(responseUsage);

        const assistantMessage: ChatMessage = {
          id: generateMessageId(`assistant-message-${session.id}`), //`assistant-${Date.now()}`,
          role: "assistant",
          content: miraelMessage,
          timestamp: Date.now(),
        };

        addMessage(assistantMessage);

        setIsTyping(false);
      } catch (error) {
        console.error("Error:", error);
      }
    },
    [addAnalysis, addMessage, addTokenUsage, language, messages, session]
  );

  useEffect(() => {
    if (hasHydrated && !session) {
      useOpenChatSessionStore.getState().createSession(sessionId);
    }
  }, [hasHydrated, session]);

  if (!hasHydrated || !session || !messages) {
    return null;
  }

  return (
    <main className="h-screen w-screen">
      <CodeView data={{ session, messages }} className="absolute top-4 left-4 z-50 opacity-30 hover:opacity-100" />
      <Container
        messages={messages}
        isLoading={isTyping}
        renderItem={(message, index) => <MessageBubble key={index} message={message} />}
        onUserInput={(message) => handleOnSendMessage(message)}
      />
    </main>
  );
}
