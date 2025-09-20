import { Prisma } from "@prisma/client";

import { updateSession } from "@/app/actions/session-actions";
import { useActiveSessionStore } from "@/domains/active-session/active-session.store";
import { encryptSession } from "@/domains/encrypted-session/encrypted-session.crypto";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { Session, SessionMetadataSchema } from "@/domains/open-chat/open-chat.types";
import { SyncConfig, SyncStatus, SyncStatusDetailed, SyncTimestamps } from "@/domains/session-sync/session-sync.types";

class SessionSynchronizer {
  private static instance: SessionSynchronizer;
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

  // Add mutex protection for sync operations
  private syncMutex = new Map<string, Promise<void>>();

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

  static getInstance(): SessionSynchronizer {
    if (!SessionSynchronizer.instance) {
      SessionSynchronizer.instance = new SessionSynchronizer();
    }
    return SessionSynchronizer.instance;
  }

  constructor() {
    // Initialize periodic cloud sync
    this.startPeriodicCloudSync();
  }

  // EVENT EMISSION FOR STATUS UPDATES
  private emitStatusChange(sessionId: string): void {
    if (typeof window !== "undefined") {
      const status = this.getSyncStatus(sessionId);
      window.dispatchEvent(
        new CustomEvent("sync-status-changed", {
          detail: { sessionId, status },
        })
      );
    }
  }

  // Enhanced session access - can get any session by ID, not just current
  private async getSessionById(sessionId: string): Promise<Session | null> {
    // Try active store first (fastest)
    const activeStore = useActiveSessionStore.getState();
    const activeSession = activeStore.session;
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
      console.warn(`Failed to decrypt session ${sessionId}:`, error);
    }

    return null;
  }

  // Legacy method for backward compatibility
  private getCurrentSession(sessionId: string): Session | null {
    const activeStore = useActiveSessionStore.getState();
    const session = activeStore.session;
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
    this.emitStatusChange(sessionId);

    // Debounce: sync after configured time
    const timeout = setTimeout(() => {
      this.executeLocalSync(sessionId, session);
    }, this.config.localSync.debounceMs);

    this.syncState.local.timeouts.set(sessionId, timeout);
  }

  private async updateSession(sessionId: string, session: Session) {
    const state = useSessionStore.getState();
    const encryptedData = await encryptSession(session);
    state.updateSession(sessionId, encryptedData);
  }

  // Execute local sync - Encrypt and store to encrypted session store
  private async executeLocalSync(sessionId: string, session: Session): Promise<void> {
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
      this.syncState.local.timeouts.delete(sessionId);
    }
  }

  // Actual sync implementation separated for mutex protection
  private async performLocalSync(sessionId: string, session: Session): Promise<void> {
    try {
      this.syncState.local.status[sessionId] = "syncing";
      delete this.syncState.local.errors[sessionId];
      this.emitStatusChange(sessionId);

      await this.retryWithBackoff(() => this.updateSession(sessionId, session));

      this.syncState.local.status[sessionId] = "synced";
      this.syncState.local.lastSyncTime[sessionId] = new Date();
      this.emitStatusChange(sessionId);
    } catch (error) {
      this.syncState.local.status[sessionId] = "error";
      this.syncState.local.errors[sessionId] = error instanceof Error ? error : new Error(`${error}`);
      this.emitStatusChange(sessionId);
      throw error; // Re-throw to handle in mutex cleanup
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
      const encryptedStore = useSessionStore.getState();
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
      const session = await this.getSessionById(sessionId);
      if (!session) {
        console.warn(`Session ${sessionId} not found`);
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

  // PERIODIC CLOUD SYNC METHODS
  private startPeriodicCloudSync(): void {
    // Only start if not already running
    if (this.syncState.periodicCloudSyncInterval) {
      return;
    }

    console.log("Starting periodic cloud sync every", this.config.cloudSync.intervalMs / 1000 / 60, "minutes");

    this.syncState.periodicCloudSyncInterval = setInterval(() => {
      this.syncAllEligibleSessions();
    }, this.config.cloudSync.intervalMs);
  }

  private stopPeriodicCloudSync(): void {
    if (this.syncState.periodicCloudSyncInterval) {
      clearInterval(this.syncState.periodicCloudSyncInterval);
      this.syncState.periodicCloudSyncInterval = undefined;
      console.log("Stopped periodic cloud sync");
    }
  }

  private async syncAllEligibleSessions(): Promise<void> {
    try {
      const encryptedStore = useSessionStore.getState();
      const sessions = encryptedStore.sessions;

      // Find all sessions that should be synced to cloud
      const eligibleSessions = Object.entries(sessions).filter(([_, session]) => session.persistOnCloud === true);

      console.log(`Periodic cloud sync: Found ${eligibleSessions.length} eligible sessions`);

      // Sync each eligible session
      for (const [sessionId, _] of eligibleSessions) {
        try {
          await this.syncSessionCloud(sessionId);
        } catch (error) {
          console.warn(`Periodic cloud sync failed for session ${sessionId}:`, error);
          // Continue with other sessions even if one fails
        }
      }
    } catch (error) {
      console.error("Periodic cloud sync error:", error);
    }
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

  // EXPONENTIAL BACKOFF RETRY UTILITY
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
  ): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries - 1) {
          throw error; // Last attempt failed
        }

        // Exponential backoff: 1s, 2s, 4s, etc.
        const delayMs = baseDelayMs * Math.pow(2, attempt);
        console.warn(`Retry attempt ${attempt + 1}/${maxRetries} failed, retrying in ${delayMs}ms:`, error);

        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    throw new Error("Retry operation failed after all attempts");
  }

  // RETRY AND ERROR HANDLING
  async retryFailedSync(sessionId: string, type: "local" | "cloud" | "both"): Promise<void> {
    if (type === "local" || type === "both") {
      delete this.syncState.local.errors[sessionId];
      const session = await this.getSessionById(sessionId);

      if (session) {
        await this.retryWithBackoff(() => this.executeLocalSync(sessionId, session));
      }
    }
    if (type === "cloud" || type === "both") {
      delete this.syncState.cloud.errors[sessionId];
      await this.retryWithBackoff(() => this.executeCloudSync(sessionId));
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

export const sessionSynchronizer = SessionSynchronizer.getInstance();
