import { useCallback, useEffect, useState } from "react";

import { useActiveSessionStore } from "@/domains/active-session/active-session.store";
import { decryptSession } from "@/domains/encrypted-session/encrypted-session.crypto";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { Session } from "@/domains/open-chat/open-chat.types";
import { sessionSynchronizer } from "@/domains/session-sync";
import { TherapeuticAnalysis } from "@/domains/therapeutic-analysis/therapeutic-analysis.types";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

interface OpenChatProps {
  sessionId: string;
}

export function useSessionState({ sessionId }: OpenChatProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse real session ID from obfuscated URL parameter

  // Subscribe only to state values we need to react to
  const currentSession = useActiveSessionStore((state) => state.session);

  const encryptedHasHydrated = useSessionStore((state) => state.hasHydrated);
  const sessionExists = useSessionStore((state) => state.sessionExists);

  // Auto-sync logic integrated directly here
  const triggerSync = useCallback(() => {
    // Get the current session from store to avoid stale closures
    const latestSession = useActiveSessionStore.getState().session;
    if (latestSession && sessionId) {
      console.log(`[SessionState] Triggering sync for session ${sessionId}`);
      // Only trigger local sync here - cloud sync is handled separately by synchronizer
      sessionSynchronizer.queueLocalSync(sessionId, "update", latestSession);
      // Cloud sync is debounced and triggered automatically by the synchronizer
    }
  }, [sessionId]);

  const handleLoadSession = useCallback(async (sessionId: string) => {
    try {
      setError(null);
      setLoaded(false);

      const encryptedSession = await useSessionStore.getState().getSession(sessionId);

      if (!encryptedSession) {
        setError("Session not found");
        setLoaded(false);
        return false;
      }

      const decryptedData = await decryptSession(encryptedSession);

      if (!decryptedData) {
        setError("Failed to decrypt session");
        setLoaded(false);
        return false;
      }

      useActiveSessionStore.getState().setSession(decryptedData);
      setLoaded(true);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`Failed to load session ${sessionId}:`, error);
      setError(`Failed to load session: ${message}`);
      setLoaded(false);
      return false;
    }
  }, []);

  // Load session on mount - always load from encrypted store (source of truth)
  useEffect(() => {
    if (!encryptedHasHydrated || !sessionId) return;

    const loadSessionAsync = async () => {
      // Always load from encrypted store as source of truth
      // The active store session might be stale or incomplete
      console.log(`[SessionState] Loading session ${sessionId} from encrypted store`);
      await handleLoadSession(sessionId);
    };

    loadSessionAsync();
  }, [sessionId, encryptedHasHydrated, handleLoadSession]);

  // Message actions without sync (sync happens at round completion)
  const addMessage = useCallback((message: OpenChatMessage) => {
    try {
      useActiveSessionStore.getState().addMessage(message);
      // No sync - all messages are part of AI rounds that will complete with sync
    } catch (error) {
      console.error("Failed to add message:", error);
    }
  }, []);

  const appendMessage = useCallback((content: string, role: "user" | "assistant", creditsUsed?: number) => {
    try {
      useActiveSessionStore.getState().appendMessage(content, role, creditsUsed);
    } catch (error) {
      console.error("Failed to append message:", error);
    }
  }, []);

  const addAnalysis = useCallback((analysis: TherapeuticAnalysis) => {
    try {
      useActiveSessionStore.getState().addAnalysis(analysis);
      // No immediate sync - will sync at round completion
    } catch (error) {
      console.error("Failed to add analysis:", error);
    }
  }, []);

  const addTokenUsage = useCallback((tokenUsage: ModelTokenUsage) => {
    try {
      useActiveSessionStore.getState().addTokenUsage(tokenUsage);
      // No immediate sync - will sync at round completion
    } catch (error) {
      console.error("Failed to add token usage:", error);
    }
  }, []);

  const updateSession = useCallback(
    (update: Partial<Session> | ((session: Session) => Session)) => {
      try {
        useActiveSessionStore.getState().updateSession(update);
        triggerSync();
      } catch (error) {
        console.error("Failed to update session:", error);
      }
    },
    [triggerSync]
  );

  const resetSession = useCallback(() => {
    try {
      useActiveSessionStore.getState().resetSession();

      // Also reset in encrypted store
      if (sessionId) {
        useSessionStore.getState().clearSession(sessionId);
      }
    } catch (error) {
      console.error("Failed to reset session:", error);
    }
  }, [sessionId]);

  return {
    // State
    hasHydrated: encryptedHasHydrated, // Only encrypted store needs to be hydrated
    session: currentSession,
    sessionExists: sessionId ? sessionExists(sessionId) : false,
    sessionId,
    isReady: encryptedHasHydrated && loaded, // Ready when encrypted store hydrated and session loaded
    error,
    isLoading: !loaded && !error,

    // Auto-sync actions
    addMessage,
    appendMessage,
    addAnalysis,
    addTokenUsage,
    addCreditsUsed: useActiveSessionStore.getState().addCreditsUsed,
    updateSession,
    resetSession,
    resetEncryptedSession: () => sessionId && useSessionStore.getState().clearSession(sessionId),

    // Session management
    loadSession: handleLoadSession,

    // Sync status (updated for two-tier architecture)
    getSyncStatus: () => {
      return currentSession
        ? sessionSynchronizer.getSyncStatus(currentSession.id)
        : { local: "synced", cloud: "synced" };
    },
    getLocalSyncStatus: () => {
      return currentSession ? sessionSynchronizer.getLocalSyncStatus(currentSession.id) : "synced";
    },
    getCloudSyncStatus: () => {
      return currentSession ? sessionSynchronizer.getCloudSyncStatus(currentSession.id) : "synced";
    },
    getLastSyncTimes: () => {
      return currentSession ? sessionSynchronizer.getLastSyncTimes(currentSession.id) : { local: null, cloud: null };
    },
    getLastSyncTime: () => {
      return currentSession ? sessionSynchronizer.getLastSyncTime(currentSession.id) : null;
    },
    manualSync: triggerSync,
    manualLocalSync: () =>
      currentSession ? sessionSynchronizer.syncSessionLocal(currentSession.id) : Promise.resolve(false),
    manualCloudSync: () =>
      currentSession ? sessionSynchronizer.syncSessionCloud(currentSession.id) : Promise.resolve(false),
  };
}
