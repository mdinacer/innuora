import { z } from "zod";

export const WrappedKeyPackageSchema = z.object({
  version: z.literal(1),
  kdf: z.literal("PBKDF2"),
  hash: z.literal("SHA-256"),
  iterations: z.number().int().positive(),
  salt: z.string().min(1), // base64 string
  wrappedKey: z.string().min(1), // base64 string
});

export type WrappedKeyPackage = {
  version: 1;
  kdf: "PBKDF2";
  hash: "SHA-256";
  iterations: number;
  salt: string; // base64
  wrappedKey: string; // base64 (wrapped content key, via AES-KW)
};

export type EncryptedBlob = {
  version: number; // 1
  alg: "AES-GCM";
  iv: string; // base64
  ciphertext: string; // base64 (ciphertext + auth tag)
};

// export const EncryptedBlobSchema = z.object({
//   version: z.number().int().positive(),
//   alg: z.literal("AES-GCM"),
//   iv: z.string().min(1), // base64 string
//   ciphertext: z.string().min(1), // base64 string (ciphertext + auth tag)
// });

const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/;

export const EncryptedBlobSchema = z.object({
  version: z.literal(1), // enforce current version, makes migrations safer later
  alg: z.literal("AES-GCM"),
  iv: z
    .string()
    .regex(base64Regex, "IV must be base64-encoded")
    .refine(
      (val) => {
        try {
          const bytes = Uint8Array.from(atob(val), (c) => c.charCodeAt(0));
          return bytes.length === 12; // AES-GCM IV = 96 bits
        } catch {
          return false;
        }
      },
      { message: "IV must decode to 12 bytes" }
    ),
  ciphertext: z.string().regex(base64Regex, "Ciphertext must be base64-encoded"),
});
