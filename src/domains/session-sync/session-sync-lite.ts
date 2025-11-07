import { Prisma, Session as PrismaSession } from "@prisma/client";

import { getSessionsUpdateInfo, updateSession } from "@/app/actions/session-actions";
import { useActiveSessionStore } from "@/domains/active-session/active-session.store";
import { decryptSession, encryptSession } from "@/domains/encrypted-session/encrypted-session.crypto";
import { useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { Session, SessionMetadataSchema } from "@/domains/open-chat/open-chat.types";
import { SyncStatus, SyncStatusDetailed } from "@/domains/session-sync/session-sync.types";

type StatusListener = (sessionId: string, status: SyncStatusDetailed) => void;

type RemoteSessionInfo = {
  updatedAt: string | Date;
};

const DEFAULT_STATUS: SyncStatusDetailed = { local: "synced", cloud: "disabled" };
const FLUSH_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

const statusMap = new Map<string, SyncStatusDetailed>();
const listeners = new Set<StatusListener>();
const dirtySessions = new Set<string>();
const cloudInFlight = new Map<string, Promise<boolean>>();

let flushTimer: NodeJS.Timeout | null = null;

function getStatus(sessionId: string): SyncStatusDetailed {
  if (!statusMap.has(sessionId)) {
    statusMap.set(sessionId, { ...DEFAULT_STATUS });
  }
  return statusMap.get(sessionId)!;
}

function emitStatus(sessionId: string, status: SyncStatusDetailed) {
  for (const listener of listeners) {
    try {
      listener(sessionId, status);
    } catch (error) {
      console.warn("Sync status listener failed", error);
    }
  }
}

function updateStatus(sessionId: string, updates: Partial<SyncStatusDetailed>) {
  const previous = getStatus(sessionId);
  const next: SyncStatusDetailed = {
    local: updates.local ?? previous.local,
    cloud: updates.cloud ?? previous.cloud,
  };

  if (next.local !== previous.local || next.cloud !== previous.cloud) {
    statusMap.set(sessionId, next);
    emitStatus(sessionId, next);
  }
}

async function fetchRemoteInfo(): Promise<Map<string, RemoteSessionInfo>> {
  try {
    const sessions = await getSessionsUpdateInfo();
    return new Map(sessions.map((session) => [session.id, { updatedAt: session.updatedAt }]));
  } catch (error) {
    console.warn("Failed to fetch remote session info", error);
    return new Map();
  }
}

function buildCloudPayload(session: PrismaSession): Prisma.SessionUpdateWithoutUserInput {
  const parsedMetadata = SessionMetadataSchema.safeParse(session.metadata);
  const sanitizedMetadata = parsedMetadata.success ? { ...parsedMetadata.data, tokenUsage: [] } : { tokenUsage: [] };

  const update: Prisma.SessionUpdateWithoutUserInput = {
    title: session.title,
    subtitle: session.subtitle ?? null,
    metadata: sanitizedMetadata as Prisma.InputJsonValue,
    persistOnCloud: session.persistOnCloud ?? false,
    updatedAt: new Date(),
  };

  if (session.encryptedData) {
    update.encryptedData = session.encryptedData as Prisma.InputJsonValue;
  }

  return update;
}

async function syncCloudOnce(sessionId: string, remoteInfo?: RemoteSessionInfo | null): Promise<boolean> {
  if (cloudInFlight.has(sessionId)) {
    return cloudInFlight.get(sessionId)!;
  }

  const promise = (async () => {
    const encrypted = useSessionStore.getState().sessions[sessionId];
    if (!encrypted) {
      dirtySessions.delete(sessionId);
      updateStatus(sessionId, { cloud: "disabled" });
      return false;
    }

    if (!encrypted.persistOnCloud) {
      dirtySessions.delete(sessionId);
      updateStatus(sessionId, { cloud: "disabled" });
      return true;
    }

    const localUpdatedAt = new Date(encrypted.updatedAt).getTime();
    const remoteUpdatedAt = remoteInfo?.updatedAt ? new Date(remoteInfo.updatedAt).getTime() : 0;

    if (remoteUpdatedAt >= localUpdatedAt) {
      dirtySessions.delete(sessionId);
      updateStatus(sessionId, { cloud: "synced" });
      return true;
    }

    updateStatus(sessionId, { cloud: "syncing" });

    try {
      const updatePayload = buildCloudPayload(encrypted);
      const result = await updateSession(sessionId, updatePayload);

      if (result.error) {
        throw new Error(result.error.message);
      }

      const updatedAt = result.data?.updatedAt ?? new Date();
      useSessionStore.getState().updateSession(sessionId, { updatedAt });

      dirtySessions.delete(sessionId);
      updateStatus(sessionId, { cloud: "synced" });
      return true;
    } catch (error) {
      console.warn("Cloud session sync failed", error);
      updateStatus(sessionId, { cloud: "error" });
      return false;
    }
  })();

  cloudInFlight.set(sessionId, promise);

  try {
    return await promise;
  } finally {
    cloudInFlight.delete(sessionId);
  }
}

async function flushDirtySessions(): Promise<void> {
  if (dirtySessions.size === 0) {
    return;
  }

  const remoteInfo = await fetchRemoteInfo();
  const ids = Array.from(dirtySessions);

  for (const sessionId of ids) {
    const info = remoteInfo.get(sessionId);
    await syncCloudOnce(sessionId, info);
  }
}

function scheduleFlush() {
  if (typeof window === "undefined") {
    return;
  }

  if (!flushTimer) {
    flushTimer = setInterval(() => {
      void flushDirtySessions();
    }, FLUSH_INTERVAL_MS);
  }
}

async function persistToEncryptedStore(sessionId: string, session: Session): Promise<void> {
  updateStatus(sessionId, { local: "syncing" });

  try {
    const encrypted = await encryptSession(session);
    useSessionStore.getState().updateSession(sessionId, {
      ...encrypted,
      updatedAt: session.updatedAt ?? new Date(),
      persistOnCloud: session.persistOnCloud ?? false,
    });

    updateStatus(sessionId, {
      local: "synced",
      cloud: session.persistOnCloud ? "pending" : "disabled",
    });

    if (session.persistOnCloud) {
      dirtySessions.add(sessionId);
      scheduleFlush();
    } else {
      dirtySessions.delete(sessionId);
    }
  } catch (error) {
    console.warn("Local session sync failed", error);
    updateStatus(sessionId, { local: "error" });
    throw error;
  }
}

async function getSessionForSync(sessionId: string): Promise<Session | null> {
  const activeSession = useActiveSessionStore.getState().session;
  if (activeSession && activeSession.id === sessionId) {
    return activeSession;
  }

  const encrypted = useSessionStore.getState().sessions[sessionId];
  if (!encrypted) return null;

  try {
    return await decryptSession(encrypted);
  } catch (error) {
    console.warn("Failed to decrypt session during sync", error);
    return null;
  }
}

export const sessionSynchronizer = {
  queueSync(sessionId: string, _operation: "create" | "update" | "delete", session: Session) {
    void persistToEncryptedStore(sessionId, session);
  },

  async syncSessionLocal(sessionId: string): Promise<boolean> {
    const session = await getSessionForSync(sessionId);
    if (!session) return false;

    try {
      await persistToEncryptedStore(sessionId, session);
      return true;
    } catch {
      return false;
    }
  },

  async syncSessionCloud(sessionId: string): Promise<boolean> {
    const encrypted = useSessionStore.getState().sessions[sessionId];
    if (!encrypted || !encrypted.persistOnCloud) {
      updateStatus(sessionId, { cloud: "disabled" });
      return false;
    }

    const remoteInfo = await fetchRemoteInfo();
    return syncCloudOnce(sessionId, remoteInfo.get(sessionId));
  },

  getSyncStatus(sessionId: string): SyncStatusDetailed {
    return getStatus(sessionId);
  },

  setStatus(sessionId: string, status: { local?: SyncStatus; cloud?: SyncStatus | "disabled" }) {
    updateStatus(sessionId, status);
  },

  addStatusChangeListener(listener: StatusListener) {
    listeners.add(listener);
  },

  removeStatusChangeListener(listener: StatusListener) {
    listeners.delete(listener);
  },

  start() {
    scheduleFlush();
  },

  stop() {
    if (flushTimer) {
      clearInterval(flushTimer);
      flushTimer = null;
    }
  },

  flushNow() {
    return flushDirtySessions();
  },
};

// Ensure interval starts if module is loaded on client
if (typeof window !== "undefined") {
  scheduleFlush();
}
