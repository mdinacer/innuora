"use client";

import React, { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Container, Menu } from "@/components/chat-ui";
import { ChatErrorMessage } from "@/components/chat-ui/chat-error-message";
import FlowChatHeroCard, { FlowChatHeroProps } from "@/components/chat-ui/flow-chat/flow-chat.hero";
import { MessageBubble } from "@/components/chat-ui/open-chat";
import CodeView from "@/components/code-view";
import { Button } from "@/components/ui/button";
import { APP_CONFIG } from "@/config/app";
import { TEST_MESSAGE_AR_EN } from "@/data/test-messages";
import useChatController from "@/domains/conversation/conversation.hook";
import { useActiveSessionStore } from "@/domains/session-state";
import { ConversationMessage } from "@/domains/shared-types";
import { exportSessionAsJSON, exportSessionAsMarkdown, prepareSessionExport } from "@/lib/session/session-export";

interface Props {
  className?: string;
}

const SessionPage: React.FC<Props> = () => {
  const router = useRouter();

  const {
    session,
    isProcessing,
    lastFailedMessage,
    error: processingError,
    resetSession: handleResetSession,
    handleUserInput,
    setLastFailedMessage,
  } = useChatController();

  const { t } = useTranslation("pages/chat-ui", { keyPrefix: "chat-ui.open-chat" });

  const { title, subtitle } = useMemo(
    () => ({
      title: session?.title || t("header.title", { defaultValue: `Welcome to ${APP_CONFIG.name}` }),
      subtitle: session?.subtitle || t("header.subtitle", { defaultValue: "A gentle space to begin your reflection" }),
    }),
    [session?.subtitle, session?.title, t]
  );

  const handleSessionStart = useCallback(() => {
    const message: ConversationMessage = {
      id: "initial-message", //`assistant-${Date.now()}`,
      role: "assistant",
      content: t("initial-message", { defaultValue: "" }),
      timestamp: Date.now(),
    };
    useActiveSessionStore.getState().appendMessage(message);
  }, [t]);

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
    async (action: "reset" | "end" | "export") => {
      const { messages } = session;
      switch (action) {
        case "reset":
          await handleResetSession(session.id);

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
    [handleResetSession, router, session]
  );

  const handleRetry = useCallback(() => {
    if (lastFailedMessage) {
      handleUserInput(lastFailedMessage);
    }
  }, [lastFailedMessage, handleUserInput]);

  const handleDismissError = useCallback(() => {
    setLastFailedMessage(null);
  }, [setLastFailedMessage]);

  const handleBatchMessages = async () => {
    const messagesToTest = TEST_MESSAGE_AR_EN.map((message) => message.en);
    for (const message of messagesToTest) {
      await handleUserInput(message);
    }
  };

  return (
    <>
      <div className="p-§ absolute top-6 left-6">
        <CodeView data={session.messages} />
      </div>
      <div className="p-§ absolute top-6 right-6">
        <Button onClick={handleBatchMessages}>Test</Button>
      </div>
      <Container
        title={session?.title ?? title}
        subtitle={session?.subtitle ?? subtitle}
        messages={session.messages}
        isLoading={isProcessing}
        renderItem={(message, index) => <MessageBubble key={index} message={message} />}
        onUserInput={handleUserInput}
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
        headerActions={<Menu disabled={false} onAction={handleActions} />}
      />
    </>
  );
};

export default SessionPage;

const TEST_MESSAGES = [
  "I don’t know where to start… I just feel really overwhelmed lately.",
  "It’s like I’m holding everything together for everyone, and I’m running out of space to hold myself.",
  "Nothing is technically ‘wrong,’ but I feel this constant pressure in my chest, like I’m bracing for something.",
  "And the stupid part is… I can’t even talk about this without feeling guilty. Other people have it worse.",
  "My partner keeps saying I should just ‘take a break,’ but even resting feels like I’m failing at something.",
  "I used to handle so much with ease, and now even small things drain me. I hate this version of me.",
  "What’s confusing is that on the outside, I’m functioning. Nobody would guess anything is off.",
  "But inside, I feel exhausted in a way that doesn’t go away no matter how much I sleep.",
  "Sometimes I catch myself getting irritated at tiny things, and then I feel terrible for reacting like that.",
  "I don’t know… maybe I’m just tired of being the responsible one all the time.",
  "I just want to feel like myself again. Like I’m not dragging my body through my own life.",
];

// const tests = [
//   "I'm tired in a way that sleep doesn't fix. I keep doing everything right, and somehow it still feels off.",
//   "I shouldn't complain. My life's fine. I just feel... disconnected, I guess.",
//   "My mom never rested. She said stopping was lazy.",
//   "I wasn't raised to take breaks. You push through. That's just life.",
//   "I can't stop thinking about the things I said in that meeting. I keep replaying every moment.",
//   "I overthink because that's how I avoid mistakes. If I stop, I'll mess something up.",
//   "I keep telling myself it has to be perfect before I can rest.",
//   "If I don't do it perfectly, no one will take me seriously.",
//   "People say I'm strong, but I don't even know what that means anymore. I'm just tired of being the one who holds everything up.",
//   "I don't have time to fall apart. People depend on me.",
//   "Sometimes I feel guilty for wanting space. Like needing rest makes me selfish.",
//   "I can rest later. It's just easier to keep going than feel guilty about it.",
//   "Even when I take a break, my mind doesn't. It keeps replaying what I should've done better.",
//   "I just like being prepared. If I relax, something's bound to go wrong.",
//   "I feel nothing lately. Not sad, not happy, just blank.",
//   "I don't have time for feelings. They just get in the way.",
//   "I feel bad saying no to people I care about.",
//   "If I say no, they'll think I don't care.",
//   "I keep doing everything myself because I don't trust anyone will get it right.",
//   "I just prefer doing it myself. It's faster and less frustrating.",
//   "I feel like if I don't hold everything together, it'll all collapse.",
//   "If I don't do it, no one else will.",
//   "I stay busy all the time. If I stop, the feelings catch up.",
//   "I'm just productive. I like being busy.",
//   "No matter what I do, I still feel like I'm not enough.",
//   "I don't know, maybe I just need to work harder.",
//   "I give so much in relationships, but people rarely meet me halfway.",
//   "I just don't expect much from people anymore.",
//   "I don't know what I'm working toward anymore. Everything feels mechanical.",
//   "I just need to push through this phase. Everyone burns out sometimes.",
//   "Even when I rest, my mind keeps running.",
//   "I keep everything together, but inside I feel close to breaking.",
//   "I feel like I'm holding my breath all day.",
//   "I don't want to be here anymore. I just want it to stop.",
//   "I hurt myself last night. I didn't know what else to do.",
//   "I can't keep going like this. It hurts too much.",
// ];
