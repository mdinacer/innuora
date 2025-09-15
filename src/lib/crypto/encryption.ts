// lib/crypto/session-encryption.ts
import * as crypto from "crypto";
import { promisify } from "util";
import localforage from "localforage";

import { EncryptedData } from "@/lib/crypto/encryption.types";

/* -------------------------------------------------------------------------- */
/*  Types & Errors                                                             */
/* -------------------------------------------------------------------------- */

export class EncryptionError extends Error {
  constructor(
    message: string,
    public code: "AUTH_REQUIRED" | "ENCRYPTION_FAILED" | "DECRYPTION_FAILED" | "UNSUPPORTED_ALG" | "CORRUPTED_DATA"
  ) {
    super(message);
    this.name = "EncryptionError";
  }
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96 bits recommended for GCM
const KEY_LENGTH = 32; // 256 bits
const PBKDF2_ITERATIONS = 100_000;
const SESSION_KEY = "UEK"; // key stored in sessionStorage (hex)
const AAD_CONTEXT = Buffer.from("mirael-session-v1");

/* promisified pbkdf2 */
const pbkdf2Async = promisify(crypto.pbkdf2);

/* -------------------------------------------------------------------------- */
/*  Key derivation & salt utils                                                */
/* -------------------------------------------------------------------------- */

export async function deriveUserKey(passphrase: string, saltB64: string): Promise<Buffer> {
  const salt = Buffer.from(saltB64, "base64");
  // returns a Buffer
  const derived = (await pbkdf2Async(passphrase, salt, PBKDF2_ITERATIONS, KEY_LENGTH, "sha256")) as Buffer;
  return derived;
}

export function generateUserSalt(): string {
  return crypto.randomBytes(32).toString("base64");
}

/* -------------------------------------------------------------------------- */
/*  Session key (browser) management                                           */
/* -------------------------------------------------------------------------- */

export async function getSessionKey(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  // 1️⃣ Check sessionStorage first
  const sessionKey = sessionStorage.getItem(SESSION_KEY);
  if (sessionKey) return sessionKey;

  // 2️⃣ Fallback to localforage (IndexedDB)
  try {
    const storedKey = await localforage.getItem<string>(SESSION_KEY);
    return storedKey || null;
  } catch (error) {
    console.error("Failed to read session key from IndexedDB:", error);
    return null;
  }
}

export async function setSessionKey(keyHex: string, persist: boolean = false): Promise<void> {
  if (typeof window === "undefined") return;

  // Always put in sessionStorage for fast access
  sessionStorage.setItem(SESSION_KEY, keyHex);

  if (persist) {
    try {
      await localforage.setItem(SESSION_KEY, keyHex);
    } catch (error) {
      console.error("Failed to store session key in IndexedDB:", error);
    }
  }
}

export async function clearSessionKey(): Promise<void> {
  if (typeof window === "undefined") return;

  // Remove from sessionStorage
  sessionStorage.removeItem(SESSION_KEY);

  // Remove from IndexedDB (localforage)
  try {
    await localforage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("Failed to remove session key from IndexedDB:", error);
  }
}

export async function needsAuthentication(): Promise<boolean> {
  return (await getSessionKey()) === null;
}

/* -------------------------------------------------------------------------- */
/*  Encryption + Decryption                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Encrypt a ClearSession (bundle) into a DB-storable bundle.
 * Uses the current in-memory session key (stored as hex in sessionStorage).
 */
export async function encryptData(clear: object): Promise<EncryptedData> {
  const keyHex = await getSessionKey();
  if (!keyHex) throw new EncryptionError("No session key present - authentication required", "AUTH_REQUIRED");

  const key = Buffer.from(keyHex, "hex");
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  // Add additional authenticated data (context/version)
  cipher.setAAD(AAD_CONTEXT);

  const payload = {
    ...clear,
    __encryptedAt: new Date().toISOString(),
    __version: 1,
  };

  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedData: ciphertext,
    iv,
    authTag,
    encAlg: ALGORITHM,
  };
}

/**
 * Decrypt a DbSession row into a ClearSession
 * Throws EncryptionError on failure.
 */
