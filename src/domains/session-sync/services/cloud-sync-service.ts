/**
 * Cloud Sync Service
 * Handles synchronization from Encrypted Session Store to Cloud Database (Supabase)
 */

import { Prisma } from "@prisma/client";

import { updateSession } from "@/app/actions/session-actions";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { SessionMetadataSchema } from "@/domains/open-chat/open-chat.types";
import { logger } from "@/lib/logging/unified-logger";
import { SyncConfigManager } from "../config/sync-config";
import { SyncStateManager } from "../state/sync-state-manager";
import { RetryService } from "../utils/retry-service";

/**
 * Manages cloud synchronization from encrypted store to database
 */
export class CloudSyncService {
  private stateManager: SyncStateManager;
  private configManager: SyncConfigManager;
  private retryService: RetryService;
  private periodicSyncInterval?: NodeJS.Timeout;

  constructor(stateManager: SyncStateManager, configManager: SyncConfigManager, retryService: RetryService) {
    this.stateManager = stateManager;
    this.configManager = configManager;
    this.retryService = retryService;
  }

  /**
   * Initialize periodic cloud sync
   */
  startPeriodicSync(): void {
    if (this.periodicSyncInterval) {
      return; // Already running
    }

    const intervalMs = this.configManager.getCloudInterval();

    logger.logInfo("Starting periodic cloud sync", {
      operation: "cloud_sync_service_start_periodic",
      metadata: { intervalMinutes: intervalMs / 1000 / 60 },
    });

    this.periodicSyncInterval = setInterval(() => {
      this.syncAllEligibleSessions();
    }, intervalMs);
  }

  /**
   * Stop periodic cloud sync
   */
  stopPeriodicSync(): void {
    if (this.periodicSyncInterval) {
      clearInterval(this.periodicSyncInterval);
      this.periodicSyncInterval = undefined;

      logger.logInfo("Stopped periodic cloud sync", {
        operation: "cloud_sync_service_stop_periodic",
      });
    }
  }

  /**
   * Queue a cloud sync operation with debouncing
   */
  queueCloudSync(sessionId: string, operation: "create" | "update" | "delete"): void {
    logger.logInfo("Queuing cloud sync for session", {
      operation: "cloud_sync_service_queue",
      sessionId,
      metadata: { operationType: operation },
    });

    // Clear existing timeout
    this.stateManager.clearCloudTimeout(sessionId);

    // Set status to pending
    this.stateManager.setCloudStatus(sessionId, "pending");

    // Debounce: sync after configured time
    const timeout = setTimeout(() => {
      logger.logInfo("Cloud sync debounce timeout reached", {
        operation: "cloud_sync_service_debounce_timeout",
        sessionId,
      });
      this.executeCloudSync(sessionId);
    }, this.configManager.getCloudDebounce());

    this.stateManager.setCloudTimeout(sessionId, timeout);
  }

