"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Container, Menu } from "@/components/chat-ui";
import FlowChatHeroCard, { FlowChatHeroProps } from "@/components/chat-ui/flow-chat/flow-chat.hero";
import { MessageBubble } from "@/components/chat-ui/open-chat";
import { useOpenChatSessionStore } from "@/lib/ai/mirael-core/v1/open-chat-session.store";
import { useChatController } from "@/lib/ai/mirael-core/v2/use-mirael-chat";
import { AppLocales } from "@/lib/i18n";
import { OpenChatMessage as ChatMessage } from "@/types/open-chat-message.types";

interface Props {
  sessionId: string;
  autoCreateSession?: boolean;
}

const SessionPage: React.FC<Props> = ({ sessionId, autoCreateSession = false }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("pages", { keyPrefix: "chat-ui.open-chat" });

  const miraelChat = useChatController({
    locale: language as AppLocales,
    sessionId,
    autoCreateSession: true,
  });

  const { processMessage, addMessage, resetSession } = miraelChat.actions;
  const { hasHydrated, session, messages, isProcessing } = miraelChat.state;

  const { title, subtitle } = useMemo(
    () => ({
      title: session?.title || t("header.title", { defaultValue: "Welcome to Mirael" }),
      subtitle: session?.subtitle || t("header.subtitle", { defaultValue: "A gentle space to begin your reflection" }),
    }),
    [session?.subtitle, session?.title, t]
  );

  const initialMessage = t("initial-message", { defaultValue: "" });

  const handleSessionStart = useCallback(() => {
    const message: ChatMessage = {
      id: "initial-message", //`assistant-${Date.now()}`,
      role: "assistant",
      content: initialMessage,
      timestamp: Date.now(),
    };
    addMessage(message);
  }, [addMessage, initialMessage]);

  const welcomeMessage = useMemo(() => {
    if (session?.messages?.length) return null;
    const message = t("hero", { returnObjects: true, defaultValue: {} }) as FlowChatHeroProps;
    return <FlowChatHeroCard data={message} onStartSession={handleSessionStart} />;
  }, [handleSessionStart, session?.messages?.length, t]);

  const handleActions = useCallback(
    (action: "reset" | "end" | "export") => {
      switch (action) {
        case "reset":
          resetSession();

          break;
        case "end":
          break;
        case "export":
          break;
      }
    },
    [resetSession]
  );

  useEffect(() => {
    if (!autoCreateSession) return;
    if (hasHydrated && !session) {
      useOpenChatSessionStore.getState().createSession(sessionId);
    }
  }, [autoCreateSession, hasHydrated, session, sessionId]);

  if (!hasHydrated || !session || !messages) {
    return null;
  }

  return (
    <Container
      title={session?.title ?? title}
      subtitle={session?.subtitle ?? subtitle}
      messages={messages}
      isLoading={isProcessing}
      renderItem={(message, index) => <MessageBubble key={index} message={message} />}
      onUserInput={processMessage}
      welcomeMessage={welcomeMessage}
      headerActions={
        <>
          <Menu disabled={!messages?.length} onAction={handleActions} />
        </>
      }
    />
  );
};

export default SessionPage;
