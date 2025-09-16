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
  version: 1;
  alg: "AES-GCM";
  iv: string; // base64
  ciphertext: string; // base64 (ciphertext + auth tag)
};

export const EncryptedBlobSchema = z.object({
  version: z.literal(1),
  alg: z.literal("AES-GCM"),
  iv: z.string().min(1), // base64 string
  ciphertext: z.string().min(1), // base64 string (ciphertext + auth tag)
});
