"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@prisma/client";
import { useTranslation } from "react-i18next";

import { Container } from "@/components/chat-ui";
import FlowChatHeroCard, { FlowChatHeroProps } from "@/components/chat-ui/flow-chat/flow-chat.hero";
import FlowChatMessageRenderer from "@/components/chat-ui/flow-chat/flow-chat.message-renderer";
import { APP_CONFIG } from "@/config/app";
import { SESSIONS_IDS } from "@/domains/session-flow/constants/sessions.props";
import { useSessionFlowOrchestrator } from "@/domains/session-flow/hooks/use-session-flow-orchestrator";
import useFlowStepController from "@/domains/session-flow/hooks/use-session-flow-step-controller";
import { cn } from "@/lib/utils";
import { useUserDataStore } from "@/stores/user-data.store";
import { ChatMessage } from "@/types/flow-chat-messages.types";
import { SessionFlow } from "@/types/flow-session.types";
import LanguageDropdown from "../language-dropdown";

interface Props {
  className?: string;
  sessionFlow: SessionFlow;
}

const OnboardingSession = ({ className, sessionFlow }: Props) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("pages", { keyPrefix: "chat-ui.onboarding" });

  const { title, subtitle } = {
    title: t("header.title", { app_name: APP_CONFIG.name, defaultValue: `Welcome to ${APP_CONFIG.name}` }),
    subtitle: t("header.subtitle", { defaultValue: "A gentle space to begin your reflection" }),
  };
  const router = useRouter();
  const { setProfile } = useUserDataStore();
  const {
    isTransitioning,
    messages,
    session,
    handleUserInput,
    moveToNext,
    moveToStep: jumpToStep,
    processUserSelection,
    resetSession,
    startFlow,
  } = useSessionFlowOrchestrator({
    sessionFlow,
    autoStart: true,
    initializeStores: true,
  });

  useFlowStepController({
    sessionFlow,
    options: {
      autoCreateMessages: true,
    },
  });

  const handleFlowEndAction = useCallback(
    (actionType: "primary" | "secondary") => {
      if (actionType === "primary") {
        const inputValues = session?.inputValues || {};
        console.log("inputValues", inputValues);

        setProfile(inputValues as Profile);
        router.replace("/sessions");
        resetSession();
      }
    },
    [resetSession, router, session?.inputValues, setProfile]
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
            moveToStep: jumpToStep,
            onUserInput: handleUserInput,
            onUserSelect: processUserSelection,
          }}
        />
      );
    },
    [handleFlowEndAction, handleUserInput, moveToNext, jumpToStep, processUserSelection, session?.currentStepId]
  );

  const welcomeMessageContent = useMemo(() => {
    if (session?.hasStarted) return null;
    const data = t("hero", { returnObjects: true, defaultValue: "" }) as FlowChatHeroProps | undefined;

    if (!data) return null;
    return <FlowChatHeroCard data={data} onStartSession={startFlow} />;
  }, [session?.hasStarted, startFlow, t]);

  useEffect(() => {
    resetSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  if (sessionFlow.id !== SESSIONS_IDS.ONBOARDING_SESSION) {
    throw new Error(`Invalid session id: ${sessionFlow.id}`);
  }

  if (!session) {
    return null;
  }

  return (
    <div className={cn("max-w-4xl w-full mx-auto flex", className)}>
      <Container
        title={title}
        subtitle={subtitle}
        messages={messages}
        isLoading={isTransitioning}
        renderItem={renderMessage}
        headerActions={
          <>
            <LanguageDropdown />
          </>
        }
        welcomeMessage={welcomeMessageContent}
      />
    </div>
  );
};

export default OnboardingSession;
