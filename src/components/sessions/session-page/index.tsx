"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Container, Menu } from "@/components/chat-ui";
import FlowChatHeroCard, { FlowChatHeroProps } from "@/components/chat-ui/flow-chat/flow-chat.hero";
import { MessageBubble } from "@/components/chat-ui/open-chat";
import CodeView from "@/components/code-view";
import { CreditsBalance, InsufficientCreditsWarning } from "@/components/credits";
import LoadingComponent from "@/components/loading-component";
import { SyncStatusIndicator } from "@/components/session-sync/sync-status-indicator";
import { getDecryptedStoreSession } from "@/domains/encrypted-session/encrypted-session.utils";
import { useChatController } from "@/domains/open-chat/hooks/use-chat-controller";
import { AppLocales } from "@/lib/i18n";
import { OpenChatMessage as ChatMessage } from "@/types/open-chat-message.types";

interface Props {
  sessionId: string;
}

const SessionPage: React.FC<Props> = ({ sessionId }) => {
  const router = useRouter();
  const [creditsError, setCreditsError] = useState<{ error: string; cost: number } | null>(null);

  const {
    t,
    i18n: { language },
  } = useTranslation("pages", { keyPrefix: "chat-ui.open-chat" });

  const chatController = useChatController({
    locale: language as AppLocales,
    sessionId,
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

  const getDecryptedSession = useCallback(async () => await getDecryptedStoreSession(sessionId), [sessionId]);

  const handleProcessMessage = useCallback(
    async (message: string) => {
      try {
        setCreditsError(null); // Clear any previous credits errors
        const result = await processMessage(message);

        // Message processed successfully
        return result;
      } catch (error) {
        // Handle credits-related errors
        if (error instanceof Error && error.message.includes("Insufficient credits")) {
          const match = error.message.match(/Estimated cost: (\d+) credits/);
          const cost = match ? parseInt(match[1]) : 5; // Default estimate
          setCreditsError({
            error: error.message,
            cost,
          });
          return { error: error.message };
        }

        // Re-throw other errors
        throw error;
      }
    },
    [processMessage]
  );

  if (!hasHydrated) {
    return <LoadingComponent />;
  }
  if (!session) {
    return <div>Session not found</div>;
  }

  return (
    <>
      <SyncStatusIndicator sessionId={sessionId} className="absolute top-6 right-6" />
      <CodeView
        data={{ sessionId, session, encryptedSession: getDecryptedSession().then((session) => session) }}
        className="absolute top-6 left-6 hover:z-50 "
      />

      {/* Credits Balance Display */}
      {session?.userId && (
        <div className="fixed top-20 right-6 z-40">
          <CreditsBalance userId={session.userId} />
        </div>
      )}

      {/* Credits Error Warning */}
      {creditsError && session?.userId && (
        <div className="fixed top-20 inset-x-6 z-50 max-w-lg mx-auto">
          <InsufficientCreditsWarning
            required={creditsError.cost}
            userId={session.userId}
            onPurchaseClick={() => router.push("/pricing")}
          />
        </div>
      )}

      <Container
        title={session?.title ?? title}
        subtitle={session?.subtitle ?? subtitle}
        messages={messages}
        isLoading={isProcessing}
        renderItem={(message, index) => <MessageBubble key={index} message={message} />}
        onUserInput={handleProcessMessage}
        welcomeMessage={welcomeMessage}
        userId={session?.userId}
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
