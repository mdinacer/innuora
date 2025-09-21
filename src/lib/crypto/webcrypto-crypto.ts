import localforage from "localforage";

import { EncryptedBlob, WrappedKeyPackage } from "@/lib/crypto/webcrypto-crypto.types";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";

/* webcrypto-crypto.ts
   Wrapped-key only (AES-GCM content + AES-KW wrapping)
   - PBKDF2 derives an AES-KW wrapping key from password+salt
   - Content key (AES-GCM) encrypts all user data
   - Content key is wrapped with AES-KW and stored as WrappedKeyPackage
*/
const SESSION_KEY = "MCK";

/* ---------- Runtime / utilities ---------- */
const subtle = (globalThis as any).crypto?.subtle;

function ensureSubtle(): SubtleCrypto {
  if (!subtle) {
    logger.logErrorAndThrow(
      ERROR_CODES.CRYPTO_WEBCRYPTO_UNAVAILABLE,
      new Error("Web Crypto (crypto.subtle) not available in runtime."),
      {
        operation: "crypto_ensure_subtle",
      }
    );
  }
  return subtle as SubtleCrypto;
}

function arrayBufferToBase64(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer as ArrayBuffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
function base64ToArrayBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
function getRandomBytes(len: number): Uint8Array {
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return arr; // stays Uint8Array
}
export function generateSalt(bytes = 16): string {
  return arrayBufferToBase64(getRandomBytes(bytes).buffer);
}

/* ---------- PBKDF2 -> AES-KW wrapping key derivation ---------- */

/**
 * Derive an AES-KW wrapping key from password+salt using PBKDF2.
 * - wrappingKey is non-extractable and usable for wrap/unwrap operations.
 */
export async function deriveWrappingKeyFromPassword(
  password: string,
  saltB64: string,
  iterations = 600_000
): Promise<CryptoKey> {
  return await logger.wrapOperation(
    async () => {
      const s = ensureSubtle();
      const enc = new TextEncoder();
      const passwordBytes = enc.encode(password);
      const salt = new Uint8Array(base64ToArrayBuffer(saltB64));

      const baseKey = await s.importKey("raw", passwordBytes, { name: "PBKDF2" }, false, ["deriveKey"]);

      const wrappingKey = await s.deriveKey(
        {
          name: "PBKDF2",
          salt,
          iterations,
          hash: "SHA-256",
        },
        baseKey,
        { name: "AES-KW", length: 256 },
        false, // non-extractable
        ["wrapKey", "unwrapKey"]
      );

      return wrappingKey;
    },
    ERROR_CODES.CRYPTO_KEY_DERIVATION_FAILED,
    { operation: "deriveWrappingKeyFromPassword", metadata: { iterations } }
  );
}

/* ---------- Content key management (AES-GCM) ---------- */

/** Generate a fresh AES-GCM content key (extractable so we can wrap/export if needed). */
export async function generateContentKey(): Promise<CryptoKey> {
  return await logger.wrapOperation(
    async () => {
      const s = ensureSubtle();
      return s.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    },
    ERROR_CODES.CRYPTO_KEY_GENERATION_FAILED,
    { operation: "generateContentKey" }
  );
}

/** Export a symmetric key to base64 (raw). Use sparingly: exporting increases exposure. */
export async function exportKeyToBase64(key: CryptoKey): Promise<string> {
  const s = ensureSubtle();
  const raw = await s.exportKey("raw", key);
  return arrayBufferToBase64(raw);
}

/** Import a raw AES-GCM key from base64 (raw format). */
export async function importRawKeyFromBase64(rawB64: string): Promise<CryptoKey> {
  const s = ensureSubtle();
  const rawBuf = base64ToArrayBuffer(rawB64);
  return s.importKey("raw", rawBuf, { name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

/* ---------- Wrap / Unwrap content key using AES-KW ---------- */

/**
 * Wrap a content key with a password-derived wrapping key (AES-KW).
 * Returns a JSON-serializable WrappedKeyPackage for storage (e.g., Supabase user_metadata).
 */
export async function wrapContentKeyWithPassword(
  contentKey: CryptoKey,
  password: string,
  iterations = 600_000
): Promise<WrappedKeyPackage> {
  return await logger.wrapOperation(
    async () => {
      const s = ensureSubtle();
      const salt = getRandomBytes(16);
      const saltB64 = arrayBufferToBase64(salt.buffer);

      const wrappingKey = await deriveWrappingKeyFromPassword(password, saltB64, iterations);

      // wrapKey returns ArrayBuffer
      const wrapped = await s.wrapKey("raw", contentKey, wrappingKey, { name: "AES-KW" });
      const wrappedB64 = arrayBufferToBase64(wrapped);

      return {
        version: 1,
        kdf: "PBKDF2",
        hash: "SHA-256",
        iterations,
        salt: saltB64,
        wrappedKey: wrappedB64,
      };
    },
    ERROR_CODES.CRYPTO_KEY_WRAP_FAILED,
    { operation: "wrapContentKeyWithPassword", metadata: { iterations } }
  );
}

/**
 * Unwrap a WrappedKeyPackage using the provided password. Returns the AES-GCM contentKey.
 */
export async function unwrapContentKeyWithPassword(pkg: WrappedKeyPackage, password: string): Promise<CryptoKey> {
  return await logger.wrapOperation(
    async () => {
      const s = ensureSubtle();

      if (pkg.kdf !== "PBKDF2" || pkg.hash !== "SHA-256") {
        logger.logErrorAndThrow(
          ERROR_CODES.CRYPTO_INVALID_KEY_PACKAGE,
          new Error("Unsupported KDF/hash in wrapped key package."),
          {
            operation: "unwrapContentKeyWithPassword",
            metadata: { kdf: pkg.kdf, hash: pkg.hash },
          }
        );
      }

      const wrappingKey = await deriveWrappingKeyFromPassword(password, pkg.salt, pkg.iterations);
      const wrappedBuf = base64ToArrayBuffer(pkg.wrappedKey);

      // unwrapKey to AES-GCM content key
      const contentKey = await s.unwrapKey(
        "raw",
        wrappedBuf,
        wrappingKey,
        { name: "AES-KW" },
        { name: "AES-GCM", length: 256 },
        true, // extractable true if you want to export for remember-me flows; false to harden
        ["encrypt", "decrypt"]
      );

      return contentKey;
    },
    ERROR_CODES.CRYPTO_KEY_UNWRAP_FAILED,
    { operation: "unwrapContentKeyWithPassword", metadata: { iterations: pkg.iterations } }
  );
}

/* ---------- Encrypt / Decrypt using contentKey (AES-GCM) ---------- */

/**
 * Encrypt a JSON-serializable object/value with a content key.
 * Returns an EncryptedBlob (JSON-serializable): { iv, ciphertext }.
 */
export async function encryptObjectWithKey<T>(data: T, contentKey: CryptoKey): Promise<EncryptedBlob> {
  return await logger.wrapOperation(
    async () => {
      const json = JSON.stringify(data);
      const pt = new TextEncoder().encode(json);
      const iv = new Uint8Array(getRandomBytes(12).buffer);
      const cipherBuffer = await subtle.encrypt({ name: "AES-GCM", iv }, contentKey, pt);
      return {
        version: 1,
        alg: "AES-GCM",
        iv: arrayBufferToBase64(iv.buffer),
        ciphertext: arrayBufferToBase64(cipherBuffer),
      };
    },
    ERROR_CODES.CRYPTO_ENCRYPTION_FAILED,
    { operation: "encryptObjectWithKey" }
  );
}

/**
 * Decrypt an EncryptedBlob using a contentKey and parse JSON back into T.
 */
export async function decryptObjectWithKey<T>(blob: EncryptedBlob, contentKey: CryptoKey): Promise<T> {
  return await logger.wrapOperation(
    async () => {
      const s = ensureSubtle();
      if (!blob.iv || !blob.ciphertext) {
        logger.logErrorAndThrow(ERROR_CODES.CRYPTO_MALFORMED_DATA, new Error("Malformed encrypted blob."), {
          operation: "decryptObjectWithKey",
        });
      }
      const iv = new Uint8Array(base64ToArrayBuffer(blob.iv));
      const ct = base64ToArrayBuffer(blob.ciphertext);

      let plainBuf: ArrayBuffer;
      try {
        plainBuf = await s.decrypt({ name: "AES-GCM", iv }, contentKey, ct);
      } catch (error) {
        logger.logErrorAndThrow(
          ERROR_CODES.CRYPTO_DECRYPTION_FAILED,
          new Error("Decryption failed: invalid key or corrupted payload."),
          {
            operation: "decryptObjectWithKey",
            metadata: { originalError: error instanceof Error ? error.message : String(error) },
          }
        );
      }

      const json = new TextDecoder().decode(plainBuf!);
      return JSON.parse(json) as T;
    },
    ERROR_CODES.CRYPTO_DECRYPTION_FAILED,
    { operation: "decryptObjectWithKey" }
  );
}

/* ---------- High-level convenience flows ---------- */

/**
 * Create a new content key and wrap it with the user's password.
 * Returns { contentKey, wrappedPackage }.
 * - Persist wrappedPackage in server (user metadata).
 * - Keep contentKey in memory or optionally export+store locally for "remember me".
 */
export async function createAndWrapContentKeyForUser(password: string, iterations = 600_000) {
  const contentKey = await generateContentKey();
  const wrappedPackage = await wrapContentKeyWithPassword(contentKey, password, iterations);
  return { contentKey, wrappedPackage };
}

/**
 * Recover content key given the WrappedKeyPackage and the user's password.
 */
export async function recoverContentKeyFromWrapped(pkg: WrappedKeyPackage, password: string): Promise<CryptoKey> {
  return unwrapContentKeyWithPassword(pkg, password);
}

/**
 * Retrieve the stored content key (base64 string) from sessionStorage or IndexedDB.
 */
export async function getStoredContentKey(): Promise<CryptoKey | null> {
  try {
    if (typeof window === "undefined") return null;

    let keyB64: string | null = sessionStorage.getItem(SESSION_KEY);
    if (!keyB64) keyB64 = await localforage.getItem(SESSION_KEY);

    if (!keyB64) return null;

    return importRawKeyFromBase64(keyB64);
  } catch (error) {
    // Log but don't throw - return null to indicate key not available
    logger.logWarning("Failed to retrieve stored content key", {
      operation: "getStoredContentKey",
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    return null;
  }
}

/**
 * Store the content key (base64) in sessionStorage or IndexedDB depending on persist flag.
 */
export async function storeContentKey(key: CryptoKey, persist: boolean = false): Promise<void> {
  return await logger.wrapOperation(
    async () => {
      // Export CryptoKey to base64
      const keyB64 = await exportKeyToBase64(key);

      if (typeof window === "undefined") return;

      if (persist) {
        // store in IndexedDB via localforage
        await localforage.setItem(SESSION_KEY, keyB64);
      } else {
        // store in sessionStorage
        sessionStorage.setItem(SESSION_KEY, keyB64);
      }
    },
    ERROR_CODES.CRYPTO_KEY_STORAGE_FAILED,
    { operation: "storeContentKey", metadata: { persist } }
  );
}

/**
 * Clear content key from both storages.
 */
export function clearStoredContentKey(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
  localforage.removeItem(SESSION_KEY);
}
