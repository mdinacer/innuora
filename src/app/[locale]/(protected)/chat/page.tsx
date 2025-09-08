"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Profile } from "@prisma/client";
import { useTranslation } from "react-i18next";

import { Container, Menu } from "@/components/chat-ui";
import FlowChatHeroCard, { FlowChatHeroProps } from "@/components/chat-ui/flow-chat/flow-chat.hero";
import { MessageBubble } from "@/components/chat-ui/open-chat";
import CodeView from "@/components/code-view";
import { handleUserInput } from "@/lib/ai/mirael-core/v2/mirael-chat.action";
import { useOpenChatSessionStore } from "@/lib/ai/mirael-core/v2/open-chat-session.store";
import { useOpenChat } from "@/lib/ai/mirael-core/v2/use-open-chat";
import useSummarizeChat from "@/lib/ai/shared/chat-summary/chat-summary.hook";
import { generateMessageId } from "@/lib/chat/flow/generate-id";
import { MODELS_CODES } from "@/lib/constants/ai-models";
import { AppLocales } from "@/lib/i18n";
import { useUserDataStore } from "@/stores/user-data.store";
import { OpenChatMessage as ChatMessage, OpenChatMessage } from "@/types/open-chat-message.types";

const sessionId = "test-session";
const MODEL_CODE = MODELS_CODES.M2;

const mockUserProfile: Profile = {
  id: "user_demo_001",
  createdAt: new Date("2025-09-08T12:00:00Z"),
  updatedAt: new Date("2025-09-08T12:00:00Z"),
  userId: "demo_user_001",
  displayName: "Sara",
  ageGroup: "Age25_34",
  identityConnection: "conflicted",
  copingMechanism: "push_through",
  socialPressureSources: ["family", "work_or_school", "self"],
  emotionalConcerns: ["burnout", "anxiety", "self_worth", "overthinking"],
  emotionalAspirations: ["clarity", "self_compassion", "calm"],
};

export default function ChatRoute() {
  const userProfile = useUserDataStore((state) => state.profile);
  const {
    t,
    i18n: { language },
  } = useTranslation("pages", { keyPrefix: "chat-ui.open-chat" });

  const { title, subtitle, welcomeMessage, initialMessage } = {
    title: t("header.title", { defaultValue: "Welcome to Mirael" }),
    subtitle: t("header.subtitle", { defaultValue: "A gentle space to begin your reflection" }),
    welcomeMessage: t("hero", { returnObjects: true, defaultValue: {} }) as FlowChatHeroProps,
    initialMessage: t("initial-message", { defaultValue: "" }),
  };
  const [isTyping, setIsTyping] = useState(false);

  const { session, messages, addMessage, addAnalysis, addTokenUsage, resetSession, hasHydrated } = useOpenChat({
    sessionId,
    autoCreateSession: true,
  });

  const dataSummary = useSummarizeChat({ sessionId });
  const [hasStarted, setHasStarted] = useState(hasHydrated && !!messages && !!messages.length);

  const handleOnSendMessage = useCallback(
    async (message: string) => {
      console.log("handleOnSendMessage", message);

      if (!session) return;

      const userMessage: ChatMessage = {
        id: generateMessageId(`user-message-${session.id}`), //`user-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: Date.now(),
      };
      addMessage(userMessage);
      try {
        setIsTyping(true);

        // Take Last three analysis
        const prevAnalysis = session.analysis ? session.analysis.slice(-3) : [];

        const result = await handleUserInput(
          message,
          prevAnalysis,
          messages,
          mockUserProfile,
          language as AppLocales,
          MODEL_CODE
          //session.modelCode || MODEL_CODE
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

  const handleSessionStart = useCallback(() => {
    const message: OpenChatMessage = {
      id: "initial-message", //`assistant-${Date.now()}`,
      role: "assistant",
      content: initialMessage,
      timestamp: Date.now(),
    };
    addMessage(message);
    setHasStarted(true);
  }, [addMessage, initialMessage]);

  useEffect(() => {
    if (hasHydrated && !session) {
      useOpenChatSessionStore.getState().createSession(sessionId);
    }
  }, [hasHydrated, session]);

  const welcomeMessageContent = useMemo(() => {
    if (hasStarted || !welcomeMessage || messages?.length) return null;
    return <FlowChatHeroCard data={welcomeMessage} onStartSession={handleSessionStart} />;
  }, [handleSessionStart, hasStarted, messages?.length, welcomeMessage]);

  const handleActions = useCallback(
    (action: "reset" | "end" | "export") => {
      switch (action) {
        case "reset":
          resetSession();
          setHasStarted(false);
          break;
        case "end":
          break;
        case "export":
          break;
      }
    },
    [resetSession]
  );

  if (!hasHydrated || !session || !messages) {
    return null;
  }

  return (
    <main className="h-screen w-screen standalone:w-full">
      <CodeView
        data={{ dataSummary, session, messages }}
        className="absolute top-4 left-4 z-50 opacity-30 hover:opacity-100"
      />
      <Container
        title={title}
        subtitle={subtitle}
        messages={messages}
        isLoading={isTyping}
        renderItem={(message, index) => <MessageBubble key={index} message={message} />}
        onUserInput={(message) => handleOnSendMessage(message)}
        welcomeMessage={welcomeMessageContent}
        headerActions={
          <>
            <Menu disabled={!messages?.length} onAction={handleActions} />
          </>
        }
      />
    </main>
  );
}