  /**
   * Execute cloud sync for a specific session
   */
  async executeCloudSync(sessionId: string): Promise<void> {
    try {
      logger.logInfo("Starting cloud sync for session", {
        operation: "cloud_sync_service_start",
        sessionId,
      });

      this.stateManager.setCloudStatus(sessionId, "syncing");
      this.stateManager.clearCloudError(sessionId);

      // Get session from encrypted store
      const encryptedStore = useSessionStore.getState();
      const encryptedSession = encryptedStore.sessions[sessionId];

      if (!encryptedSession) {
        const error = new Error("Session not found in encrypted store");
        this.stateManager.setCloudError(sessionId, error);

        logger.logWarning("No encrypted session found for cloud sync", {
          operation: "cloud_sync_service_missing_session",
          sessionId,
        });
        return;
      }

      // Check if session should be synced to cloud
      if (!encryptedSession.persistOnCloud) {
        logger.logInfo("Session has persistOnCloud=false, skipping cloud sync", {
          operation: "cloud_sync_service_disabled",
          sessionId,
        });
        this.stateManager.setCloudStatus(sessionId, "disabled");
        return;
      }

      // Prepare Prisma session data
      const prismaSession = this.preparePrismaSessionData(encryptedSession);

      // Sync to cloud database with retry
      const result = await this.retryService.retryWithBackoff(
        () => updateSession(sessionId, prismaSession),
        `cloud_sync_${sessionId}`
      );

      // Update local store with new updatedAt timestamp from database
      if (result.data) {
        encryptedStore.updateSession(sessionId, { updatedAt: result.data.updatedAt });
      }

      this.stateManager.setCloudStatus(sessionId, "synced");
      this.stateManager.setCloudSyncTime(sessionId);

      logger.logInfo("Completed cloud sync for session", {
        operation: "cloud_sync_service_completed",
        sessionId,
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`${error}`);
      this.stateManager.setCloudError(sessionId, errorObj);

      logger.logWarning("Cloud sync failed for session", {
        operation: "cloud_sync_service_failed",
        sessionId,
        metadata: { error: errorObj.message },
      });
    } finally {
      // Clean up timeout reference after execution
      this.stateManager.clearCloudTimeout(sessionId);
    }
  }

  /**
   * Manual sync a specific session to cloud
   */
  async syncSessionManually(sessionId: string): Promise<boolean> {
    try {
      await this.executeCloudSync(sessionId);
      const status = this.stateManager.getCloudStatus(sessionId);
      return status === "synced" || status === "disabled";
    } catch (error) {
      logger.logWarning("Manual cloud sync failed", {
        operation: "cloud_sync_service_manual_failed",
        sessionId,
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });
      return false;
    }
  }

  /**
   * Sync all sessions marked for cloud persistence
   */
  private async syncAllEligibleSessions(): Promise<void> {
    try {
      const encryptedStore = useSessionStore.getState();
      const sessions = encryptedStore.sessions;

      // Find all sessions that should be synced to cloud
      const eligibleSessions = Object.entries(sessions).filter(([, session]) => session.persistOnCloud === true);

      logger.logInfo("Periodic cloud sync: Found eligible sessions", {
        operation: "cloud_sync_service_periodic_eligible",
        metadata: { eligibleSessionsCount: eligibleSessions.length },
      });

      // Sync each eligible session
      for (const [sessionId] of eligibleSessions) {
        try {
          await this.executeCloudSync(sessionId);
        } catch (error) {
          logger.logWarning("Periodic cloud sync failed for session", {
            operation: "cloud_sync_service_periodic_session_failed",
            sessionId,
            metadata: { error: error instanceof Error ? error.message : String(error) },
          });
          // Continue with other sessions even if one fails
        }
      }
    } catch (error) {
      logger.logWarning("Periodic cloud sync error", {
        operation: "cloud_sync_service_periodic_error",
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });
    }
  }

  /**
   * Prepare Prisma session data from encrypted session
   */
  private preparePrismaSessionData(encryptedSession: any): Prisma.SessionCreateWithoutUserInput {
    // Clear tokenUsage from metadata for privacy (before sending to database)
    const cleanedMetadata = encryptedSession.metadata
      ? { ...SessionMetadataSchema.parse(encryptedSession.metadata), tokenUsage: [] }
      : { tokenUsage: [] };

    let prismaSession: Prisma.SessionCreateWithoutUserInput = {
      title: encryptedSession.title,
      subtitle: encryptedSession.subtitle || null,
      metadata: cleanedMetadata,
      updatedAt: new Date(),
    };

    // Add encrypted data if it exists
    if (encryptedSession.encryptedData) {
      prismaSession = {
        ...prismaSession,
        encryptedData: encryptedSession.encryptedData,
      };
    }

    // Add server analytics if it exists (server-side only tracking)
    if (encryptedSession.serverAnalytics) {
      prismaSession = {
        ...prismaSession,
        serverAnalytics: encryptedSession.serverAnalytics,
      };
    }

    return prismaSession;
  }

  /**
   * Check if a session is eligible for cloud sync
   */
  isSessionEligibleForCloudSync(sessionId: string): boolean {
    const encryptedStore = useSessionStore.getState();
    const encryptedSession = encryptedStore.sessions[sessionId];
    return encryptedSession?.persistOnCloud === true;
  }

  /**
   * Get cloud sync configuration
   */
  getCloudSyncConfig() {
    return {
      debounceMs: this.configManager.getCloudDebounce(),
      intervalMs: this.configManager.getCloudInterval(),
      isPeriodicSyncRunning: !!this.periodicSyncInterval,
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopPeriodicSync();
  }
}
