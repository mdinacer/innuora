/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Auto-sync wrapper for Active Session Store (v2 architecture)
 * This replaces the manual sync in use-chat-controller.ts with automatic sync
 */

import { useCallback } from "react";

import { Session } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { StateAnalysis } from "@/lib/ai/mirael-core/v2/state-analysis/state-analysis.schema";
import { useActiveSessionStore } from "@/lib/ai/mirael-core/v2/stores/active-session.store";
import { useEncryptedChatSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-chat-session.store";
import { sessionSyncManager } from "@/lib/session-sync/session-sync-manager";
import { ModelTokenUsage } from "@/types/ai-model.types";
import { OpenChatMessage } from "@/types/open-chat-message.types";

/**
 * Enhanced active session store hook with automatic sync to encrypted store
 */
export function useAutoSyncActiveSessionStore() {
  const activeStore = useActiveSessionStore();
  const encryptedStore = useEncryptedChatSessionStore();

  // Helper to trigger sync for current session
  const triggerSync = useCallback(() => {
    const session = activeStore.currentSession;
    const obfuscatedId = activeStore.obfuscatedId;

    if (session && obfuscatedId) {
      sessionSyncManager.queueSync(session.id, obfuscatedId, "update", session);
    }
  }, [activeStore.currentSession, activeStore.obfuscatedId]);

  // Wrapped actions that trigger auto-sync
  const addMessage = useCallback(
    (message: OpenChatMessage) => {
      activeStore.addMessage(message);
      triggerSync();
    },
    [activeStore.addMessage, triggerSync]
  );

  const appendMessage = useCallback(
    (content: string, role: "user" | "assistant") => {
      activeStore.appendMessage(content, role);
      triggerSync();
    },
    [activeStore.appendMessage, triggerSync]
  );

  const addAnalysis = useCallback(
    (analysis: StateAnalysis) => {
      activeStore.addAnalysis(analysis);
      triggerSync();
    },
    [activeStore.addAnalysis, triggerSync]
  );

  const addTokenUsage = useCallback(
    (tokenUsage: ModelTokenUsage) => {
      activeStore.addTokenUsage(tokenUsage);
      triggerSync();
    },
    [activeStore.addTokenUsage, triggerSync]
  );

  const updateSession = useCallback(
    (update: Partial<Session> | ((session: Session) => Session)) => {
      activeStore.updateSession(update);
      triggerSync();
    },
    [activeStore.updateSession, triggerSync]
  );

  const resetSession = useCallback(() => {
    const obfuscatedId = activeStore.obfuscatedId;
    activeStore.resetSession();

    // Also reset in encrypted store
    if (obfuscatedId) {
      encryptedStore.resetSession(obfuscatedId);
    }
  }, [activeStore.resetSession, activeStore.obfuscatedId, encryptedStore.resetSession]);

  return {
    // Read-only properties (no sync needed)
    currentSession: activeStore.currentSession,
    obfuscatedId: activeStore.obfuscatedId,
    hasHydrated: activeStore.hasHydrated,
    loadSession: activeStore.loadSession,
    getSessionField: activeStore.getSessionField,
    setCurrentSession: activeStore.setCurrentSession,
    clearCurrentSession: activeStore.clearCurrentSession,

    // Auto-sync write operations
    addMessage,
    appendMessage,
    addAnalysis,
    addTokenUsage,
    updateSession,
    resetSession,

    // Manual sync control
    manualSync: triggerSync,
    getSyncStatus: () => {
      const session = activeStore.currentSession;
      return session ? sessionSyncManager.getSyncStatus(session.id) : "synced";
    },
    getLastSyncTime: () => {
      const session = activeStore.currentSession;
      return session ? sessionSyncManager.getLastSyncTime(session.id) : null;
    },
  };
}

/**
 * Hook specifically for v2 chat session state with auto-sync
 */
export function useAutoSyncChatSessionState(sessionId: string) {
  const autoSyncStore = useAutoSyncActiveSessionStore();
  const encryptedStore = useEncryptedChatSessionStore();

  return {
    // State
    hasHydrated: encryptedStore.hasHydrated && autoSyncStore.hasHydrated,
    session: autoSyncStore.currentSession,
    sessionExists: encryptedStore.sessionExists(sessionId),
    obfuscatedId: autoSyncStore.obfuscatedId,
    isReady: encryptedStore.hasHydrated && autoSyncStore.hasHydrated && !!autoSyncStore.currentSession,

    // Auto-sync actions
    addMessage: autoSyncStore.addMessage,
    appendMessage: autoSyncStore.appendMessage,
    addAnalysis: autoSyncStore.addAnalysis,
    addTokenUsage: autoSyncStore.addTokenUsage,
    updateSession: autoSyncStore.updateSession,
    resetSession: autoSyncStore.resetSession,
    resetEncryptedSession: () => encryptedStore.resetSession(sessionId),

    // Sync status
    getSyncStatus: autoSyncStore.getSyncStatus,
    getLastSyncTime: autoSyncStore.getLastSyncTime,
    manualSync: autoSyncStore.manualSync,

    // Session management
    loadSession: autoSyncStore.loadSession,
  };
}
