import { nanoid } from "nanoid";

import { decryptSession, encryptSession } from "@/domains/encrypted-session/encrypted-session.crypto";
import { SessionsStoreState, useSessionStore } from "@/domains/encrypted-session/encrypted-session.store";
import { Session } from "@/domains/open-chat/open-chat.types";
import { ERROR_CODES } from "@/lib/errors";
import { logger } from "@/lib/logging/unified-logger";

export const initialSessionData: Omit<Session, "id" | "createdAt" | "updatedAt"> = {
  userId: "",
  title: "",
  subtitle: undefined,
  messages: [],
  memoryStore: null,
  continuitySummary: null,
  aggregatedAnalysis: null,
  analysisSnapshots: [],
  sessionDiagnostics: null,
  modelCode: "M1",
  autoUpdateTitle: false,
  persistOnCloud: false,
  metadata: {
    tokenUsage: [],
    messageCount: 0,
    tokenCount: 0,
    costUSD: 0,
    creditsUsed: 0,
    activeDurationMs: 0,
    lastActiveAt: new Date(),
  },
};

export function getUniqueId(existingMap: Record<string, string>) {
  let id;
  do {
    id = nanoid(6);
  } while (existingMap[id]);
  return id;
}

export async function createStoreSession(data: Partial<Session>, state?: SessionsStoreState) {
  const storeState = state ?? useSessionStore.getState();
  const { sessions, publicIdMap } = storeState;
  // Generate real session ID
  const sessionId = data?.id ?? crypto.randomUUID();
  const publicId = getUniqueId(publicIdMap);

  // Check if session ID already exists
  if (sessions[sessionId]) {
    logger.logErrorAndThrow(ERROR_CODES.SESSION_CREATE_FAILED, new Error("Session already exists"), {
      operation: "encrypted_session_utils_create_store_session",
      sessionId,
    });
  }

  const now = new Date();
  const sessionData = {
    ...initialSessionData,
    ...data,
    id: sessionId,
    createdAt: data.createdAt ?? now,
    updatedAt: data.updatedAt ?? now,
  };

  try {
    const encryptedSession = await encryptSession(sessionData);

    storeState.setSession(publicId, encryptedSession);

    return sessionId;
  } catch (error) {
    logger.logErrorAndThrow(ERROR_CODES.SESSION_CREATE_FAILED, error, {
      operation: "encrypted_session_utils_create_store_session",
      sessionId,
    });
  }
}

export async function updateStoreSession(sessionId: string, session: Session, state?: SessionsStoreState) {
  const storeState = state ?? useSessionStore.getState();
  const { sessions } = storeState;
  const publicId = storeState.getSessionPublicId(sessionId);

  if (!sessions[sessionId]) {
    logger.logErrorAndThrow(ERROR_CODES.SESSION_NOT_FOUND, new Error("Session not found"), {
      operation: "encrypted_session_utils_update_store_session",
      sessionId,
    });
  }

  if (!publicId) {
    logger.logErrorAndThrow(ERROR_CODES.SESSION_NOT_FOUND, new Error("Session not found"), {
      operation: "encrypted_session_utils_update_store_session",
      sessionId,
    });
    throw new Error("Unreachable");
  }

  try {
    const encryptedSession = await encryptSession({
      ...session,
      id: sessionId,
      updatedAt: new Date(),
    });

    storeState.setSession(publicId, encryptedSession);
  } catch (error) {
    logger.logErrorAndThrow(ERROR_CODES.SESSION_UPDATE_FAILED, error, {
      operation: "encrypted_session_utils_update_store_session",
      sessionId,
    });
  }
}

export async function getDecryptedStoreSession(sessionId: string, state?: SessionsStoreState): Promise<Session | null> {
  const storeState = state ?? useSessionStore.getState();
  const { sessions } = storeState;
  const encryptedSession = sessions[sessionId];
  if (!encryptedSession) return null;

  try {
    return await decryptSession(encryptedSession);
  } catch (error) {
    // Log error and throw
    return logger.logErrorAndThrow(ERROR_CODES.SESSION_DECRYPTION_FAILED, error, {
      operation: "encrypted_session_utils_get_decrypted_store_session",
      sessionId,
    });
  }
}
