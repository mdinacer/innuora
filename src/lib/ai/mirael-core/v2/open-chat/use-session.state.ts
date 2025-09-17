import { useCallback, useEffect, useState } from "react";

import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { useActiveSessionStore } from "@/lib/ai/mirael-core/v2/stores/active-session.store";
import { useEncryptedSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-sessions.store";
import { simpleSessionSync } from "@/lib/session-sync/simple-sync";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface OpenChatProps {
  sessionId: string;
}

export function useChatSessionState({ sessionId }: OpenChatProps) {
  const [loaded, setLoaded] = useState(false);

  // Parse real session ID from obfuscated URL parameter

  // Subscribe only to state values we need to react to
  const currentSession = useActiveSessionStore((state) => state.currentSession);

  const encryptedHasHydrated = useEncryptedSessionStore((state) => state.hasHydrated);
  const sessionExists = useEncryptedSessionStore((state) => state.sessionExists);

  // Auto-sync logic integrated directly here
  const triggerSync = useCallback(() => {
    if (currentSession && sessionId) {
      // Use local sync for frequent updates - cloud sync is debounced separately
      simpleSessionSync.queueLocalSync(sessionId, "update", currentSession);
      // Also queue cloud sync for sessions with persistOnCloud=true
      simpleSessionSync.queueCloudSync(sessionId, "update");
    }
  }, [currentSession, sessionId]);

  // Load session on mount - always load from encrypted store (source of truth)
  useEffect(() => {
    if (!encryptedHasHydrated || !sessionId) return;

    const loadSessionAsync = async () => {
      // Check if session already loaded in active store
      if (currentSession?.id === sessionId) {
        setLoaded(true);
        return;
      }

      // Load from encrypted store using real session ID
      const isLoaded = await useActiveSessionStore.getState().loadSession(sessionId);
      setLoaded(isLoaded);
    };

    loadSessionAsync();
  }, [sessionId, encryptedHasHydrated, currentSession?.id]);

  // Message actions without auto-sync (sync happens at round completion)
  const addMessage = useCallback((message: OpenChatMessage) => {
    useActiveSessionStore.getState().addMessage(message);
  }, []);

  const appendMessage = useCallback((content: string, role: "user" | "assistant") => {
    useActiveSessionStore.getState().appendMessage(content, role);
  }, []);

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
    if (sessionId) {
      useEncryptedSessionStore.getState().resetSession(sessionId);
    }
  }, [sessionId]);

  return {
    // State
    hasHydrated: encryptedHasHydrated, // Only encrypted store needs to be hydrated
    session: currentSession,
    sessionExists: sessionId ? sessionExists(sessionId) : false,
    sessionId,
    isReady: encryptedHasHydrated && loaded, // Ready when encrypted store hydrated and session loaded

    // Auto-sync actions
    addMessage,
    appendMessage,
    addAnalysis,
    addTokenUsage,
    updateSession,
    resetSession,
    resetEncryptedSession: () => sessionId && useEncryptedSessionStore.getState().resetSession(sessionId),

    // Session management
    loadSession: useActiveSessionStore.getState().loadSession,

    // Sync status (updated for two-tier architecture)
    getSyncStatus: () => {
      return currentSession ? simpleSessionSync.getSyncStatus(currentSession.id) : { local: "synced", cloud: "synced" };
    },
    getLocalSyncStatus: () => {
      return currentSession ? simpleSessionSync.getLocalSyncStatus(currentSession.id) : "synced";
    },
    getCloudSyncStatus: () => {
      return currentSession ? simpleSessionSync.getCloudSyncStatus(currentSession.id) : "synced";
    },
    getLastSyncTimes: () => {
      return currentSession ? simpleSessionSync.getLastSyncTimes(currentSession.id) : { local: null, cloud: null };
    },
    getLastSyncTime: () => {
      return currentSession ? simpleSessionSync.getLastSyncTime(currentSession.id) : null;
    },
    manualSync: triggerSync,
    manualLocalSync: () =>
      currentSession ? simpleSessionSync.syncSessionLocal(currentSession.id) : Promise.resolve(false),
    manualCloudSync: () =>
      currentSession ? simpleSessionSync.syncSessionCloud(currentSession.id) : Promise.resolve(false),
  };
}
