"use client";

import React, { useEffect } from "react";

import { SESSIONS_IDS } from "@/constants/sessions/sessions.props";
import { useSessionFlowEngine } from "@/lib/sessions/use-session-flow";
import { cn } from "@/lib/utils";
import { SessionFlowState, useSessionStore } from "@/stores/session-store";
import { SessionFlow } from "@/types/flow-session.types";
import { Button } from "../ui/button";

interface Props {
  className?: string;
  sessionFlow: SessionFlow;
}

const OnboardingSession = ({ className, sessionFlow }: Props) => {
  const hasHydrated = useSessionStore((state) => state.hasHydrated);
  const session = useSessionStore((state) => state.sessions[sessionFlow.id]) as SessionFlowState | undefined;
  const createSession = useSessionStore((state) => state.createSession);

  const { currentStepId, startFlow, moveToNext, isTransitioning } = useSessionFlowEngine(sessionFlow);

  // Enforce session existence after hydration
  useEffect(() => {
    if (hasHydrated && !session) {
      createSession(sessionFlow.id);
    }
  }, [hasHydrated, session, sessionFlow.id, createSession]);

  useEffect(() => {
    if (session && !session.isFlowStarted) startFlow();
  }, [session, startFlow]);

  if (sessionFlow.id !== SESSIONS_IDS.ONBOARDING_SESSION) {
    throw new Error(`Invalid session id: ${sessionFlow.id}`);
  }

  // Optional: skip rendering until hydration completes
  if (!hasHydrated) {
    return null;
  }

  return (
    <div className={cn("", className)}>
      <p>{hasHydrated ? "Hydrated" : "Not hydrated"}</p>
      <div className="max-w-4xl mx-auto flex ">
        <p className="whitespace-pre text-sm">
          {JSON.stringify(
            {
              currentStepId,
              isTransitioning,
              session,
            },
            null,
            2
          )}
        </p>
        <Button onClick={moveToNext}>Next</Button>
      </div>
    </div>
  );
};

export default OnboardingSession;
