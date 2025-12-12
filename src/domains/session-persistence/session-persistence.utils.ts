import { nanoid } from "nanoid";

import { decryptObjectWithKey, encryptObjectWithKey, getStoredContentKey } from "@/lib/crypto/webcrypto-crypto";
import { EncryptedBlob, EncryptedBlobSchema } from "@/lib/crypto/webcrypto-crypto.types";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/logger.client";
import {
  ConversationSession as Session,
  SessionMetadataSchema,
  SessionPayload,
} from "../session-state/session-state.types";
import { useSessionStore } from "./session-persistence.store";
import { EncryptedSession } from "./session-persistence.types";

/** Ensure content key is available or raise a managed error */
async function requireContentKey(operation: string, sessionId?: string): Promise<CryptoKey> {
  const contentKey = await getStoredContentKey();
  if (!contentKey) {
    logger.logErrorAndThrow(ERROR_CODES.CRYPTO_KEY_RETRIEVAL_FAILED, new Error("No content key found"), {
      operation,
      sessionId,
    });
  }
  return contentKey as CryptoKey;
}

export async function encryptSession(session: Partial<Session>): Promise<EncryptedSession> {
  const result = await logger.wrapOperation(
    async () => {
      const contentKey = await requireContentKey("crypto_encrypt_session", session.id);

      // NOTE: memoryStore, aggregatedAnalysis, analysisSnapshots
      // are now stored server-side only in encrypted serverData field
      const { messages = [], ...rest } = session;

      const sessionData: Partial<EncryptedSession> = {
        ...rest,
        metadata: {
          messageCount: rest.metadata?.messageCount || 0,
          activeDurationMs: rest.metadata?.activeDurationMs || 0,
          creditsUsed: rest.metadata?.creditsUsed || 0,
          lastActiveAt: rest.metadata?.lastActiveAt || new Date(),
        },
      };

      if (messages.length > 0) {
        const dataToEncrypt = { messages };

        const encryptResult = await encryptObjectWithKey(dataToEncrypt, contentKey);
        if (encryptResult.error) {
          throw new Error(encryptResult.error.message);
        }
        const encryptedData = encryptResult.data;

        sessionData.messages = encryptedData as EncryptedBlob;
      }

      return sessionData as EncryptedSession;
    },
    ERROR_CODES.SESSION_ENCRYPTION_FAILED,
    {
      userId: session.userId,
      operation: "crypto_encrypt_session",
      sessionId: session.id,
      metadata: {
        hasMessages: session?.messages?.length ? session.messages.length > 0 : false,
        messageCount: session?.messages?.length,
      },
    },
    "Session encrypted successfully"
  );

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function decryptSession(encryptedSession: EncryptedSession): Promise<Session> {
  const result = await logger.wrapOperation(
    async () => {
      const contentKey = await requireContentKey("crypto_decrypt_session", encryptedSession.id);

      // Base session with sane defaults
      // NOTE: memoryStore, aggregatedAnalysis, analysisSnapshots
      // are now stored server-side only in encrypted serverData field
      let session: Session = {
        id: encryptedSession.id,
        userId: encryptedSession.userId,
        title: encryptedSession.title,
        subtitle: encryptedSession.subtitle ?? "",
        autoUpdateTitle: encryptedSession.autoUpdateTitle ?? false,
        createdAt: encryptedSession.createdAt,
        updatedAt: encryptedSession.updatedAt,
        messages: [],
        //sessionDiagnostics: null,
        metadata: encryptedSession.metadata
          ? {
              ...SessionMetadataSchema.parse(encryptedSession.metadata),
              lastActiveAt: new Date(),
            }
          : {
              messageCount: 0,
              creditsUsed: 0,
              activeDurationMs: 0,
              lastActiveAt: new Date(),
            },
        persistOnCloud: encryptedSession.persistOnCloud ?? false,
      };

      // Decrypt sensitive data if available
      const parsedData = EncryptedBlobSchema.safeParse(encryptedSession.messages);

      if (parsedData.success) {
        const decryptResult = await decryptObjectWithKey<Partial<Session>>(parsedData.data, contentKey);
        if (decryptResult.error) {
          throw new Error(decryptResult.error.message);
        }
        const decryptedData = decryptResult.data;
        session = { ...session, ...decryptedData };
      }

      return session;
    },
    ERROR_CODES.SESSION_DECRYPTION_FAILED,
    {
      operation: "crypto_decrypt_session",
      sessionId: encryptedSession.id,
      metadata: {
        hasEncryptedData: !!encryptedSession.messages,
      },
    },
    "Session decrypted successfully"
  );

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function encryptSessionData(sessionData: SessionPayload): Promise<EncryptedBlob | null> {
  const result = await logger.wrapOperation(
    async () => {
      const contentKey = await requireContentKey("crypto_encrypt_session");

      // NOTE: memoryStore, aggregatedAnalysis, analysisSnapshots
      // are now stored server-side only in encrypted serverData field

      let encryptedData: EncryptedBlob | null = null;

      if (sessionData.messages.length > 0) {
        const encryptResult = await encryptObjectWithKey(sessionData, contentKey);
        if (encryptResult.error) {
          throw new Error(encryptResult.error.message);
        }
        encryptedData = encryptResult.data;
      }

      return encryptedData as EncryptedBlob | null;
    },
    ERROR_CODES.SESSION_ENCRYPTION_FAILED,
    {
      operation: "crypto_encrypt_session",
      metadata: {
        hasMessages: sessionData.messages.length > 0,
        messageCount: sessionData.messages.length,
      },
    },
    "Session encrypted successfully"
  );

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function decryptSessionData(encryptedData: EncryptedBlob): Promise<SessionPayload | null> {
  const result = await logger.wrapOperation(
    async () => {
      const contentKey = await requireContentKey("crypto_decrypt_session");

      // Decrypt sensitive data if available
      const parsedData = EncryptedBlobSchema.safeParse(encryptedData);

      let decryptedData: SessionPayload | null = null;

      if (parsedData.success) {
        const decryptResult = await decryptObjectWithKey<SessionPayload>(parsedData.data, contentKey);
        if (decryptResult.error) {
          throw new Error(decryptResult.error.message);
        }
        decryptedData = decryptResult.data;
      }

      return decryptedData;
    },
    ERROR_CODES.SESSION_DECRYPTION_FAILED,
    {
      operation: "crypto_decrypt_session",
    },
    "Session decrypted successfully"
  );

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export function getUniqueId(existingMap: Record<string, string>, prefix = "SESS"): string {
  const existingValues = new Set(Object.values(existingMap));
  let id;
  let attempts = 0;

  do {
    id = `${prefix}${nanoid(6)}`;
    attempts++;
    if (attempts > 100) {
      throw new Error("getUniqueId: too many attempts, possible collision storm");
    }
  } while (existingValues.has(id));

  return id;
}

export async function syncSession(session: Session) {
  const sessionStore = useSessionStore.getState();
  const { id: sessionId, messages } = session;

  const now = new Date();

  // Fast path: no messages → clear encrypted data
  if (messages.length === 0) {
    sessionStore.updateSession(sessionId, {
      messages: null,
      updatedAt: now,
    });
    return;
  }

  // Encrypt only messages (no need to recreate full object)
  const encryptedData = await encryptSessionData({ messages });

  sessionStore.updateSession(sessionId, {
    messages: encryptedData,
    updatedAt: now,
  });
}
