"use client";

import React, { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Container, Menu } from "@/components/chat-ui";
import FlowChatHeroCard, { FlowChatHeroProps } from "@/components/chat-ui/flow-chat/flow-chat.hero";
import { MessageBubble } from "@/components/chat-ui/open-chat";
import CodeView from "@/components/code-view";
import LoadingComponent from "@/components/loading-component";
import { useChatController } from "@/lib/ai/mirael-core/v2/use-chat-controller";
import { AppLocales } from "@/lib/i18n";
import { OpenChatMessage as ChatMessage } from "@/types/open-chat-message.types";

interface Props {
  obfuscatedSessionId: string;
}

const SessionPage: React.FC<Props> = ({ obfuscatedSessionId }) => {
  const router = useRouter();

  const {
    t,
    i18n: { language },
  } = useTranslation("pages", { keyPrefix: "chat-ui.open-chat" });

  const chatController = useChatController({
    locale: language as AppLocales,
    sessionId: obfuscatedSessionId,
  });

  const { processMessage, addMessage, resetSession } = chatController.actions;
  const { hasHydrated, session, messages, isProcessing } = chatController.state;

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
          router.push("/sessions");
          break;
        case "export":
          break;
      }
    },
    [resetSession, router]
  );

  // useEffect(() => {
  //   const handler = (event: BeforeUnloadEvent) => {
  //     // event.preventDefault();
  //     console.log("Unloading session", sessionId);

  //     //return (event.returnValue = "Are you sure you want to leave?");

  //     // Only sync data already stored locally
  //   };
  //   window.addEventListener("beforeunload", handler);
  //   return () => window.removeEventListener("beforeunload", handler);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  if (!hasHydrated) {
    return <LoadingComponent />;
  }
  if (!session || !messages) {
    return null;
  }

  return (
    <>
      <CodeView data={session} className=" absolute top-6 left-6" />
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
    </>
  );
};

export default SessionPage;
