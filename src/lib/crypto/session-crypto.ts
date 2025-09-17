import { Session as PrismaSession } from "@prisma/client";

import { Session, SessionMeta, SessionMetadataSchema } from "@/lib/ai/mirael-core/v2/open-chat-session.types";
import { MODELS_CODES } from "@/lib/constants/ai-models";
import { decryptObjectWithKey, encryptObjectWithKey, getStoredContentKey } from "@/lib/crypto/webcrypto-crypto";
import { EncryptedBlob } from "@/lib/crypto/webcrypto-crypto.types";
import { ERROR_CODES, errorManager } from "@/lib/errors";

const DEFAULT_MODEL_CODE = process.env.NEXT_PUBLIC_DEFAULT_MODEL_CODE ?? MODELS_CODES.M1;

export async function encryptSession(session: Partial<Session>): Promise<PrismaSession> {
  return await errorManager.wrapOperation(
    async () => {
      const contentKey = await getStoredContentKey();

      if (!contentKey) {
        throw new Error("No content key found");
      }

      const { messages = [], memoryStore, continuitySummary, aggregatedAnalysis, analysisSnapshots, ...rest } = session;

      let sessionData: Partial<PrismaSession> = {
        ...rest,
        metadata: {
          ...rest.metadata,
          tokenUsage: [],
        },
      };

      const hasData = messages?.length > 0;

      if (hasData) {
        const dataToEncrypt = {
          messages,
          ...(memoryStore ? { memoryStore } : {}),
          ...(continuitySummary ? { continuitySummary } : {}),
          ...(aggregatedAnalysis ? { aggregatedAnalysis } : {}),
          ...(analysisSnapshots ? { analysisSnapshots } : {}),
        };

        const encryptedData: EncryptedBlob = await encryptObjectWithKey(dataToEncrypt, contentKey);

        sessionData = {
          ...sessionData,
          encryptedData,
        };
      }

      return sessionData as PrismaSession;
    },
    ERROR_CODES.SESSION_ENCRYPTION_FAILED,
    { operation: "encryptSession", sessionId: session.id }
  );
}

export async function decryptSession(encryptedSession: PrismaSession): Promise<Session> {
  return await errorManager.wrapOperation(
    async () => {
      const contentKey = await getStoredContentKey();

      if (!contentKey) {
        throw new Error("No content key found");
      }

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
        metadata: (encryptedSession.metadata
          ? { ...SessionMetadataSchema.parse(encryptedSession.metadata), tokenUsage: [] }
          : { messageCount: 0, tokenCount: 0, costUSD: 0, tokenUsage: [] }) as SessionMeta,
        analysisSnapshots: [],
        persistOnCloud: encryptedSession.persistOnCloud ?? false,
      };

      // Only decrypt if there's encrypted data
      if (encryptedSession.encryptedData) {
        const decryptedData = await decryptObjectWithKey<Partial<Session>>(
          encryptedSession.encryptedData as EncryptedBlob,
          contentKey
        );

        session = { ...session, ...decryptedData } as Session;
      }

      return session;
    },
    ERROR_CODES.SESSION_DECRYPTION_FAILED,
    { operation: "decryptSession", sessionId: encryptedSession.id }
  );
}
