/**
 * Session Synchronizer V2
 * Refactored orchestrator that coordinates all sync services
 * Replaces the monolithic SessionSynchronizer class
 */

import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { Session } from "@/domains/open-chat/open-chat.types";
import { logger } from "@/lib/logging/unified-logger";
// Services
import { SyncConfigManager } from "./config/sync-config";
import { CloudSyncService } from "./services/cloud-sync-service";
import { LocalSyncService } from "./services/local-sync-service";
import { SyncConfig, SyncStatus, SyncStatusDetailed, SyncTimestamps } from "./session-sync.types";
import { SyncStateManager } from "./state/sync-state-manager";
import { RetryService } from "./utils/retry-service";

/**
 * Orchestrates all session synchronization operations
 * Much cleaner than the original 629-line god class
 */
export class SessionSynchronizerV2 {
  private static instance: SessionSynchronizerV2;

  // Composed services
  private configManager: SyncConfigManager;
  private stateManager: SyncStateManager;
  private retryService: RetryService;
  private localSyncService: LocalSyncService;
  private cloudSyncService: CloudSyncService;

  private constructor() {
    // Initialize services in dependency order
    this.configManager = new SyncConfigManager();
    this.stateManager = new SyncStateManager();
    this.retryService = new RetryService();

    // Initialize sync services with dependencies
    this.localSyncService = new LocalSyncService(this.stateManager, this.configManager, this.retryService);

    this.cloudSyncService = new CloudSyncService(this.stateManager, this.configManager, this.retryService);

    this.initialize();
  }

  static getInstance(): SessionSynchronizerV2 {
    if (!SessionSynchronizerV2.instance) {
      SessionSynchronizerV2.instance = new SessionSynchronizerV2();
    }
    return SessionSynchronizerV2.instance;
  }

  /**
   * Initialize the synchronizer
   */
  private initialize(): void {
    // Start periodic cloud sync
    this.cloudSyncService.startPeriodicSync();

    // Initialize sync status for existing sessions
    this.initializeSyncStatus();
  }

  /**
   * Initialize sync status for existing sessions
   */
  private initializeSyncStatus(): void {
    if (typeof window === "undefined") return;

    try {
      const encryptedStore = useSessionStore.getState();
      const sessionIds = Object.keys(encryptedStore.sessions);

      // Initialize status for all existing sessions
      for (const sessionId of sessionIds) {
        this.stateManager.initializeSessionStatus(sessionId);
      }
    } catch (error) {
      logger.logWarning("Failed to initialize sync status on startup", {
        operation: "session_synchronizer_v2_initialize_status",
        metadata: { error: error instanceof Error ? error.message : String(error) },
      });
    }
  }

  // =========================
  // Public API - Queue Operations
  // =========================

  /**
   * Queue local sync (Active Store → Encrypted Store)
   */
  queueLocalSync(sessionId: string, operation: "create" | "update" | "delete", session: Session): void {
    this.localSyncService.queueLocalSync(sessionId, operation, session);
  }

  /**
   * Queue cloud sync (Encrypted Store → Database)
   */
  queueCloudSync(sessionId: string, operation: "create" | "update" | "delete"): void {
    // Only queue if session is eligible for cloud sync
    if (this.cloudSyncService.isSessionEligibleForCloudSync(sessionId)) {
      this.cloudSyncService.queueCloudSync(sessionId, operation);
    }
  }

  /**
   * Queue both local and cloud sync (for backward compatibility)
   */
  queueSync(sessionId: string, operation: "create" | "update" | "delete", session: Session): void {
    this.queueLocalSync(sessionId, operation, session);
    this.queueCloudSync(sessionId, operation);
  }

  // =========================
  // Public API - Manual Sync
  // =========================

  /**
   * Manually sync session locally
   */
  async syncSessionLocal(sessionId: string): Promise<boolean> {
    return await this.localSyncService.syncSessionManually(sessionId);
  }

  /**
   * Manually sync session to cloud
   */
  async syncSessionCloud(sessionId: string): Promise<boolean> {
    return await this.cloudSyncService.syncSessionManually(sessionId);
  }

