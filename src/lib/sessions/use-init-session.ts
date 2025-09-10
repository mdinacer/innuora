import { useCallback, useEffect } from "react";

import { useSessionMessagesStore } from "@/stores/messages.store";
import { useSessionStore } from "@/stores/session.store";

export function useInitSessionStores({ sessionId, autoCreate = false }: { sessionId: string; autoCreate?: boolean }) {
  useEffect(() => {
    if (!autoCreate) return;
    const session = useSessionStore.getState().sessions[sessionId];
    if (!session) {
      useSessionStore.getState().createSession(sessionId);
    }
    const messages = useSessionMessagesStore.getState().sessionMessages[sessionId];
    if (!messages) {
      useSessionMessagesStore.getState().createSession(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initSessionStore = useCallback(() => {
    if (autoCreate) useSessionStore.getState().createSession(sessionId);
    useSessionMessagesStore.getState().createSession(sessionId);
  }, [autoCreate, sessionId]);

  return { initSessionStore };
}
