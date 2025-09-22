/**
 * Local Sync Service
 * Handles synchronization from Active Session Store to Encrypted Session Store
 */

import { useActiveSessionStore } from "@/domains/active-session/active-session.store";
import { encryptSession } from "@/domains/encrypted-session/encrypted-session.crypto";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { Session } from "@/domains/open-chat/open-chat.types";
import { logger } from "@/lib/logging/unified-logger";
import { SyncConfigManager } from "../config/sync-config";
import { SyncStateManager } from "../state/sync-state-manager";
import { RetryService } from "../utils/retry-service";

/**
 * Manages local synchronization between active and encrypted stores
 */
export class LocalSyncService {
  private stateManager: SyncStateManager;
  private configManager: SyncConfigManager;
  private retryService: RetryService;
  private syncMutex = new Map<string, Promise<void>>();

  constructor(stateManager: SyncStateManager, configManager: SyncConfigManager, retryService: RetryService) {
    this.stateManager = stateManager;
    this.configManager = configManager;
    this.retryService = retryService;
  }

  /**
   * Queue a local sync operation with debouncing
   */
  queueLocalSync(sessionId: string, _operation: "create" | "update" | "delete", session: Session): void {
    logger.logInfo("Queuing local sync for session", {
      operation: "local_sync_service_queue",
      sessionId,
      metadata: {
        currentStatus: this.stateManager.getLocalStatus(sessionId),
        debounceMs: this.configManager.getLocalDebounce(),
      },
    });

    // Don't queue if already syncing
    const syncStatus = this.stateManager.getLocalStatus(sessionId);
    if (syncStatus === "syncing") {
      logger.logInfo("Skipping queue - sync already in progress", {
        operation: "local_sync_service_skip_queue",
        sessionId,
        metadata: { reason: "sync_in_progress" },
      });
      return;
    }

    // Check if session data has actually changed
    const currentData = {
      updatedAt: session.updatedAt,
      messageCount: session.messages.length,
      analysisCount: session.analysisSnapshots.length,
    };

    if (!this.stateManager.hasDataChanged(sessionId, currentData)) {
      logger.logInfo("Skipping queue - session has not changed since last sync", {
        operation: "local_sync_service_skip_unchanged",
        sessionId,
        metadata: { reason: "no_changes_detected" },
      });
      return;
    }

    logger.logInfo("Session has changes detected for sync", {
      operation: "local_sync_service_changes_detected",
      sessionId,
      metadata: {
        previous: this.stateManager.getLastSyncedData(sessionId),
        current: currentData,
      },
    });

    // Clear existing timeout
    this.stateManager.clearLocalTimeout(sessionId);

    // Set status to pending if not already syncing
    const pendingStatus = this.stateManager.getLocalStatus(sessionId);
    if (pendingStatus !== "syncing") {
      this.stateManager.setLocalStatus(sessionId, "pending");
    }

    // Debounce: sync after configured time
    const timeout = setTimeout(() => {
      logger.logInfo("Debounce timeout reached, executing sync for session", {
        operation: "local_sync_service_debounce_timeout",
        sessionId,
      });
      this.executeLocalSync(sessionId, session);
    }, this.configManager.getLocalDebounce());

    this.stateManager.setLocalTimeout(sessionId, timeout);
  }

  /**
   * Execute local sync with mutex protection
   */
  async executeLocalSync(sessionId: string, session: Session): Promise<void> {
    // Check if sync is already in progress for this session
    if (this.syncMutex.has(sessionId)) {
      // Wait for existing sync to complete
      await this.syncMutex.get(sessionId);
      return;
    }

    // Create sync promise and add to mutex
    const syncPromise = this.performLocalSync(sessionId, session);
    this.syncMutex.set(sessionId, syncPromise);

    try {
      await syncPromise;
    } finally {
      // Always clean up mutex entry
      this.syncMutex.delete(sessionId);
      // Clean up timeout reference after execution
      this.stateManager.clearLocalTimeout(sessionId);
    }
  }

  /**
   * Perform the actual local sync operation
   */
  private async performLocalSync(sessionId: string, session: Session): Promise<void> {
    try {
      logger.logInfo("Starting local sync for session", {
        operation: "local_sync_service_start",
        sessionId,
      });

      this.stateManager.setLocalStatus(sessionId, "syncing");
      this.stateManager.clearLocalError(sessionId);

      await this.retryService.retryWithBackoff(() => this.updateEncryptedSession(sessionId, session));

      this.stateManager.setLocalStatus(sessionId, "synced");
      this.stateManager.setLocalSyncTime(sessionId);

      // Track the synced data to avoid redundant syncs
      this.stateManager.setLastSyncedData(sessionId, {
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
        analysisCount: session.analysisSnapshots.length,
      });

      logger.logInfo("Completed local sync for session", {
        operation: "local_sync_service_completed",
        sessionId,
      });
    } catch (error) {
      logger.logWarning("Local sync failed for session", {
        operation: "local_sync_service_failed",
        sessionId,
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });

      this.stateManager.setLocalError(sessionId, error instanceof Error ? error : new Error(`${error}`));
      throw error; // Re-throw to handle in mutex cleanup
    }
  }

  /**
   * Update the encrypted session store
   */
  private async updateEncryptedSession(sessionId: string, session: Session): Promise<void> {
    logger.logInfo("Updating encrypted session", {
      operation: "local_sync_service_update_encrypted",
      sessionId,
      metadata: {
        messageCount: session.messages.length,
        analysisCount: session.analysisSnapshots.length,
        lastUpdated: session.updatedAt,
      },
    });

    const state = useSessionStore.getState();
    const encryptedData = await encryptSession(session);

    state.updateSession(sessionId, encryptedData);

    logger.logInfo("Successfully updated encrypted store for session", {
      operation: "local_sync_service_encrypted_updated",
      sessionId,
    });
  }

  /**
   * Manual sync a specific session
   */
  async syncSessionManually(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSessionById(sessionId);
      if (!session) {
        logger.logWarning("Session not found for manual sync", {
          operation: "local_sync_service_manual_not_found",
          sessionId,
        });
        return false;
      }

      await this.executeLocalSync(sessionId, session);
      return this.stateManager.getLocalStatus(sessionId) === "synced";
    } catch (error) {
      logger.logWarning("Manual local sync failed", {
        operation: "local_sync_service_manual_failed",
        sessionId,
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });
      return false;
    }
  }

  /**
   * Get session from active or encrypted store
   */
  private async getSessionById(sessionId: string): Promise<Session | null> {
    // Try active store first (fastest)
    const activeStore = useActiveSessionStore.getState();
    const activeSession = activeStore.session;

    logger.logInfo("Getting session by ID for sync operation", {
      operation: "local_sync_service_get_session",
      sessionId,
      metadata: { hasActiveSession: !!activeSession },
    });

    if (activeSession?.id === sessionId) {
      return activeSession;
    }

    // Fallback to encrypted store for any session
    try {
      const encryptedStore = useSessionStore.getState();
      const encryptedSession = await encryptedStore.getSession(sessionId);
      if (encryptedSession) {
        const { decryptSession } = await import("@/domains/encrypted-session/encrypted-session.crypto");
        return await decryptSession(encryptedSession);
      }
    } catch (error) {
      logger.logWarning("Failed to decrypt session during sync operation", {
        operation: "local_sync_service_decrypt_failed",
        sessionId,
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });
    }

    return null;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    // Clear all pending sync operations
    this.syncMutex.clear();
  }
}
