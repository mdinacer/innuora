import { useCallback, useEffect, useMemo } from "react";

import { useSessionMessagesStore } from "@/stores/messages-store";
import { useSessionStore } from "@/stores/session-store";

export function useInitSessionStores({ sessionId, autoCreate = false }: { sessionId: string; autoCreate?: boolean }) {
  const hasSessionHydrated = useSessionStore((state) => state.hasHydrated);
  const hasMessagesHydrated = useSessionMessagesStore((state) => state.hasHydrated);

  const hasStoresHydrated = useMemo(
    () => hasSessionHydrated && hasMessagesHydrated,
    [hasSessionHydrated, hasMessagesHydrated]
  );

  useEffect(() => {
    if (!hasStoresHydrated || !autoCreate) return;
    const session = useSessionStore.getState().sessions[sessionId];
    if (!session) {
      useSessionStore.getState().createSession(sessionId);
    }
    const messages = useSessionMessagesStore.getState().sessionMessages[sessionId];
    if (!messages) {
      useSessionMessagesStore.getState().createSession(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStoresHydrated]);

  const initSessionStore = useCallback(() => {
    if (autoCreate || !hasStoresHydrated) useSessionStore.getState().createSession(sessionId);
    useSessionMessagesStore.getState().createSession(sessionId);
  }, [autoCreate, hasStoresHydrated, sessionId]);

  return { initSessionStore };
}
