import { Session as PrismaSession } from "@prisma/client";

import { MODELS_CODES } from "@/domains/ai-conversation/ai-models";
import { Session, SessionMetadataSchema } from "@/domains/open-chat/open-chat.types";
import { decryptObjectWithKey, encryptObjectWithKey, getStoredContentKey } from "@/lib/crypto/webcrypto-crypto";
import { EncryptedBlob, EncryptedBlobSchema } from "@/lib/crypto/webcrypto-crypto.types";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";

const DEFAULT_MODEL_CODE = process.env.NEXT_PUBLIC_DEFAULT_MODEL_CODE ?? MODELS_CODES.M1;

/** Ensure content key is available or raise a managed error */
async function requireContentKey(operation: string, sessionId?: string) {
  const contentKey = await getStoredContentKey();
  if (!contentKey) {
    logger.logErrorAndThrow(ERROR_CODES.CRYPTO_KEY_RETRIEVAL_FAILED, new Error("No content key found"), {
      operation,
      sessionId,
    });
    throw new Error("Unreachable");
  }
  return contentKey;
}

export async function encryptSession(session: Partial<Session>): Promise<PrismaSession> {
  return logger.wrapOperation(
    async () => {
      const contentKey = await requireContentKey("crypto_encrypt_session", session.id);

      const { messages = [], memoryStore, continuitySummary, aggregatedAnalysis, analysisSnapshots, ...rest } = session;

      const sessionData: Partial<PrismaSession> = {
        ...rest,
        metadata: { ...rest.metadata, tokenUsage: [] },
      };

      if (messages.length > 0) {
        const dataToEncrypt = {
          messages,
          ...(memoryStore && { memoryStore }),
          ...(continuitySummary && { continuitySummary }),
          ...(aggregatedAnalysis && { aggregatedAnalysis }),
          ...(analysisSnapshots && { analysisSnapshots }),
        };

        const encryptedData: EncryptedBlob = await encryptObjectWithKey(dataToEncrypt, contentKey);

        sessionData.encryptedData = encryptedData;
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
}

export async function decryptSession(encryptedSession: PrismaSession): Promise<Session> {
  return logger.wrapOperation(
    async () => {
      const contentKey = await requireContentKey("crypto_decrypt_session", encryptedSession.id);

      // Base session with sane defaults
      let session: Session = {
        id: encryptedSession.id,
        userId: encryptedSession.userId,
        title: encryptedSession.title,
        subtitle: encryptedSession.subtitle ?? "",
        modelCode: encryptedSession.modelCode ?? DEFAULT_MODEL_CODE,
        autoUpdateTitle: encryptedSession.autoUpdateTitle ?? false,
        createdAt: encryptedSession.createdAt,
        updatedAt: encryptedSession.updatedAt,
        messages: [],
        memoryStore: null,
        continuitySummary: null,
        aggregatedAnalysis: null,
        analysisSnapshots: [],
        metadata: encryptedSession.metadata
          ? {
              ...SessionMetadataSchema.parse(encryptedSession.metadata),
              tokenUsage: [],
            }
          : { messageCount: 0, tokenCount: 0, costUSD: 0, tokenUsage: [] },
        persistOnCloud: encryptedSession.persistOnCloud ?? false,
      };

      // Decrypt sensitive data if available
      const parsedData = EncryptedBlobSchema.safeParse(encryptedSession.encryptedData);

      if (parsedData.success) {
        const decryptedData = await decryptObjectWithKey<Partial<Session>>(parsedData.data, contentKey);
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
}
