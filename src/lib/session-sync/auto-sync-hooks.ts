/**
 * Auto-sync hooks - Wrapper hooks that automatically trigger synchronization
 * These replace direct store calls and ensure encrypted store stays in sync
 */

import { useCallback } from "react";

import { useOpenChatSessionStore } from "@/lib/ai/mirael-core/v2/open-chat-session.store";
import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { useEncryptedChatSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-chat-session.store";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";
import { sessionSyncManager } from "./session-sync-manager";

/**
 * Enhanced session store hook with automatic sync
 */
export function useAutoSyncSessionStore() {
  const activeStore = useOpenChatSessionStore();
  const encryptedStore = useEncryptedChatSessionStore();

  return {
    // Read operations (no sync needed)
    getSession: activeStore.getSession,
    getSessionField: activeStore.getSessionField,
    sessions: activeStore.sessions,
    hasHydrated: activeStore.hasHydrated,

    // Write operations (with auto-sync)
    createSession: (id: string, data?: Partial<Session>) => {
      activeStore.createSession(id, data);

      // Get the created session and sync it
      const session = activeStore.getSession(id);
      if (session) {
        const obfuscatedId = encryptedStore.getSessionObfuscatedId(id);
        if (obfuscatedId) {
          sessionSyncManager.queueSync(id, obfuscatedId, "update", session);
        }
      }
    },

    updateSession: (id: string, update: Partial<Session> | ((session: Session) => Session)) => {
      activeStore.updateSession(id, update);

      // Queue sync after update
      const session = activeStore.getSession(id);
      if (session) {
        const obfuscatedId = encryptedStore.getSessionObfuscatedId(id);
        if (obfuscatedId) {
          sessionSyncManager.queueSync(id, obfuscatedId, "update", session);
        }
      }
    },

    addMessage: (id: string, message: OpenChatMessage) => {
      activeStore.addMessage(id, message);

      // Auto-sync after message addition
      const session = activeStore.getSession(id);
      if (session) {
        const obfuscatedId = encryptedStore.getSessionObfuscatedId(id);
        if (obfuscatedId) {
          sessionSyncManager.queueSync(id, obfuscatedId, "update", session);
        }
      }
    },

    addAnalysis: (id: string, analysis: StateAnalysis) => {
      activeStore.addAnalysis(id, analysis);

      // Auto-sync after analysis addition
      const session = activeStore.getSession(id);
      if (session) {
        const obfuscatedId = encryptedStore.getSessionObfuscatedId(id);
        if (obfuscatedId) {
          sessionSyncManager.queueSync(id, obfuscatedId, "update", session);
        }
      }
    },

    addTokenUsage: (id: string, tokenUsage: ModelTokenUsage) => {
      activeStore.addTokenUsage(id, tokenUsage);

      // Auto-sync after token usage update
      const session = activeStore.getSession(id);
      if (session) {
        const obfuscatedId = encryptedStore.getSessionObfuscatedId(id);
        if (obfuscatedId) {
          sessionSyncManager.queueSync(id, obfuscatedId, "update", session);
        }
      }
    },

    updateTotalCost: (id: string, cost: number | ((cost: number) => number)) => {
      activeStore.updateTotalCost(id, cost);

      // Auto-sync after cost update
      const session = activeStore.getSession(id);
      if (session) {
        const obfuscatedId = encryptedStore.getSessionObfuscatedId(id);
        if (obfuscatedId) {
          sessionSyncManager.queueSync(id, obfuscatedId, "update", session);
        }
      }
    },

    resetSession: (id: string) => {
      activeStore.resetSession(id);

      // Sync deletion
      const obfuscatedId = encryptedStore.getSessionObfuscatedId(id);
      if (obfuscatedId) {
        sessionSyncManager.queueSync(id, obfuscatedId, "delete", {});
      }
    },

    // Sync management functions
    getSyncStatus: (id: string) => sessionSyncManager.getSyncStatus(id),
    getLastSyncTime: (id: string) => sessionSyncManager.getLastSyncTime(id),
    retrySync: (id: string) => sessionSyncManager.retrySession(id),
    manualSync: (id: string) => sessionSyncManager.syncSession(id),
  };
}

/**
 * Hook for sync status monitoring
 */
export function useSessionSyncStatus(sessionId: string) {
  return {
    status: sessionSyncManager.getSyncStatus(sessionId),
    lastSyncTime: sessionSyncManager.getLastSyncTime(sessionId),
    retry: () => sessionSyncManager.retrySession(sessionId),
    manualSync: () => sessionSyncManager.syncSession(sessionId),
  };
}

/**
 * Hook for batch operations with single sync
 */
export function useBatchSessionUpdates() {
  const activeStore = useOpenChatSessionStore();
  const encryptedStore = useEncryptedChatSessionStore();

  return {
    batchUpdate: (sessionId: string, operations: (() => void)[]) => {
      // Execute all operations without individual syncs
      operations.forEach((op) => op());

      // Single sync at the end
      const session = activeStore.getSession(sessionId);
      if (session) {
        const obfuscatedId = encryptedStore.getSessionObfuscatedId(sessionId);
        if (obfuscatedId) {
          sessionSyncManager.queueSync(sessionId, obfuscatedId, "update", session);
        }
      }
    },
  };
}

/**
 * Hook for session recovery operations
 */
export function useSessionRecovery() {
  const encryptedStore = useEncryptedChatSessionStore();
  const activeStore = useOpenChatSessionStore();

  const recoverSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      try {
        const obfuscatedId = encryptedStore.getSessionObfuscatedId(sessionId);
        if (!obfuscatedId) return false;

        const decryptedSession = await encryptedStore.getSession(obfuscatedId);
        if (!decryptedSession) return false;

        // Restore to active store
        activeStore.createSession(sessionId, decryptedSession);
        return true;
      } catch (error) {
        console.error("Session recovery failed:", sessionId, error);
        return false;
      }
    },
    [encryptedStore, activeStore]
  );

  const getMissingSessions = useCallback(async (): Promise<string[]> => {
    const activeSessions = new Set(Object.keys(activeStore.sessions));
    const encryptedSessions = Object.values(encryptedStore.sessionIdMap);

    return encryptedSessions.filter((sessionId) => !activeSessions.has(sessionId));
  }, [activeStore.sessions, encryptedStore.sessionIdMap]);

  return {
    // Recover session from encrypted store if active store is corrupted
    recoverSession,

    // Get all sessions that exist in encrypted store but not in active store
    getMissingSessions,

    // Restore all missing sessions from encrypted store
    restoreAllSessions: async (): Promise<number> => {
      const missingSessions = await getMissingSessions();
      let restored = 0;

      for (const sessionId of missingSessions) {
        const success = await recoverSession(sessionId);
        if (success) restored++;
      }

      return restored;
    },
  };
}
