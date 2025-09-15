import { useCallback, useEffect, useState } from "react";

import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { useActiveSessionStore } from "@/lib/ai/mirael-core/v2/stores/active-session.store";
import { useEncryptedChatSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-chat-session.store";
import { sessionSyncManager } from "@/lib/session-sync/session-sync-manager";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface OpenChatProps {
  sessionId: string; // Obfuscated Session ID
}

export function useChatSessionState({ sessionId }: OpenChatProps) {
  const [loaded, setLoaded] = useState(false);

  // Subscribe only to state values we need to react to
  const currentSession = useActiveSessionStore((state) => state.currentSession);
  const obfuscatedId = useActiveSessionStore((state) => state.obfuscatedId);
  const activeHasHydrated = useActiveSessionStore((state) => state.hasHydrated);

  const encryptedHasHydrated = useEncryptedChatSessionStore((state) => state.hasHydrated);
  const sessionExists = useEncryptedChatSessionStore((state) => state.sessionExists);

  // Auto-sync logic integrated directly here
  const triggerSync = useCallback(() => {
    if (currentSession && obfuscatedId) {
      sessionSyncManager.queueSync(currentSession.id, obfuscatedId, "update", currentSession);
    }
  }, [currentSession, obfuscatedId]);

  // Load session on mount
  useEffect(() => {
    if (!encryptedHasHydrated || !activeHasHydrated) return;
    const loadSessionAsync = async () => {
      const isLoaded = await useActiveSessionStore.getState().loadSession(sessionId);
      setLoaded(isLoaded);
    };
    loadSessionAsync();
  }, [sessionId, encryptedHasHydrated, activeHasHydrated]);

  // Wrapped actions with auto-sync
  const addMessage = useCallback(
    (message: OpenChatMessage) => {
      useActiveSessionStore.getState().addMessage(message);
      triggerSync();
    },
    [triggerSync]
  );

  const appendMessage = useCallback(
    (content: string, role: "user" | "assistant") => {
      useActiveSessionStore.getState().appendMessage(content, role);
      triggerSync();
    },
    [triggerSync]
  );

  const addAnalysis = useCallback(
    (analysis: StateAnalysis) => {
      useActiveSessionStore.getState().addAnalysis(analysis);
      triggerSync();
    },
    [triggerSync]
  );

  const addTokenUsage = useCallback(
    (tokenUsage: ModelTokenUsage) => {
      useActiveSessionStore.getState().addTokenUsage(tokenUsage);
      triggerSync();
    },
    [triggerSync]
  );

  const updateSession = useCallback(
    (update: Partial<Session> | ((session: Session) => Session)) => {
      useActiveSessionStore.getState().updateSession(update);
      triggerSync();
    },
    [triggerSync]
  );

  const resetSession = useCallback(() => {
    useActiveSessionStore.getState().resetSession();

    // Also reset in encrypted store
    if (obfuscatedId) {
      useEncryptedChatSessionStore.getState().resetSession(obfuscatedId);
    }
  }, [obfuscatedId]);

  return {
    // State
    hasHydrated: encryptedHasHydrated && activeHasHydrated,
    session: currentSession,
    sessionExists: sessionExists(sessionId),
    obfuscatedId,
    isReady: encryptedHasHydrated && activeHasHydrated && loaded,

    // Auto-sync actions
    addMessage,
    appendMessage,
    addAnalysis,
    addTokenUsage,
    updateSession,
    resetSession,
    resetEncryptedSession: () => useEncryptedChatSessionStore.getState().resetSession(sessionId),

    // Session management
    loadSession: useActiveSessionStore.getState().loadSession,

    // Sync status
    getSyncStatus: () => {
      return currentSession ? sessionSyncManager.getSyncStatus(currentSession.id) : "synced";
    },
    getLastSyncTime: () => {
      return currentSession ? sessionSyncManager.getLastSyncTime(currentSession.id) : null;
    },
    manualSync: triggerSync,
  };
}
