import { useCallback, useEffect } from "react";

import { useOpenChatSessionStore } from "@/stores/open-chat-session.store";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { StateAnalysis } from "../ai/mirael-core/v1/state-analysis/state-analysis.schema";

interface OpenChatProps {
  sessionId: string;
  autoCreateSession?: boolean;
}

export function useOpenChat({ sessionId, autoCreateSession = false }: OpenChatProps) {
  const hasHydrated = useOpenChatSessionStore((state) => state.hasHydrated);
  const session = useOpenChatSessionStore((state) => state.getSession(sessionId));
  const messages = useOpenChatSessionStore((state) => state.getSession(sessionId))?.messages;

  const addMessage = useCallback(
    (message: OpenChatMessage) => {
      useOpenChatSessionStore.getState().addMessage(sessionId, message);
    },
    [sessionId]
  );

  const addAnalysis = useCallback(
    (analysis: StateAnalysis) => {
      useOpenChatSessionStore.getState().addAnalysis(sessionId, analysis);
    },
    [sessionId]
  );

  const addTokenUsage = useCallback(
    (tokenUsage: ModelTokenUsage) => {
      useOpenChatSessionStore.getState().addTokenUsage(sessionId, tokenUsage);
    },
    [sessionId]
  );

  const resetSession = useCallback(() => {
    useOpenChatSessionStore.getState().resetSession(sessionId);
  }, [sessionId]);

  useEffect(() => {
    if (autoCreateSession && hasHydrated && !session) {
      useOpenChatSessionStore.getState().createSession(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, session]);

  return { hasHydrated, messages, session, addMessage, addAnalysis, addTokenUsage, resetSession };
}
