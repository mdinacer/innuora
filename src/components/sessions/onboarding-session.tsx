"use client";

import { useCallback } from "react";

import { Container } from "@/components/chat-ui";
import FlowChatMessageRenderer from "@/components/chat-ui/flow-chat/flow-chat.message-renderer";
import { SESSIONS_IDS } from "@/constants/sessions/sessions.props";
import useSessionOrchestrator from "@/lib/sessions/use-session-orchestrator";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/types/flow-chat-messages.types";
import { SessionFlow } from "@/types/flow-session.types";
import CodeView from "../code-view";
import { Button } from "../ui/button";

interface Props {
  className?: string;
  sessionFlow: SessionFlow;
}

const OnboardingSession = ({ className, sessionFlow }: Props) => {
  const {
    session,
    isReady,
    isTransitioning,
    messages,
    resetSession,
    moveToNext,
    moveToStep,
    handleUserInput,
    processUserSelection,
  } = useSessionOrchestrator({
    sessionFlow,
  });

  const renderMessage = useCallback(
    (message: ChatMessage, index: number) => (
      <FlowChatMessageRenderer
        key={index}
        message={message}
        actions={{
          moveToNextStep: moveToNext,
          moveToStep,
          onUserInput: handleUserInput,
          onUserSelect: processUserSelection,
        }}
      />
    ),
    [handleUserInput, moveToNext, moveToStep, processUserSelection]
  );

  if (sessionFlow.id !== SESSIONS_IDS.ONBOARDING_SESSION) {
    throw new Error(`Invalid session id: ${sessionFlow.id}`);
  }

  // Optional: skip rendering until hydration completes
  if (!isReady) {
    return null;
  }

  return (
    <div className={cn("relative", className)}>
      <CodeView data={session} className="absolute top-4 left-4 z-50 opacity-30 hover:opacity-100" />
      <Button onClick={() => resetSession()} variant="outline" size="sm" className="absolute right-4 top-4">
        Reset
      </Button>
      <div className="max-w-4xl w-full mx-auto flex ">
        <Container messages={messages} isLoading={isTransitioning} renderItem={renderMessage} />
      </div>
    </div>
  );
};

export default OnboardingSession;
