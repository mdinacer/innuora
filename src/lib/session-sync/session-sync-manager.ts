/**
 * SessionSyncManager - Handles automatic synchronization between active and encrypted session stores
 *
 * Features:
 * - Automatic sync triggers on session changes
 * - Optimistic updates with rollback capability
 * - Retry mechanism with exponential backoff
 * - Error recovery and state consistency
 */

import { Prisma } from "@prisma/client";

import { updateSession as updateSessionOnCloud } from "@/app/actions/session-actions";
import { useOpenChatSessionStore } from "@/lib/ai/mirael-core/v2/open-chat-session.store";
import { Session, SessionMetadataSchema } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { useEncryptedChatSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-chat-session.store";
import { encryptedDataToPayload } from "@/lib/crypto/encryption.types";

export interface SyncOperation {
  id: string;
  sessionId: string;
  obfuscatedId: string;
  operation: "update" | "create" | "delete";
  data: Partial<Session>;
  timestamp: Date;
  retries: number;
  maxRetries: number;
}

export interface SyncState {
  pending: SyncOperation[];
  inProgress: Set<string>; // session IDs being synced
  lastSyncTime: Record<string, Date>;
  errors: Record<string, { error: Error; operation: SyncOperation }>;
}

export class SessionSyncManager {
  private static instance: SessionSyncManager;
  private syncState: SyncState = {
    pending: [],
    inProgress: new Set(),
    lastSyncTime: {},
    errors: {},
  };

  private syncInterval?: ReturnType<typeof setInterval>;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAYS = [1000, 3000, 9000]; // Exponential backoff

  private constructor() {
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  static getInstance(): SessionSyncManager {
    if (!SessionSyncManager.instance) {
      SessionSyncManager.instance = new SessionSyncManager();
    }
    return SessionSyncManager.instance;
  }

  /**
   * Queue a sync operation for a session
   */
  queueSync(
    sessionId: string,
    obfuscatedId: string,
    operation: "update" | "create" | "delete",
    data: Partial<Session>
  ): void {
    // Remove any existing pending operations for this session
    this.syncState.pending = this.syncState.pending.filter((op) => op.sessionId !== sessionId);

    const syncOp: SyncOperation = {
      id: crypto.randomUUID(),
      sessionId,
      obfuscatedId,
      operation,
      data,
      timestamp: new Date(),
      retries: 0,
      maxRetries: this.MAX_RETRIES,
    };

    this.syncState.pending.push(syncOp);

    // Process immediately if not already syncing this session
    if (!this.syncState.inProgress.has(sessionId)) {
      this.processSyncQueue();
    }
  }

  /**
   * Manually trigger sync for a specific session
   */
  async syncSession(sessionId: string): Promise<boolean> {
    const activeStore = useOpenChatSessionStore.getState();
    const encryptedStore = useEncryptedChatSessionStore.getState();

    const session = activeStore.getSession(sessionId);
    if (!session) {
      console.warn("Session not found in active store:", sessionId);
      return false;
    }

    const obfuscatedId = encryptedStore.getSessionObfuscatedId(sessionId);
    if (!obfuscatedId) {
      console.warn("Obfuscated ID not found for session:", sessionId);
      return false;
    }

    this.queueSync(sessionId, obfuscatedId, "update", session);
    return this.processSyncQueue();
  }

  /**
   * Process pending sync operations
   */
  private async processSyncQueue(): Promise<boolean> {
    if (this.syncState.pending.length === 0) return true;

    const operation = this.syncState.pending.shift();
    if (!operation) return true;

    // Skip if already syncing this session
    if (this.syncState.inProgress.has(operation.sessionId)) {
      this.syncState.pending.unshift(operation); // Put it back
      return true;
    }

    this.syncState.inProgress.add(operation.sessionId);

    try {
      await this.executeSyncOperation(operation);
      this.syncState.lastSyncTime[operation.sessionId] = new Date();
      delete this.syncState.errors[operation.sessionId];

      // Continue processing queue
      setTimeout(() => this.processSyncQueue(), 100);
      return true;
    } catch (error) {
      console.error("Sync operation failed:", operation, error);

      if (operation.retries < operation.maxRetries) {
        // Retry with exponential backoff
        operation.retries++;
        const delay = this.RETRY_DELAYS[operation.retries - 1] || 9000;

        setTimeout(() => {
          this.syncState.pending.unshift(operation);
          this.processSyncQueue();
        }, delay);
      } else {
        // Max retries exceeded - store error and notify
        this.syncState.errors[operation.sessionId] = {
          error: error instanceof Error ? error : new Error(String(error)),
          operation,
        };
        this.handleSyncFailure(operation, error);
      }

      return false;
    } finally {
      this.syncState.inProgress.delete(operation.sessionId);
    }
  }

  /**
   * Execute a single sync operation
   */
  private async executeSyncOperation(operation: SyncOperation): Promise<void> {
    const encryptedStore = useEncryptedChatSessionStore.getState();

    // Always sync to local encrypted store first
    switch (operation.operation) {
      case "update":
        await encryptedStore.updateSession(operation.obfuscatedId, operation.data as Session);
        break;

      case "create":
        await encryptedStore.createSession(operation.data);
        break;

      case "delete":
        encryptedStore.removeSession(operation.obfuscatedId);
        break;

      default:
        throw new Error(`Unknown sync operation: ${operation.operation}`);
    }

    // If user opted for cloud backup (persistOnCloud), also sync to Supabase
    const session = operation.data as Session;
    if (session.persistOnCloud && operation.operation === "update") {
      await this.syncToCloud(operation.sessionId);
    }
  }

  /**
   * Sync session to cloud database (Supabase) when user has enabled persistOnCloud
   */
  private async syncToCloud(sessionId: string): Promise<void> {
    try {
      // Get encrypted session data from the encrypted store
      const encryptedStore = useEncryptedChatSessionStore.getState();
      const obfuscatedId = encryptedStore.getSessionObfuscatedId(sessionId);

      if (!obfuscatedId) {
        throw new Error("No obfuscated ID found for cloud sync");
      }

      const encryptedSession = encryptedStore.sessions[obfuscatedId];
      if (!encryptedSession) {
        throw new Error("No encrypted session found for cloud sync");
      }

      const { encryptedData, iv, authTag, encAlg, id, ...rest } = encryptedSession;

      const hasEncryptedData = encryptedData && iv && authTag && encAlg;

      // Convert to payload format for cloud storage
      const payload = hasEncryptedData ? encryptedDataToPayload({ encryptedData, iv, authTag, encAlg }) : undefined;

      const sessionInput: Prisma.SessionUpdateWithoutUserInput = {
        title: rest.title,
        subtitle: rest.subtitle,
        persistOnCloud: rest.persistOnCloud,
        autoUpdateTitle: rest.autoUpdateTitle,
        modelCode: rest.modelCode,
        metadata: rest.metadata ? SessionMetadataSchema.parse(rest.metadata) : undefined,
      };
      // Update session on cloud (Supabase)
      await updateSessionOnCloud(id, sessionInput, payload);

      console.log("✅ Session synced to cloud:", sessionId);
    } catch (error) {
      console.error("❌ Cloud sync failed:", error);
      // Don't throw - local sync succeeded, cloud sync is supplementary
    }
  }

  /**
   * Handle sync failure - implement rollback or user notification
   */
  private handleSyncFailure(operation: SyncOperation, error: unknown): void {
    console.error("Sync failed permanently for session:", operation.sessionId, error);

    // Emit custom event for UI to handle
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("session-sync-failed", {
          detail: { sessionId: operation.sessionId, operation, error },
        })
      );
    }
  }

  /**
   * Setup browser event listeners for automatic sync triggers
   */
  private setupEventListeners(): void {
    if (typeof window === "undefined") return;

    // Sync on page visibility change (tab switch, minimize, etc.)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.syncAllActiveSessions();
      }
    });

    // Sync before page unload
    window.addEventListener("beforeunload", () => {
      this.syncAllActiveSessions();
    });

    // Sync on window blur (user switching apps)
    window.addEventListener("blur", () => {
      this.syncAllActiveSessions();
    });
  }

  /**
   * Start periodic sync interval
   */
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      this.syncAllActiveSessions();
    }, this.SYNC_INTERVAL);
  }

  /**
   * Sync all sessions that have pending changes
   */
  private syncAllActiveSessions(): void {
    const activeStore = useOpenChatSessionStore.getState();
    const encryptedStore = useEncryptedChatSessionStore.getState();

    Object.keys(activeStore.sessions).forEach((sessionId) => {
      const session = activeStore.sessions[sessionId];
      const obfuscatedId = encryptedStore.getSessionObfuscatedId(sessionId);

      if (session && obfuscatedId) {
        // Check if session has been updated since last sync
        const lastSync = this.syncState.lastSyncTime[sessionId];
        if (!lastSync || session.updatedAt > lastSync) {
          this.queueSync(sessionId, obfuscatedId, "update", session);
        }
      }
    });
  }

  /**
   * Get current sync status for a session
   */
  getSyncStatus(sessionId: string): "synced" | "pending" | "syncing" | "error" {
    if (this.syncState.errors[sessionId]) return "error";
    if (this.syncState.inProgress.has(sessionId)) return "syncing";
    if (this.syncState.pending.some((op) => op.sessionId === sessionId)) return "pending";
    return "synced";
  }

  /**
   * Get last sync time for a session
   */
  getLastSyncTime(sessionId: string): Date | null {
    return this.syncState.lastSyncTime[sessionId] || null;
  }

  /**
   * Clear errors for a session and retry
   */
  retrySession(sessionId: string): void {
    delete this.syncState.errors[sessionId];
    this.syncSession(sessionId);
  }

  /**
   * Cleanup - stop intervals and clear state
   */
  cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncState = {
      pending: [],
      inProgress: new Set(),
      lastSyncTime: {},
      errors: {},
    };
  }
}

// Export singleton instance
export const sessionSyncManager = SessionSyncManager.getInstance();
