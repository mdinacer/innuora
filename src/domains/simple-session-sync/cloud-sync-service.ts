import { Prisma, Session } from "@prisma/client";

import { getSessionsUpdateInfo, updateSession } from "@/app/actions/session-actions";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { SessionMetadataSchema } from "@/domains/open-chat/open-chat.types";
import { logger } from "@/lib/logging/unified-logger";

export class CloudSyncService {
  private static instance: CloudSyncService;

  private syncTimeouts = new Map<string, NodeJS.Timeout>();
  private periodicInterval?: NodeJS.Timeout;

  // Debounce config
  private DEBOUNCE_MS = 2000;
  private PERIODIC_INTERVAL_MS = 5 * 60 * 1000; // 5 min

  static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }
  // Queue single session sync (debounced)
  queueSync(sessionId: string) {
    const existing = this.syncTimeouts.get(sessionId);
    if (existing) clearTimeout(existing);

    const timeout = setTimeout(() => {
      this.syncToCloud(sessionId);
      this.syncTimeouts.delete(sessionId);
    }, this.DEBOUNCE_MS);

    this.syncTimeouts.set(sessionId, timeout);
  }

  // Actually sync to cloud
  async syncToCloud(sessionId: string) {
    const encryptedStore = useSessionStore.getState();
    const encryptedSession = encryptedStore.sessions[sessionId];

    if (!encryptedSession) {
      logger.logWarning("No encrypted session found for cloud sync", {
        operation: "cloud_sync_service_missing_session",
        sessionId,
      });
      return;
    }

    if (!encryptedSession.persistOnCloud) {
      logger.logInfo("Session has persistOnCloud=false, skipping cloud sync", {
        operation: "cloud_sync_service_disabled",
        sessionId,
      });
      return;
    }

    // Prepare Prisma session data
    const prismaSession = this.preparePrismaSessionData(encryptedSession);

    try {
      const result = await this.retryWithBackoff(() => {
        return updateSession(sessionId, prismaSession);
      });

      // Update local with cloud timestamp
      if (result.data) {
        useSessionStore.getState().updateSession(sessionId, {
          updatedAt: result.data.updatedAt,
        });
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(`${error}`);
      logger.logWarning("Cloud sync failed for session", {
        operation: "cloud_sync_service_failed",
        sessionId,
        metadata: { error: errorObj.message },
      });
    }
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;

      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.retryWithBackoff(fn, retries - 1, delay * 2);
    }
  }

  /**
   * Prepare Prisma session data from encrypted session
   */
  private preparePrismaSessionData(encryptedSession: Session): Prisma.SessionCreateWithoutUserInput {
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

    // NOTE: serverData moved to separate SessionContext table
    // It's managed independently by session-context-service.ts
    // Cloud sync only syncs user-visible session metadata and encrypted messages

    return prismaSession;
  }

  // Periodic sync all
  startPeriodicSync() {
    if (this.periodicInterval) return;

    this.periodicInterval = setInterval(async () => {
      const encryptedStore = useSessionStore.getState();
      const sessions = encryptedStore.sessions;

      const remoteSessions = await getSessionsUpdateInfo();
      const remoteMap = Object.fromEntries(remoteSessions.map((s) => [s.id, new Date(s.updatedAt).getTime()]));

      for (const [sessionId, localeSession] of Object.entries(sessions)) {
        if (!localeSession.persistOnCloud) continue;

        const isOnCloud = remoteMap[sessionId] !== undefined;

        if (!isOnCloud) {
          logger.logInfo("Detected new local session; syncing to cloud", {
            operation: "cloud_sync_service_detected_new",
            sessionId,
          });
          await this.syncToCloud(sessionId);
          continue;
        }

        const needsUpdate = new Date(localeSession.updatedAt).getTime() > remoteMap[sessionId];
        if (!needsUpdate) continue;

        logger.logInfo("Detected newer local session; syncing to cloud", {
          operation: "cloud_sync_service_detected_newer",
          sessionId,
          metadata: { localUpdatedAt: localeSession.updatedAt, remoteUpdatedAt: remoteMap[sessionId] },
        });
        await this.syncToCloud(sessionId);
      }
    }, this.PERIODIC_INTERVAL_MS);
  }

  stopPeriodicSync() {
    if (this.periodicInterval) {
      clearInterval(this.periodicInterval);
      this.periodicInterval = undefined;
    }
  }

  cleanup() {
    this.stopPeriodicSync();
    this.syncTimeouts.forEach((t) => clearTimeout(t));
    this.syncTimeouts.clear();
  }
}

export const cloudSyncService = CloudSyncService.getInstance();
