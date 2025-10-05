"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcwIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { updateCurrentUser } from "@/app/actions/user-actions";
import { Container } from "@/components/chat-ui";
import FlowChatHeroCard, { FlowChatHeroProps } from "@/components/chat-ui/flow-chat/flow-chat.hero";
import FlowChatMessageRenderer from "@/components/chat-ui/flow-chat/flow-chat.message-renderer";
import LanguageDropdown from "@/components/language-dropdown";
import { APP_CONFIG } from "@/config/app";
import { SESSIONS_IDS } from "@/domains/session-flow/constants/sessions.props";
import { useFlowSession } from "@/domains/session-flow/hooks/use-flow-session";
import { cn } from "@/lib/utils";
import { useAppUserStore } from "@/stores/app-user.store";
import { ChatMessage } from "@/types/flow-chat-messages.types";
import { SessionFlow, UserOption } from "@/types/flow-session.types";
import { Button } from "../mir-ui/button";

interface Props {
  className?: string;
  sessionFlow: SessionFlow;
}

const OnboardingSession = ({ className, sessionFlow }: Props) => {
  const router = useRouter();
  const {
    t,
    i18n: { language },
  } = useTranslation("pages", { keyPrefix: "chat-ui.onboarding" });

  const { title, subtitle } = {
    title: t("header.title", { app_name: APP_CONFIG.name, defaultValue: `Welcome to ${APP_CONFIG.name}` }),
    subtitle: t("header.subtitle", { defaultValue: "A gentle space to begin your reflection" }),
  };
  const { updateUser } = useAppUserStore();

  const {
    session,
    currentStep,
    messages,
    responses,
    start: startFlow,
    advance: moveToNext,
    goToStep: jumpToStep,
    handleUserInput,
    handleUserSelect,
    reset: resetSession,
  } = useFlowSession({
    sessionId: SESSIONS_IDS.ONBOARDING_SESSION,
    flow: sessionFlow,
    autoStart: true,
  });

  const handleFlowEndAction = useCallback(
    async (actionType: "primary" | "secondary") => {
      if (actionType === "primary") {
        const { data } = await updateCurrentUser({ profile: { update: responses }, isOnboarded: true });

        if (data) {
          updateUser(data);
        }
        router.push("/sessions");
        resetSession();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [responses, updateUser]
  );

  const renderMessage = useCallback(
    (message: ChatMessage, index: number) => {
      const isCurrentStep = message.flowStepId === currentStep?.id;
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
            onUserSelect: (key: string, selection: UserOption | UserOption[]) => {
              const labels = Array.isArray(selection) ? selection.map((s) => s.label) : selection.label;
              handleUserSelect(key, Array.isArray(selection) ? selection.map((s) => s.value) : selection.value, labels);
            },
          }}
        />
      );
    },
    [handleFlowEndAction, handleUserInput, handleUserSelect, moveToNext, jumpToStep, currentStep?.id]
  );

  const welcomeMessageContent = useMemo(() => {
    if (session) return null;
    const data = t("hero", { returnObjects: true, defaultValue: "", app_name: APP_CONFIG.name }) as
      | FlowChatHeroProps
      | undefined;

    if (!data) return null;
    return <FlowChatHeroCard data={data} onStartSession={startFlow} />;
  }, [session, startFlow, t]);

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
        isLoading={false}
        renderItem={renderMessage}
        headerActions={
          <>
            <LanguageDropdown />
            <Button
              disabled={session.messages.length < 3}
              variant={"ghost"}
              size={"icon"}
              onClick={resetSession}
              aria-label={t("reset", { defaultValue: "Reset" })}
            >
              <RefreshCcwIcon aria-hidden="true" />
              <span className="sr-only">{t("reset", { defaultValue: "Reset" })}</span>
            </Button>
          </>
        }
        welcomeMessage={welcomeMessageContent}
      />
    </div>
  );
};

export default OnboardingSession;
