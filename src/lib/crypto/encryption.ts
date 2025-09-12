// lib/crypto/session-encryption.ts
import * as crypto from "crypto";
import { promisify } from "util";

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

export function getSessionKey(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SESSION_KEY);
}

export function setSessionKey(keyHex: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, keyHex);
}

export function clearSessionKey(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

export function needsAuthentication(): boolean {
  return getSessionKey() === null;
}

/* -------------------------------------------------------------------------- */
/*  Encryption + Decryption                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Encrypt a ClearSession (bundle) into a DB-storable bundle.
 * Uses the current in-memory session key (stored as hex in sessionStorage).
 */
export function encryptData(clear: object): EncryptedData {
  const keyHex = getSessionKey();
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
export function decryptData<T extends EncryptedData, R>(data: T): R {
  const keyHex = getSessionKey();
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

export function safeEncrypt(data: object): EncryptedData {
  try {
    return encryptData(data);
  } catch (err) {
    if (err instanceof EncryptionError) throw err;
    throw new EncryptionError("Encryption failed", "ENCRYPTION_FAILED");
  }
}

export function safeDecrypt<R>(data: EncryptedData): R {
  try {
    return decryptData(data);
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
