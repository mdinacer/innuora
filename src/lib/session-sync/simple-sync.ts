import { Prisma } from "@prisma/client";

import { updateSession } from "@/app/actions/session-actions";
import { Session, SessionMetadataSchema } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { useActiveSessionStore } from "@/lib/ai/mirael-core/v2/stores/active-session.store";
import { useEncryptedSessionStore } from "@/lib/ai/mirael-core/v2/stores/encrypted-sessions.store";

export type SyncStatus = "synced" | "syncing" | "error" | "pending";

export interface SyncStatusDetailed {
  local: SyncStatus;
  cloud: SyncStatus | "disabled";
}

export interface SyncTimestamps {
  local: Date | null;
  cloud: Date | null;
}

export interface SyncConfig {
  localSync: {
    debounceMs: number;
    triggers: ("roundComplete" | "sessionUpdate" | "messageAdd")[];
  };
  cloudSync: {
    debounceMs: number;
    triggers: ("periodic" | "browserEvent" | "manual")[];
    intervalMs: number;
  };
}

class SimpleSessionSync {
  private static instance: SimpleSessionSync;
  private config: SyncConfig = {
    localSync: {
      debounceMs: 1000,
      triggers: ["roundComplete", "sessionUpdate", "messageAdd"],
    },
    cloudSync: {
      debounceMs: 600000, // 10 minutes
      triggers: ["periodic", "browserEvent", "manual"],
      intervalMs: 600000, // 10 minutes
    },
  };

  private syncState: {
    local: {
      status: Record<string, SyncStatus>;
      lastSyncTime: Record<string, Date>;
      errors: Record<string, Error>;
      timeouts: Map<string, NodeJS.Timeout>;
    };
    cloud: {
      status: Record<string, SyncStatus | "disabled">;
      lastSyncTime: Record<string, Date>;
      errors: Record<string, Error>;
      timeouts: Map<string, NodeJS.Timeout>;
    };
    periodicCloudSyncInterval?: NodeJS.Timeout;
  } = {
    local: {
      status: {},
      lastSyncTime: {},
      errors: {},
      timeouts: new Map(),
    },
    cloud: {
      status: {},
      lastSyncTime: {},
      errors: {},
      timeouts: new Map(),
    },
  };

  static getInstance(): SimpleSessionSync {
    if (!SimpleSessionSync.instance) {
      SimpleSessionSync.instance = new SimpleSessionSync();
    }
    return SimpleSessionSync.instance;
  }

  // Helper method to get current session from active store
  private getCurrentSession(sessionId: string): Session | null {
    const activeStore = useActiveSessionStore.getState();
    const session = activeStore.currentSession;
    return session && session.id === sessionId ? session : null;
  }

