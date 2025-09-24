"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Container, Menu } from "@/components/chat-ui";
import FlowChatHeroCard, { FlowChatHeroProps } from "@/components/chat-ui/flow-chat/flow-chat.hero";
import { MessageBubble } from "@/components/chat-ui/open-chat";
import { CreditsBalance, InsufficientCreditsWarning } from "@/components/credits";
import LoadingComponent from "@/components/loading-component";
import { PostSessionMoodPrompt } from "@/components/mood/mood-integration-hooks";
import { SyncStatusIndicator } from "@/components/session-sync/sync-status-indicator";
import { decryptSession } from "@/domains/encrypted-session/encrypted-session.crypto";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { useChatController } from "@/domains/open-chat/hooks/use-chat-controller";
import { Session } from "@/domains/open-chat/open-chat.types";
import { AppLocales } from "@/lib/i18n";
import { OpenChatMessage as ChatMessage } from "@/types/open-chat-message.types";

interface Props {
  sessionId: string;
}

const SessionPage: React.FC<Props> = ({ sessionId }) => {
  const router = useRouter();
  const [creditsError, setCreditsError] = useState<{ error: string; cost: number } | null>(null);
  const [showPostSessionMood, setShowPostSessionMood] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);

  const [decryptedSession, setDecryptedSession] = useState<Session | null>(null);
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
          setSessionEnded(false);
          setShowPostSessionMood(false);
          break;
        case "end":
          // Check if session has meaningful content before showing mood prompt
          // We need both user and AI messages for it to be meaningful
          const userMessages = messages?.filter((m) => m.role === "user") || [];
          const hasUserInput = userMessages.length > 0;
          const hasConversation = messages && messages.length > 2;

          // Show mood prompt if user has actively participated in conversation
          if (hasUserInput && hasConversation && session?.userId) {
            setSessionEnded(true);
            setShowPostSessionMood(true);
          } else {
            // No meaningful conversation or not logged in, just navigate away
            router.push("/sessions");
          }
          break;
        case "export":
          // TODO: Implement session export functionality
          break;
      }
    },
    [resetSession, router, messages, session?.userId]
  );

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

  // Subscribe to encrypted session store changes
  const encryptedSession = useSessionStore((state) => state.sessions[sessionId]);

  const handleGetDecryptedSession = useCallback(async () => {
    if (!encryptedSession) {
      setDecryptedSession(null);
      return;
    }
    const decryptedData = await decryptSession(encryptedSession);
    setDecryptedSession(decryptedData);
  }, [encryptedSession]);

  useEffect(() => {
    handleGetDecryptedSession();
  }, [handleGetDecryptedSession]);

  if (!hasHydrated) {
    return <LoadingComponent />;
  }
  if (!session) {
    return <div>Session not found</div>;
  }

  return (
    <>
      <SyncStatusIndicator sessionId={sessionId} className="absolute top-6 right-6" />

      {/* Credits Balance Display */}
      {session?.userId && (
        <div className="fixed top-20 right-6 z-40">
          <CreditsBalance />
        </div>
      )}

      {/* Credits Error Warning */}
      {creditsError && session?.userId && (
        <div className="fixed top-20 inset-x-6 z-50 max-w-lg mx-auto">
          <InsufficientCreditsWarning onPurchaseClick={() => router.push("/pricing")} />
        </div>
      )}

      {/* Post-Session Mood Prompt */}
      {showPostSessionMood && sessionEnded && (
        <PostSessionMoodPrompt
          sessionId={sessionId}
          onComplete={() => {
            setShowPostSessionMood(false);
            setSessionEnded(false);
            router.push("/sessions");
          }}
          onDismiss={() => {
            setShowPostSessionMood(false);
            setSessionEnded(false);
            router.push("/sessions");
          }}
        />
      )}

      <Container
        title={session?.title ?? title}
        subtitle={session?.subtitle ?? subtitle}
        messages={messages}
        isLoading={isProcessing}
        renderItem={(message, index) => <MessageBubble key={index} message={message} />}
        onUserInput={handleProcessMessage}
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
