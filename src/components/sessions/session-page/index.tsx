"use client";

import React, { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Container, Menu } from "@/components/chat-ui";
import { ChatErrorMessage } from "@/components/chat-ui/chat-error-message";
import FlowChatHeroCard, { FlowChatHeroProps } from "@/components/chat-ui/flow-chat/flow-chat.hero";
import { MessageBubble } from "@/components/chat-ui/open-chat";
import CodeView from "@/components/code-view";
import { CreditsBalance, InsufficientCreditsWarning } from "@/components/credits";
import LoadingComponent from "@/components/loading-component";
import { APP_CONFIG } from "@/config/app";
import { useChatController } from "@/domains/open-chat/hooks/use-chat-controller";
import { cloudSyncService } from "@/domains/simple-session-sync";
import { AppLocales } from "@/lib/i18n";
import { exportSessionAsJSON, exportSessionAsMarkdown, prepareSessionExport } from "@/lib/session/session-export";
import { OpenChatMessage as ChatMessage } from "@/types/open-chat-message.types";

interface Props {
  sessionId: string;
}

const SessionPage: React.FC<Props> = ({ sessionId }) => {
  cloudSyncService.startPeriodicSync();
  const router = useRouter();
  const [creditsError, setCreditsError] = useState<{ error: string; cost: number } | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  const {
    t,
    i18n: { language },
  } = useTranslation("pages", { keyPrefix: "chat-ui.open-chat" });

  const chatController = useChatController({
    locale: language as AppLocales,
    sessionId,
  });

  const { processMessage, addMessage, resetSession } = chatController.actions;
  const { hasHydrated, session, messages, isProcessing, processingError } = chatController.state;

  const { title, subtitle } = useMemo(
    () => ({
      title: session?.title || t("header.title", { defaultValue: `Welcome to ${APP_CONFIG.name}` }),
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
    const message = t("hero", {
      returnObjects: true,
      defaultValue: {},
      app_name: APP_CONFIG.name,
    }) as FlowChatHeroProps;
    return <FlowChatHeroCard data={message} onStartSession={handleSessionStart} />;
  }, [handleSessionStart, session?.messages?.length, t]);

  const handleActions = useCallback(
    (action: "reset" | "end" | "export") => {
      switch (action) {
        case "reset":
          resetSession();

          break;
        case "end":
          // Check if session has meaningful content before showing mood prompt
          // We need both user and AI messages for it to be meaningful
          const userMessages = messages?.filter((m) => m.role === "user") || [];
          const hasUserInput = userMessages.length > 0;
          const hasConversation = messages && messages.length > 2;

          // Show mood prompt if user has actively participated in conversation
          if (hasUserInput && hasConversation && session?.userId) {
          } else {
            // No meaningful conversation or not logged in, just navigate away
            router.push("/sessions");
          }
          break;
        case "export":
          if (session && messages) {
            const exportData = prepareSessionExport(
              session.id,
              session.title,
              session.subtitle ?? undefined,
              messages,
              session.createdAt.toISOString()
            );
            // Export as both JSON and Markdown
            exportSessionAsJSON(exportData);
            exportSessionAsMarkdown(exportData);
          }
          break;
      }
    },
    [resetSession, router, messages, session]
  );

  const handleProcessMessage = useCallback(
    async (message: string) => {
      try {
        setCreditsError(null); // Clear any previous credits errors
        setLastFailedMessage(null); // Clear previous failed message
        const result = await processMessage(message);

        // Check if there was an error in the result
        if (result?.error) {
          setLastFailedMessage(message);
        }

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
          setLastFailedMessage(message);
          return { error: error.message };
        }

        // For other errors, save the message for retry
        setLastFailedMessage(message);

        // Re-throw other errors
        throw error;
      }
    },
    [processMessage]
  );

  const handleRetry = useCallback(() => {
    if (lastFailedMessage) {
      handleProcessMessage(lastFailedMessage);
    }
  }, [lastFailedMessage, handleProcessMessage]);

  const handleDismissError = useCallback(() => {
    setLastFailedMessage(null);
  }, []);

  if (!hasHydrated) {
    return <LoadingComponent />;
  }
  if (!session) {
    return <div>Session not found</div>;
  }

  return (
    <>
      <CodeView data={session} className="absolute top-6 left-6 hover:z-50" />
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

      <Container
        title={session?.title ?? title}
        subtitle={session?.subtitle ?? subtitle}
        messages={messages}
        isLoading={isProcessing}
        renderItem={(message, index) => <MessageBubble key={index} message={message} />}
        onUserInput={handleProcessMessage}
        welcomeMessage={welcomeMessage}
        errorMessage={
          processingError ? (
            <ChatErrorMessage
              errorMessage={processingError}
              onRetry={lastFailedMessage ? handleRetry : undefined}
              onDismiss={handleDismissError}
            />
          ) : null
        }
        headerActions={<Menu disabled={!messages?.length} onAction={handleActions} />}
      />
    </>
  );
};

export default SessionPage;
