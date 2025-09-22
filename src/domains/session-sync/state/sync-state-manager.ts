/**
 * Session Sync State Management
 * Manages sync status, errors, and timestamps for all sessions
 */

import { logger } from "@/lib/logging/unified-logger";
import { SyncStatus, SyncStatusDetailed, SyncTimestamps } from "../session-sync.types";

interface SessionSyncData {
  updatedAt: Date;
  messageCount: number;
  analysisCount: number;
}

interface SyncStateData {
  status: Record<string, SyncStatus>;
  lastSyncTime: Record<string, Date>;
  errors: Record<string, Error>;
  timeouts: Map<string, NodeJS.Timeout>;
}

interface CloudSyncStateData {
  status: Record<string, SyncStatus | "disabled">;
  lastSyncTime: Record<string, Date>;
  errors: Record<string, Error>;
  timeouts: Map<string, NodeJS.Timeout>;
}

/**
 * Manages sync state for all sessions
 */
export class SyncStateManager {
  private localState: SyncStateData = {
    status: {},
    lastSyncTime: {},
    errors: {},
    timeouts: new Map(),
  };

  private cloudState: CloudSyncStateData = {
    status: {},
    lastSyncTime: {},
    errors: {},
    timeouts: new Map(),
  };

  private lastSyncedData = new Map<string, SessionSyncData>();
  private eventListeners = new Set<(sessionId: string, status: SyncStatusDetailed) => void>();

  /**
   * State Getters
   */
  getLocalStatus(sessionId: string): SyncStatus {
    return this.localState.status[sessionId] ?? "synced";
  }

  getCloudStatus(sessionId: string): SyncStatus | "disabled" {
    return this.cloudState.status[sessionId] ?? "synced";
  }

  getSyncStatus(sessionId: string): SyncStatusDetailed {
    return {
      local: this.getLocalStatus(sessionId),
      cloud: this.getCloudStatus(sessionId),
    };
  }

  getLastSyncTimes(sessionId: string): SyncTimestamps {
    return {
      local: this.localState.lastSyncTime[sessionId] ?? null,
      cloud: this.cloudState.lastSyncTime[sessionId] ?? null,
    };
  }

  /**
   * State Setters
   */
  setLocalStatus(sessionId: string, status: SyncStatus): void {
    this.localState.status[sessionId] = status;
    this.emitStatusChange(sessionId);
  }

  setCloudStatus(sessionId: string, status: SyncStatus | "disabled"): void {
    this.cloudState.status[sessionId] = status;
    this.emitStatusChange(sessionId);
  }

  setLocalSyncTime(sessionId: string, time: Date = new Date()): void {
    this.localState.lastSyncTime[sessionId] = time;
  }

  setCloudSyncTime(sessionId: string, time: Date = new Date()): void {
    this.cloudState.lastSyncTime[sessionId] = time;
  }

  /**
   * Error Management
   */
  setLocalError(sessionId: string, error: Error): void {
    this.localState.errors[sessionId] = error;
    this.setLocalStatus(sessionId, "error");
  }

  setCloudError(sessionId: string, error: Error): void {
    this.cloudState.errors[sessionId] = error;
    this.setCloudStatus(sessionId, "error");
  }

  clearLocalError(sessionId: string): void {
    delete this.localState.errors[sessionId];
  }

  clearCloudError(sessionId: string): void {
    delete this.cloudState.errors[sessionId];
  }

  clearSyncErrors(sessionId: string, type?: "local" | "cloud"): void {
    if (!type || type === "local") {
      this.clearLocalError(sessionId);
    }
    if (!type || type === "cloud") {
      this.clearCloudError(sessionId);
    }
  }

  /**
   * Timeout Management
   */
  setLocalTimeout(sessionId: string, timeout: NodeJS.Timeout): void {
    // Clear existing timeout
    const existing = this.localState.timeouts.get(sessionId);
    if (existing) {
      clearTimeout(existing);
    }
    this.localState.timeouts.set(sessionId, timeout);
  }

  setCloudTimeout(sessionId: string, timeout: NodeJS.Timeout): void {
    // Clear existing timeout
    const existing = this.cloudState.timeouts.get(sessionId);
    if (existing) {
      clearTimeout(existing);
    }
    this.cloudState.timeouts.set(sessionId, timeout);
  }

  clearLocalTimeout(sessionId: string): void {
    const timeout = this.localState.timeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.localState.timeouts.delete(sessionId);
    }
  }

  clearCloudTimeout(sessionId: string): void {
    const timeout = this.cloudState.timeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.cloudState.timeouts.delete(sessionId);
    }
  }

  /**
   * Last Synced Data Tracking (for redundancy checks)
   */
  getLastSyncedData(sessionId: string): SessionSyncData | undefined {
    return this.lastSyncedData.get(sessionId);
  }

  setLastSyncedData(sessionId: string, data: SessionSyncData): void {
    this.lastSyncedData.set(sessionId, data);
  }

  hasDataChanged(sessionId: string, currentData: SessionSyncData): boolean {
    const lastSynced = this.lastSyncedData.get(sessionId);
    if (!lastSynced) return true;

    return (
      lastSynced.updatedAt.getTime() !== currentData.updatedAt.getTime() ||
      lastSynced.messageCount !== currentData.messageCount ||
      lastSynced.analysisCount !== currentData.analysisCount
    );
  }

  /**
   * Initialization
   */
  initializeSessionStatus(sessionId: string): void {
    if (!this.localState.status[sessionId]) {
      this.localState.status[sessionId] = "synced";
    }
    if (!this.cloudState.status[sessionId]) {
      this.cloudState.status[sessionId] = "synced";
    }
  }

  /**
   * Event Management
   */
  addStatusChangeListener(listener: (sessionId: string, status: SyncStatusDetailed) => void): void {
    this.eventListeners.add(listener);
  }

  removeStatusChangeListener(listener: (sessionId: string, status: SyncStatusDetailed) => void): void {
    this.eventListeners.delete(listener);
  }

  private emitStatusChange(sessionId: string): void {
    const status = this.getSyncStatus(sessionId);
    this.eventListeners.forEach((listener) => {
      try {
        listener(sessionId, status);
      } catch (error) {
        logger.logWarning("Status change listener failed", {
          operation: "sync_state_manager_emit_status_change",
          sessionId,
          metadata: { error: error instanceof Error ? error.message : String(error) },
        });
      }
    });

    // Also emit browser event for backward compatibility
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sync-status-changed", {
          detail: { sessionId, status },
        })
      );
    }
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    // Clear all timeouts
    this.localState.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.cloudState.timeouts.forEach((timeout) => clearTimeout(timeout));

    // Clear maps
    this.localState.timeouts.clear();
    this.cloudState.timeouts.clear();
    this.lastSyncedData.clear();
    this.eventListeners.clear();
  }
}