  // LOCAL SYNC METHODS (Active Store → Encrypted Store)
  // Queue local sync - happens frequently on round complete
  queueLocalSync(sessionId: string, _operation: "create" | "update" | "delete", session: Session): void {
    // Clear existing timeout for this session
    const existingTimeout = this.syncState.local.timeouts.get(sessionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set status to pending
    this.syncState.local.status[sessionId] = "pending";

    // Debounce: sync after configured time
    const timeout = setTimeout(() => {
      this.executeLocalSync(sessionId, session);
    }, this.config.localSync.debounceMs);

    this.syncState.local.timeouts.set(sessionId, timeout);
  }

  // Execute local sync - Encrypt and store to encrypted session store
  private async executeLocalSync(sessionId: string, session: Session): Promise<void> {
    try {
      this.syncState.local.status[sessionId] = "syncing";
      delete this.syncState.local.errors[sessionId];

      useEncryptedSessionStore.getState().updateSession(sessionId, session);

      this.syncState.local.status[sessionId] = "synced";
      this.syncState.local.lastSyncTime[sessionId] = new Date();
    } catch (error) {
      this.syncState.local.status[sessionId] = "error";
      this.syncState.local.errors[sessionId] = error instanceof Error ? error : new Error(`${error}`);
    } finally {
      // Clean up timeout reference after execution
      this.syncState.local.timeouts.delete(sessionId);
    }
  }

  // CLOUD SYNC METHODS (Encrypted Store → Supabase, only if persistOnCloud=true)
  // Queue cloud sync - happens less frequently, debounced
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  queueCloudSync(sessionId: string, operation: "create" | "update" | "delete"): void {
    // Clear existing timeout for this session
    const existingTimeout = this.syncState.cloud.timeouts.get(sessionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set status to pending
    this.syncState.cloud.status[sessionId] = "pending";

    // Debounce: sync after configured time (10 minutes)
    const timeout = setTimeout(() => {
      this.executeCloudSync(sessionId);
    }, this.config.cloudSync.debounceMs);

    this.syncState.cloud.timeouts.set(sessionId, timeout);
  }

  // Execute cloud sync - Get from encrypted store and sync to cloud if persistOnCloud=true
  private async executeCloudSync(sessionId: string): Promise<void> {
    try {
      this.syncState.cloud.status[sessionId] = "syncing";
      delete this.syncState.cloud.errors[sessionId];

      // Get session from encrypted store (not active store)
      const encryptedStore = useEncryptedSessionStore.getState();
      const encryptedSession = encryptedStore.sessions[sessionId];

      if (!encryptedSession) {
        console.warn(`No encrypted session found for ${sessionId}`);
        this.syncState.cloud.status[sessionId] = "error";
        this.syncState.cloud.errors[sessionId] = new Error("Session not found in encrypted store");
        return;
      }

      // Check if session has persistOnCloud=true
      if (!encryptedSession.persistOnCloud) {
        console.log(`Session ${sessionId} has persistOnCloud=false, skipping cloud sync`);
        this.syncState.cloud.status[sessionId] = "disabled";
        return;
      }

      // Prepare Prisma session data for cloud sync
      let prismaSession: Prisma.SessionCreateWithoutUserInput = {
        title: encryptedSession.title,
        subtitle: encryptedSession.subtitle || null,
        metadata: encryptedSession.metadata ? SessionMetadataSchema.parse(encryptedSession.metadata) : {},
        updatedAt: new Date(),
      };

      // Add encrypted data if it exists
      if (encryptedSession.encryptedData) {
        prismaSession = {
          ...prismaSession,
          encryptedData: encryptedSession.encryptedData,
        };
      }

      // Sync to cloud database
      await updateSession(sessionId, prismaSession);

      this.syncState.cloud.status[sessionId] = "synced";
      this.syncState.cloud.lastSyncTime[sessionId] = new Date();
    } catch (error) {
      this.syncState.cloud.status[sessionId] = "error";
      this.syncState.cloud.errors[sessionId] = error instanceof Error ? error : new Error(`${error}`);
    } finally {
      // Clean up timeout reference after execution
      this.syncState.cloud.timeouts.delete(sessionId);
    }
  }

  // PUBLIC MANUAL SYNC METHODS
  async syncSessionLocal(sessionId: string): Promise<boolean> {
    try {
      const session = this.getCurrentSession(sessionId);
      if (!session) {
        console.warn(`Session ${sessionId} not found in active store`);
        return false;
      }

      await this.executeLocalSync(sessionId, session);
      return this.syncState.local.status[sessionId] === "synced";
    } catch (error) {
      console.error("Manual local sync failed:", error);
      return false;
    }
  }

  async syncSessionCloud(sessionId: string): Promise<boolean> {
    try {
      await this.executeCloudSync(sessionId);
      const status = this.syncState.cloud.status[sessionId];
      return status === "synced" || status === "disabled";
    } catch (error) {
      console.error("Manual cloud sync failed:", error);
      return false;
    }
  }

  async syncSessionBoth(sessionId: string): Promise<{ local: boolean; cloud: boolean }> {
    const local = await this.syncSessionLocal(sessionId);
    const cloud = await this.syncSessionCloud(sessionId);
    return { local, cloud };
  }

  // STATUS METHODS
  getSyncStatus(sessionId: string): SyncStatusDetailed {
    return {
      local: this.syncState.local.status[sessionId] ?? "synced",
      cloud: this.syncState.cloud.status[sessionId] ?? "synced",
    };
  }

  getLocalSyncStatus(sessionId: string): SyncStatus {
    return this.syncState.local.status[sessionId] ?? "synced";
  }

  getCloudSyncStatus(sessionId: string): SyncStatus | "disabled" {
    return this.syncState.cloud.status[sessionId] ?? "synced";
  }

  getLastSyncTimes(sessionId: string): SyncTimestamps {
    return {
      local: this.syncState.local.lastSyncTime[sessionId] ?? null,
      cloud: this.syncState.cloud.lastSyncTime[sessionId] ?? null,
    };
  }

  // CONFIGURATION METHODS
  updateSyncConfig(config: Partial<SyncConfig>): void {
    if (config.localSync) {
      // Validate debounce time
      if (config.localSync.debounceMs !== undefined && config.localSync.debounceMs < 0) {
        throw new Error("Local sync debounce time must be non-negative");
      }
      this.config.localSync = { ...this.config.localSync, ...config.localSync };
    }
    if (config.cloudSync) {
      // Validate debounce and interval times
      if (config.cloudSync.debounceMs !== undefined && config.cloudSync.debounceMs < 0) {
        throw new Error("Cloud sync debounce time must be non-negative");
      }
      if (config.cloudSync.intervalMs !== undefined && config.cloudSync.intervalMs < 0) {
        throw new Error("Cloud sync interval must be non-negative");
      }
      this.config.cloudSync = { ...this.config.cloudSync, ...config.cloudSync };
    }
  }

  // RETRY AND ERROR HANDLING
  async retryFailedSync(sessionId: string, type: "local" | "cloud" | "both"): Promise<void> {
    if (type === "local" || type === "both") {
      delete this.syncState.local.errors[sessionId];
      const session = this.getCurrentSession(sessionId);

      if (session) {
        await this.executeLocalSync(sessionId, session);
      }
    }
    if (type === "cloud" || type === "both") {
      delete this.syncState.cloud.errors[sessionId];
      await this.executeCloudSync(sessionId);
    }
  }

  clearSyncErrors(sessionId: string, type?: "local" | "cloud"): void {
    if (!type || type === "local") {
      delete this.syncState.local.errors[sessionId];
    }
    if (!type || type === "cloud") {
      delete this.syncState.cloud.errors[sessionId];
    }
  }

  // LEGACY METHODS (for backward compatibility)
  queueSync(sessionId: string, operation: "create" | "update" | "delete", session: Session): void {
    // Queue both local and cloud sync for backward compatibility
    this.queueLocalSync(sessionId, operation, session);
    this.queueCloudSync(sessionId, operation);
  }

  getLastSyncTime(sessionId: string): Date | null {
    // Legacy method - returns cloud sync time for backward compatibility
    return this.syncState.cloud.lastSyncTime[sessionId] ?? null;
  }

  async retrySession(sessionId: string): Promise<void> {
    // Legacy method - retries both syncs
    await this.retryFailedSync(sessionId, "both");
  }
}

export const simpleSessionSync = SimpleSessionSync.getInstance();