  /**
   * Manually sync session to both local and cloud
   */
  async syncSessionBoth(sessionId: string): Promise<{ local: boolean; cloud: boolean }> {
    const [local, cloud] = await Promise.all([this.syncSessionLocal(sessionId), this.syncSessionCloud(sessionId)]);
    return { local, cloud };
  }

  // =========================
  // Public API - Status & Info
  // =========================

  /**
   * Get sync status for a session
   */
  getSyncStatus(sessionId: string): SyncStatusDetailed {
    return this.stateManager.getSyncStatus(sessionId);
  }

  /**
   * Get local sync status
   */
  getLocalSyncStatus(sessionId: string): SyncStatus {
    return this.stateManager.getLocalStatus(sessionId);
  }

  /**
   * Get cloud sync status
   */
  getCloudSyncStatus(sessionId: string): SyncStatus | "disabled" {
    return this.stateManager.getCloudStatus(sessionId);
  }

  /**
   * Get last sync times
   */
  getLastSyncTimes(sessionId: string): SyncTimestamps {
    return this.stateManager.getLastSyncTimes(sessionId);
  }

  // =========================
  // Public API - Error Handling
  // =========================

  /**
   * Retry failed sync operations
   */
  async retryFailedSync(sessionId: string, type: "local" | "cloud" | "both"): Promise<void> {
    if (type === "local" || type === "both") {
      this.stateManager.clearLocalError(sessionId);
      await this.localSyncService.syncSessionManually(sessionId);
    }

    if (type === "cloud" || type === "both") {
      this.stateManager.clearCloudError(sessionId);
      await this.cloudSyncService.syncSessionManually(sessionId);
    }
  }

  /**
   * Clear sync errors
   */
  clearSyncErrors(sessionId: string, type?: "local" | "cloud"): void {
    this.stateManager.clearSyncErrors(sessionId, type);
  }

  // =========================
  // Public API - Configuration
  // =========================

  /**
   * Update sync configuration
   */
  updateSyncConfig(config: Partial<SyncConfig>): void {
    this.configManager.updateConfig(config);

    // Restart periodic sync if cloud config changed
    if (config.cloudSync) {
      this.cloudSyncService.stopPeriodicSync();
      this.cloudSyncService.startPeriodicSync();
    }
  }

  /**
   * Get current configuration
   */
  getSyncConfig(): SyncConfig {
    return this.configManager.getConfig();
  }

  // =========================
  // Public API - Event Handling
  // =========================

  /**
   * Add status change event listener
   */
  addStatusChangeListener(listener: (sessionId: string, status: SyncStatusDetailed) => void): void {
    this.stateManager.addStatusChangeListener(listener);
  }

  /**
   * Remove status change event listener
   */
  removeStatusChangeListener(listener: (sessionId: string, status: SyncStatusDetailed) => void): void {
    this.stateManager.removeStatusChangeListener(listener);
  }

  // =========================
  // Legacy API (for backward compatibility)
  // =========================

  /**
   * @deprecated Use getLastSyncTimes(sessionId).cloud instead
   */
  getLastSyncTime(sessionId: string): Date | null {
    return this.stateManager.getLastSyncTimes(sessionId).cloud;
  }

  /**
   * @deprecated Use retryFailedSync(sessionId, "both") instead
   */
  async retrySession(sessionId: string): Promise<void> {
    await this.retryFailedSync(sessionId, "both");
  }

  // =========================
  // Cleanup
  // =========================

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    this.cloudSyncService.cleanup();
    this.localSyncService.cleanup();
    this.stateManager.cleanup();
  }

  /**
   * Get service instances for advanced usage
   */
  getServices() {
    return {
      configManager: this.configManager,
      stateManager: this.stateManager,
      retryService: this.retryService,
      localSyncService: this.localSyncService,
      cloudSyncService: this.cloudSyncService,
    };
  }
}

// Export singleton instance for backward compatibility
export const sessionSynchronizer = SessionSynchronizerV2.getInstance();
