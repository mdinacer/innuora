/**
 * Server-Side Encryption Utilities
 *
 * Encrypts sensitive server data (therapeutic analysis, session memory)
 * using app-level encryption key (APP_ENCRYPTION_KEY).
 *
 * This data is NEVER sent to client - only used server-side for:
 * - Session continuity (previous analyses, memory)
 * - Diagnostics generation
 * - Therapeutic insights
 *
 * Security: AES-GCM with 256-bit key
 */

import { webcrypto } from "crypto";

import { EncryptedBlob } from "@/lib/crypto/webcrypto-crypto.types";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";

/**
 * Cache for app encryption key (avoid repeated key derivation)
 */
let cachedAppKey: CryptoKey | null = null;

/**
 * Gets the app-level encryption key from environment
 * This key is used to encrypt server-only data (not user data)
 */
async function getAppEncryptionKey(): Promise<CryptoKey> {
  // Return cached key if available
  if (cachedAppKey) {
    return cachedAppKey;
  }

  const keyMaterial = process.env.APP_ENCRYPTION_KEY;

  if (!keyMaterial) {
    logger.logErrorAndThrow(
      ERROR_CODES.CRYPTO_KEY_RETRIEVAL_FAILED,
      new Error("APP_ENCRYPTION_KEY environment variable not configured"),
      {
        operation: "server_crypto_get_app_key",
        metadata: { environment: process.env.NODE_ENV },
      }
    );
  }

  try {
    // Convert secret to bytes
    const encoder = new TextEncoder();
    const keyData = encoder.encode(keyMaterial);

    // Import as AES-GCM key
    cachedAppKey = await webcrypto.subtle.importKey(
      "raw",
      keyData.slice(0, 32), // Use first 32 bytes for 256-bit key
      { name: "AES-GCM", length: 256 },
      false, // Not extractable
      ["encrypt", "decrypt"]
    );

    return cachedAppKey;
  } catch (error) {
    logger.logErrorAndThrow(
      ERROR_CODES.CRYPTO_KEY_DERIVATION_FAILED,
      error instanceof Error ? error : new Error("Failed to import app encryption key"),
      {
        operation: "server_crypto_import_key",
      }
    );
  }

  // TypeScript safety - unreachable
  throw new Error("Unreachable");
}

/**
 * Encrypts server-only data using app encryption key
 *
 * @param data - Object to encrypt (will be JSON serialized)
 * @returns Encrypted blob with IV, ciphertext, and auth tag
 *
 * @example
 * const encrypted = await encryptServerData({
 *   analysisSnapshots: [...],
 *   memoryStore: "...",
 *   continuitySummary: {...}
 * });
 */
export async function encryptServerData(data: object): Promise<EncryptedBlob> {
  const result = await logger.wrapOperation(
    async () => {
      const key = await getAppEncryptionKey();

      // Generate random IV (12 bytes for GCM)
      const iv = webcrypto.getRandomValues(new Uint8Array(12));

      // Serialize data to JSON
      const jsonString = JSON.stringify(data);
      const encoded = new TextEncoder().encode(jsonString);

      // Encrypt with AES-GCM
      const ciphertext = await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);

      // Return as base64-encoded blob
      return {
        version: 1,
        alg: "AES-GCM" as const,
        iv: Buffer.from(iv).toString("base64"),
        ciphertext: Buffer.from(ciphertext).toString("base64"),
      };
    },
    ERROR_CODES.CRYPTO_ENCRYPTION_FAILED,
    {
      operation: "server_crypto_encrypt",
      metadata: {
        dataSize: JSON.stringify(data).length,
      },
    },
    "Server data encrypted successfully"
  );

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

/**
 * Decrypts server-only data using app encryption key
 *
 * @param blob - Encrypted blob from database
 * @returns Decrypted data object
 *
 * @example
 * const serverData = await decryptServerData(session.serverData);
 * const analyses = serverData.analysisSnapshots;
 */
export async function decryptServerData<T = object>(blob: EncryptedBlob): Promise<T> {
  const result = await logger.wrapOperation(
    async () => {
      const key = await getAppEncryptionKey();

      // Decode from base64
      const iv = Buffer.from(blob.iv, "base64");
      const ciphertext = Buffer.from(blob.ciphertext, "base64");

      // Decrypt with AES-GCM
      const decrypted = await webcrypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);

      // Decode and parse JSON
      const decoded = new TextDecoder().decode(decrypted);
      return JSON.parse(decoded) as T;
    },
    ERROR_CODES.CRYPTO_DECRYPTION_FAILED,
    {
      operation: "server_crypto_decrypt",
      metadata: {
        blobSize: blob.ciphertext.length,
      },
    },
    "Server data decrypted successfully"
  );

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}

/**
 * Creates an empty encrypted server data blob
 * Used when initializing new sessions
 */
export async function createEmptyServerData(): Promise<EncryptedBlob> {
  return await encryptServerData({
    analysisSnapshots: [],
    aggregatedAnalysis: null,
    memoryStore: null,
    continuitySummary: null,
  });
}

/**
 * Type definition for decrypted server data structure
 */
export interface ServerDataContent {
  analysisSnapshots: Array<any>; // TherapeuticAnalysisWithMessageId
  aggregatedAnalysis: any | null; // SessionAnalysis
  memoryStore: string | null;
  relationalTrace?: {
    // Holistic conversation engine - tracks conversation continuity
    last_theme: string;
    tone_shift: string;
    unresolved_thread: string;
    last_warmth_level: number;
    psychoeducation_last_turn: boolean;
  };

  // V7-specific fields (3-stage conversation engine)
  // Allows coexistence with production holistic engine for A/B testing
  v7_relational_trace?: any | null; // RelationalTrace from v7 reflection engine
  v7_analyses?: any[] | null; // InnuoraAnalysis[] - cognitive-emotional analyses
  v7_context_lifecycle?: {
    // Context synthesis caching metadata
    directive: string | null;
    hash: string | null;
    generatedAt: number | null;
    usageCount: number;
  } | null;
  v7_session_dynamics?: any | null; // SessionDynamicsMatrix - multi-scale emotional tracking
}
