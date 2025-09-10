import { useCallback } from "react";

import { useOpenChatSessionStore } from "@/lib/ai/mirael-core/v2/open-chat-session.store";
import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface OpenChatProps {
  sessionId: string;
}

export function useChatSessionState({ sessionId }: OpenChatProps) {
  const hasHydrated = useOpenChatSessionStore((state) => state.hasHydrated);
  const session = useOpenChatSessionStore((state) => state.getSession(sessionId));

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

  const updateSession = useCallback(
    (updates: Partial<Session> | ((session: Session) => Session)) => {
      useOpenChatSessionStore.getState().updateSession(sessionId, updates);
    },
    [sessionId]
  );

  const resetSession = useCallback(() => {
    useOpenChatSessionStore.getState().resetSession(sessionId);
  }, [sessionId]);

  return {
    hasHydrated,
    session,
    addAnalysis,
    addMessage,
    addTokenUsage,
    resetSession,
    updateSession,
  };
}
