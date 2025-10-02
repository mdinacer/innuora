import { Session as PrismaSession } from "@prisma/client";

import { Session, SessionMetadataSchema } from "@/domains/open-chat/open-chat.types";
import { decryptObjectWithKey, encryptObjectWithKey, getStoredContentKey } from "@/lib/crypto/webcrypto-crypto";
import { EncryptedBlob, EncryptedBlobSchema } from "@/lib/crypto/webcrypto-crypto.types";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";

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

export async function encryptSession(session: Partial<Session>): Promise<PrismaSession> {
  const result = await logger.wrapOperation(
    async () => {
      const contentKey = await requireContentKey("crypto_encrypt_session", session.id);

      const { messages = [], memoryStore, continuitySummary, aggregatedAnalysis, analysisSnapshots, ...rest } = session;

      const sessionData: Partial<PrismaSession> = {
        ...rest,
        metadata: {
          ...rest.metadata,
          tokenUsage: [],
          lastActiveAt: (rest.metadata?.lastActiveAt || new Date()).toISOString(),
        },
      };

      if (messages.length > 0) {
        const dataToEncrypt = {
          messages,
          ...(memoryStore && { memoryStore }),
          ...(continuitySummary && { continuitySummary }),
          ...(aggregatedAnalysis && { aggregatedAnalysis }),
          ...(analysisSnapshots && { analysisSnapshots }),
        };

        const encryptResult = await encryptObjectWithKey(dataToEncrypt, contentKey);
        if (encryptResult.error) {
          throw new Error(encryptResult.error.message);
        }
        const encryptedData = encryptResult.data;

        sessionData.encryptedData = encryptedData as EncryptedBlob;
      }

      return sessionData as PrismaSession;
    },
    ERROR_CODES.SESSION_ENCRYPTION_FAILED,
    {
      operation: "crypto_encrypt_session",
      sessionId: session.id,
      metadata: {
        // hasMessages: messages.length > 0,
        // messageCount: messages.length,
      },
    },
    "Session encrypted successfully"
  );

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

export async function decryptSession(encryptedSession: PrismaSession): Promise<Session> {
  const result = await logger.wrapOperation(
    async () => {
      const contentKey = await requireContentKey("crypto_decrypt_session", encryptedSession.id);

      // Base session with sane defaults
      let session: Session = {
        id: encryptedSession.id,
        userId: encryptedSession.userId,
        title: encryptedSession.title,
        subtitle: encryptedSession.subtitle ?? "",
        autoUpdateTitle: encryptedSession.autoUpdateTitle ?? false,
        createdAt: encryptedSession.createdAt,
        updatedAt: encryptedSession.updatedAt,
        messages: [],
        memoryStore: null,
        continuitySummary: null,
        aggregatedAnalysis: null,
        analysisSnapshots: [],
        sessionDiagnostics: null,
        metadata: encryptedSession.metadata
          ? {
              ...SessionMetadataSchema.parse(encryptedSession.metadata),
              lastActiveAt: new Date(),
              tokenUsage: [],
            }
          : {
              messageCount: 0,
              tokenCount: 0,
              inputTokens: 0,
              outputTokens: 0,
              costUSD: 0,
              creditsUsed: 0,
              activeDurationMs: 0,
              lastActiveAt: new Date(),
              tokenUsage: [],
            },
        persistOnCloud: encryptedSession.persistOnCloud ?? false,
      };

      // Decrypt sensitive data if available
      const parsedData = EncryptedBlobSchema.safeParse(encryptedSession.encryptedData);

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
        hasEncryptedData: !!encryptedSession.encryptedData,
      },
    },
    "Session decrypted successfully"
  );

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}