export async function decryptData<T extends EncryptedData, R>(data: T): Promise<R> {
  const keyHex = await getSessionKey();
  if (!keyHex) throw new EncryptionError("No session key present - authentication required", "AUTH_REQUIRED");

  if (!data.encAlg || data.encAlg !== ALGORITHM) {
    throw new EncryptionError(`Unsupported algorithm: ${data.encAlg}`, "UNSUPPORTED_ALG");
  }

  const key = Buffer.from(keyHex, "hex");

  // createDecipheriv returns Decipher; cast to any to access GCM methods without TS complaints
  const decipher = crypto.createDecipheriv(data.encAlg, key, data.iv) as unknown as crypto.Decipher;
  // TypeScript lib definitions sometimes don't expose setAuthTag/setAAD on Decipher type,
  // so we use a runtime cast here to call them.
  (decipher as any).setAuthTag(data.authTag);
  (decipher as any).setAAD(AAD_CONTEXT);

  let decrypted: Buffer;
  try {
    decrypted = Buffer.concat([decipher.update(data.encryptedData), decipher.final()]);
  } catch {
    // authentication failed or corrupted data
    throw new EncryptionError("Decryption failed or data corrupted", "DECRYPTION_FAILED");
  }

  const parsed = JSON.parse(decrypted.toString("utf8"));
  // strip internal metadata
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { __encryptedAt, __version, ...clear } = parsed;
  return clear as R;
}

/* -------------------------------------------------------------------------- */
/*  Initialization & validation                                                */
/* -------------------------------------------------------------------------- */

export async function initializeUserEncryption(
  passphrase: string,
  existingSalt?: string
): Promise<{ key: string; salt: string; isNewUser: boolean }> {
  let salt = existingSalt;
  let isNewUser = false;

  if (!salt) {
    salt = generateUserSalt();
    isNewUser = true;
  }

  const keyBuf = await deriveUserKey(passphrase, salt);
  const keyHex = keyBuf.toString("hex");
  setSessionKey(keyHex);

  return { key: keyHex, salt, isNewUser };
}

/**
 * Basic validate cycle - uses in-memory key; does not talk to server
 */
// export function validateSessionKey(): boolean {
//   const keyHex = getSessionKey();
//   if (!keyHex) return false;

//   try {
//     const dummy: ClearSession = {
//       id: "test",
//       title: "Test Session",
//       subtitle: undefined,
//       createdAt: new Date(),
//       updatedAt: undefined,
//       messages: [],
//       memoryStore: null,
//       continuitySummary: null,
//       aggregatedAnalysis: null,
//       analysisSnapshots: [],
//       modelCode: "M1",
//       persistOnCloud: false,
//       autoUpdateTitle: false,
//       metadata: { tokenUsage: [], messageCount: 0, tokenCount: 0, costUSD: 0 },
//     };

//     const enc = encryptData(sessionToPersistedSession(dummy));
//     const fakeDb = {
//       id: "test",
//       userId: "test",
//       encryptedData: enc.encryptedData,
//       iv: enc.iv,
//       authTag: enc.authTag,
//       encAlg: enc.encAlg,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     } as DbSession;

//     const out = decryptData<DbSession, ClearSession>(fakeDb);
//     return out.title === dummy.title;
//   } catch {
//     return false;
//   }
// }

/* -------------------------------------------------------------------------- */
/*  Safe wrappers                                                               */
/* -------------------------------------------------------------------------- */

export async function safeEncrypt(data: object): Promise<EncryptedData> {
  try {
    return await encryptData(data);
  } catch (err) {
    if (err instanceof EncryptionError) throw err;
    throw new EncryptionError("Encryption failed", "ENCRYPTION_FAILED");
  }
}

export async function safeDecrypt<R>(data: EncryptedData): Promise<R> {
  try {
    return await decryptData(data);
  } catch (err) {
    if (err instanceof EncryptionError) throw err;
    throw new EncryptionError("Decryption failed", "DECRYPTION_FAILED");
  }
}

/* -------------------------------------------------------------------------- */
/*  Security helpers                                                            */
/* -------------------------------------------------------------------------- */
// TODO: move to a hook
export const FullSessionSecurity = {
  setupAutoLock(timeoutMinutes = 30): () => void {
    if (typeof window === "undefined") return () => {};
    let inactivityTimer: ReturnType<typeof setTimeout>;

    const reset = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(
        () => {
          clearSessionKey();
          window.dispatchEvent(new CustomEvent("session-expired"));
        },
        timeoutMinutes * 60 * 1000
      );
    };

    ["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach((evt) =>
      document.addEventListener(evt, reset, true)
    );

    reset();

    return () => {
      clearTimeout(inactivityTimer);
      ["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach((evt) =>
        document.removeEventListener(evt, reset, true)
      );
    };
  },

  logout(): void {
    clearSessionKey();
  },
};
