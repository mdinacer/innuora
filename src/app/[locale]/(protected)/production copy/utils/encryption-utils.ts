import { decryptObjectWithKey, encryptObjectWithKey, getStoredContentKey } from "@/lib/crypto/webcrypto-crypto";
import { EncryptedBlob, EncryptedBlobSchema } from "@/lib/crypto/webcrypto-crypto.types";
import { ERROR_CODES } from "@/lib/errors";
import { logger } from "@/lib/logging/logger.client";
import { SessionPayload } from "../types/session-runtime";

async function requireContentKey(operation: string): Promise<CryptoKey> {
  const contentKey = await getStoredContentKey();
  if (!contentKey) {
    logger.logErrorAndThrow(ERROR_CODES.CRYPTO_KEY_RETRIEVAL_FAILED, new Error("No content key found"), {
      operation,
    });
  }
  return contentKey as CryptoKey;
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
