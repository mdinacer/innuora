"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { updateCurrentUser } from "@/app/actions/user-actions";
import { Container } from "@/components/chat-ui";
import FlowChatMessageRenderer from "@/components/chat-ui/flow-chat/flow-chat.message-renderer";
import CodeView from "@/components/code-view";
import { Button } from "@/components/ui/button";
import { SESSIONS_IDS } from "@/lib/constants/sessions/sessions.props";
import useFlowStepController from "@/lib/sessions/use-flow-step-controller";
import useSessionOrchestrator from "@/lib/sessions/use-session-orchestrator";
import { cn } from "@/lib/utils";
import { userProfileSchema } from "@/lib/zod/user-profile-schema";
import { useUserDataStore } from "@/stores/user-data.store";
import { ChatMessage } from "@/types/flow-chat-messages.types";
import { SessionFlow } from "@/types/flow-session.types";
import FlowChatHeroCard, { FlowChatHeroProps } from "../chat-ui/flow-chat/flow-chat.hero";

interface Props {
  className?: string;
  sessionFlow: SessionFlow;
}

const OnboardingSession = ({ className, sessionFlow }: Props) => {
  const { t } = useTranslation("common", { keyPrefix: "chat-ui.onboarding" });

  const { title, subtitle, welcomeMessage } = {
    title: t("header.title", { defaultValue: "Welcome to Mirael" }),
    subtitle: t("header.subtitle", { defaultValue: "A gentle space to begin your reflection" }),
    welcomeMessage: t("hero", { returnObjects: true, defaultValue: {} }) as FlowChatHeroProps,
  };
  const router = useRouter();
  const { setProfile } = useUserDataStore();
  const {
    isReady,
    isTransitioning,
    messages,
    session,
    handleUserInput,
    moveToNext,
    moveToStep,
    processUserSelection,
    resetSession,
    startFlow,
  } = useSessionOrchestrator({
    sessionFlow,
    autoStart: false,
  });

  const handleFlowEndAction = useCallback(
    (actionType: "primary" | "secondary") => {
      if (actionType === "primary") {
        router.replace("/sessions");
        resetSession();
      }
    },
    [resetSession, router]
  );

  const renderMessage = useCallback(
    (message: ChatMessage, index: number) => {
      const isCurrentStep = message.flowStepId === session?.currentStepId;
      return (
        <FlowChatMessageRenderer
          key={index}
          message={message}
          isCurrentStep={isCurrentStep}
          onFlowEnd={handleFlowEndAction}
          actions={{
            moveToNextStep: moveToNext,
            moveToStep,
            onUserInput: handleUserInput,
            onUserSelect: processUserSelection,
          }}
        />
      );
    },
    [handleFlowEndAction, handleUserInput, moveToNext, moveToStep, processUserSelection, session?.currentStepId]
  );

  const handleSyncData = useCallback(
    async (data: Record<string, unknown>) => {
      try {
        const parsedData = userProfileSchema.safeParse(data);

        if (!parsedData.success) {
          throw parsedData.error;
        }

        const updates = await updateCurrentUser({
          isOnboarded: true,
          profile: {
            update: parsedData.data,
          },
        });

        setProfile(updates.profile);
        console.log("Synced data:", updates);
      } catch (error) {
        console.error("Error syncing data:", error);
      }
    },
    [setProfile]
  );

  useFlowStepController({
    sessionFlow,
    callbacks: {
      onSyncData: (args) => handleSyncData(args || {}),
    },
  });

  if (sessionFlow.id !== SESSIONS_IDS.ONBOARDING_SESSION) {
    throw new Error(`Invalid session id: ${sessionFlow.id}`);
  }

  if (!isReady) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <CodeView
        data={{ session, messages, sessionFlow }}
        className="absolute top-4 left-4 z-50 opacity-30 hover:opacity-100"
      />
      <Button onClick={() => resetSession()} variant="outline" size="sm" className="absolute right-4 top-4">
        Reset
      </Button>
      <div className="max-w-4xl w-full mx-auto flex ">
        <Container
          title={title}
          subtitle={subtitle}
          messages={messages}
          isLoading={isTransitioning}
          renderItem={renderMessage}
          welcomeMessage={
            session.isFlowStarted ? undefined : <FlowChatHeroCard data={welcomeMessage} onStartSession={startFlow} />
          }
        />
      </div>
    </div>
  );
};

export default OnboardingSession;
