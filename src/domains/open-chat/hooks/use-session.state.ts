import { useCallback, useEffect, useState } from "react";

import { useActiveSessionStore } from "@/domains/active-session/active-session.store";
import { decryptSession } from "@/domains/encrypted-session/encrypted-session.crypto";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { Session } from "@/domains/open-chat/open-chat.types";
import { cloudSyncService } from "@/domains/simple-session-sync/cloud-sync-service";
//import { sessionSynchronizer } from "@/domains/session-sync";
import { localSyncService } from "@/domains/simple-session-sync/local-sync-service";
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
      // Only trigger local sync here - cloud sync is handled separately by synchronizer
      //sessionSynchronizer.queueLocalSync(sessionId, "update", latestSession);
      localSyncService.syncSession(latestSession);
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
      await handleLoadSession(sessionId);
    };

    loadSessionAsync();
  }, [sessionId, encryptedHasHydrated, handleLoadSession]);

  // Message actions without sync (sync happens at round completion)
  const addMessage = useCallback((message: OpenChatMessage) => {
    try {
      useActiveSessionStore.getState().addMessage(message);
      // No sync - all messages are part of AI rounds that will complete with sync
    } catch {
      // Error handled silently - will be caught at round completion
    }
  }, []);

  const appendMessage = useCallback(
    (content: string, role: "user" | "assistant", creditsUsed?: number): string | null => {
      try {
        return useActiveSessionStore.getState().appendMessage(content, role, creditsUsed);
      } catch {
        return null;
        // Error handled silently
      }
    },
    []
  );

  const addAnalysis = useCallback((analysis: TherapeuticAnalysis, messageId: string) => {
    try {
      useActiveSessionStore.getState().addAnalysis(analysis, messageId);
      // No immediate sync - will sync at round completion
    } catch {
      // Error handled silently
    }
  }, []);

  const addTokenUsage = useCallback((tokenUsage: ModelTokenUsage) => {
    try {
      useActiveSessionStore.getState().addTokenUsage(tokenUsage);
      // No immediate sync - will sync at round completion
    } catch {
      // Error handled silently
    }
  }, []);

  const updateSession = useCallback(
    (update: Partial<Session> | ((session: Session) => Session)) => {
      try {
        useActiveSessionStore.getState().updateSession(update);
        triggerSync();
      } catch {
        // Error handled silently
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
    } catch {
      // Error handled silently
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

    manualSync: triggerSync,
    manualLocalSync: () => (currentSession ? localSyncService.syncSession(currentSession) : Promise.resolve(false)),
    manualCloudSync: () => (currentSession ? cloudSyncService.syncToCloud(currentSession.id) : Promise.resolve(false)),
  };
}
