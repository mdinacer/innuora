import { useCallback, useEffect } from "react";

import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { useActiveSessionStore } from "@/lib/ai/mirael-core/v2/stores/active-session.store";
import { useEncryptedChatSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-chat-session.store";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface OpenChatProps {
  sessionId: string;
}

export function useChatSessionState({ sessionId }: OpenChatProps) {
  const hasHydrated = useEncryptedChatSessionStore((state) => state.hasHydrated);
  const currentSession = useActiveSessionStore((state) => state.currentSession);
  const loadSession = useActiveSessionStore((state) => state.loadSession);
  const sessionExists = useEncryptedChatSessionStore((state) => state.sessionExists(sessionId));

  const addMessage = useCallback((message: OpenChatMessage) => {
    useActiveSessionStore.getState().addMessage(message);
  }, []);
  const appendMessage = useCallback((content: string, role: "user" | "assistant") => {
    useActiveSessionStore.getState().appendMessage(content, role);
  }, []);

  const addAnalysis = useCallback((analysis: StateAnalysis) => {
    useActiveSessionStore.getState().addAnalysis(analysis);
  }, []);

  const addTokenUsage = useCallback((tokenUsage: ModelTokenUsage) => {
    useActiveSessionStore.getState().addTokenUsage(tokenUsage);
  }, []);

  const updateSession = useCallback((updates: Partial<Session> | ((session: Session) => Session)) => {
    useActiveSessionStore.getState().updateSession(updates);
  }, []);

  const resetSession = useCallback(() => {
    useActiveSessionStore.getState().resetSession();
  }, []);

  useEffect(() => {
    if (hasHydrated && !currentSession && sessionExists) {
      loadSession(sessionId);
    }
  }, [currentSession, hasHydrated, sessionExists, sessionId, loadSession]);

  return {
    hasHydrated,
    session: currentSession,
    sessionExists,
    addAnalysis,
    addMessage,
    addTokenUsage,
    appendMessage,
    resetSession,
    updateSession,
  };
}
