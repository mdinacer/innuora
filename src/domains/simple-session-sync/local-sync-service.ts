/**
 * Simple Local Sync Service
 * Syncs active session to encrypted store with basic debouncing
 */

import { encryptSession } from "@/domains/encrypted-session/encrypted-session.crypto";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { Session } from "@/domains/open-chat/open-chat.types";
import { logger } from "@/lib/logging/unified-logger";

export class LocalSyncService {
  private static instance: LocalSyncService;
  private pendingSyncs = new Map<string, NodeJS.Timeout>();
  private syncDelay = 100; // ms - minimal debounce for rapid updates

  static getInstance(): LocalSyncService {
    if (!LocalSyncService.instance) {
      LocalSyncService.instance = new LocalSyncService();
    }
    return LocalSyncService.instance;
  }

  /**
   * Sync session to encrypted store with debouncing
   */
  async syncSession(session: Session): Promise<void> {
    // Cancel pending sync for this session
    if (this.pendingSyncs.has(session.id)) {
      clearTimeout(this.pendingSyncs.get(session.id));
    }

    // Schedule new sync
    const timeout = setTimeout(async () => {
      try {
        logger.logInfo("Starting local sync for session", {
          operation: "local_sync_service_start",
          sessionId: session.id,
        });
        await this.performSync(session);
        logger.logInfo("Completed local sync for session", {
          operation: "local_sync_service_completed",
          sessionId: session.id,
        });
      } catch (error) {
        logger.logWarning("Local sync failed for session", {
          operation: "local_sync_service_failed",
          sessionId: session.id,
          metadata: { error: error instanceof Error ? error.message : String(error) },
        });
      } finally {
        this.pendingSyncs.delete(session.id);
      }
    }, this.syncDelay);

    this.pendingSyncs.set(session.id, timeout);
  }

  /**
   * Perform the actual sync operation
   */
  private async performSync(session: Session): Promise<void> {
    logger.logInfo("Updating encrypted session", {
      operation: "local_sync_service_update_encrypted",
      sessionId: session.id,
      metadata: {
        messageCount: session.messages.length,
        lastUpdated: session.updatedAt,
      },
    });
    const encryptedStore = useSessionStore.getState();
    const encryptedSession = await encryptSession(session);
    encryptedStore.updateSession(session.id, encryptedSession);

    logger.logInfo("Successfully updated encrypted store for session", {
      operation: "local_sync_service_encrypted_updated",
      sessionId: session.id,
    });
  }

  /**
   * Force immediate sync (no debouncing)
   */
  async syncImmediately(session: Session): Promise<void> {
    // Cancel any pending sync
    if (this.pendingSyncs.has(session.id)) {
      clearTimeout(this.pendingSyncs.get(session.id));
      this.pendingSyncs.delete(session.id);
    }

    await this.performSync(session);
  }

  /**
   * Cleanup pending syncs
   */
  cleanup(): void {
    for (const timeout of this.pendingSyncs.values()) {
      clearTimeout(timeout);
    }
    this.pendingSyncs.clear();
  }
}

export const localSyncService = LocalSyncService.getInstance();
