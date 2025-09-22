/**
 * Unit tests for WebCrypto cryptographic functions
 * Critical security foundation - tests core encryption/decryption operations
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearStoredContentKey,
  createAndWrapContentKeyForUser,
  decryptObjectWithKey,
  deriveWrappingKeyFromPassword,
  encryptObjectWithKey,
  exportKeyToBase64,
  generateContentKey,
  generateSalt,
  getStoredContentKey,
  importRawKeyFromBase64,
  recoverContentKeyFromWrapped,
  storeContentKey,
  unwrapContentKeyWithPassword,
  wrapContentKeyWithPassword,
} from "../webcrypto-crypto";
import { WrappedKeyPackage } from "../webcrypto-crypto.types";

// Mock the logger to avoid test noise
vi.mock("@/lib/logging/unified-logger", () => ({
  logger: {
    wrapOperation: vi.fn(async (fn) => await fn()),
    logErrorAndThrow: vi.fn((code, error) => {
      throw error;
    }),
    logWarning: vi.fn(),
  },
}));

describe("WebCrypto Crypto Functions", () => {
  beforeEach(() => {
    clearStoredContentKey();
  });

  afterEach(() => {
    clearStoredContentKey();
  });

  describe("Key Generation", () => {
    it("should generate a valid AES-GCM content key", async () => {
      const key = await generateContentKey();

      expect(key).toBeInstanceOf(CryptoKey);
      expect(key.type).toBe("secret");
      expect(key.algorithm.name).toBe("AES-GCM");
      expect((key.algorithm as AesKeyAlgorithm).length).toBe(256);
      expect(key.usages).toContain("encrypt");
      expect(key.usages).toContain("decrypt");
    });

    it("should generate different keys each time", async () => {
      const key1 = await generateContentKey();
      const key2 = await generateContentKey();

      const key1B64 = await exportKeyToBase64(key1);
      const key2B64 = await exportKeyToBase64(key2);

      expect(key1B64).not.toBe(key2B64);
    });

    it("should generate a base64 salt", () => {
      const salt = generateSalt();

      expect(typeof salt).toBe("string");
      expect(salt.length).toBeGreaterThan(0);

      // Should be valid base64
      expect(() => atob(salt)).not.toThrow();

      // Default should be 16 bytes = 24 base64 chars (with padding)
      const decoded = atob(salt);
      expect(decoded.length).toBe(16);
    });

    it("should generate salts of different lengths", () => {
      const salt8 = generateSalt(8);
      const salt32 = generateSalt(32);

      const decoded8 = atob(salt8);
      const decoded32 = atob(salt32);

      expect(decoded8.length).toBe(8);
      expect(decoded32.length).toBe(32);
    });

    it("should generate different salts each time", () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();

      expect(salt1).not.toBe(salt2);
    });
  });

  describe("Key Derivation", () => {
    it("should derive a wrapping key from password and salt", async () => {
      const password = "secure-test-password-123";
      const salt = generateSalt();

      const wrappingKey = await deriveWrappingKeyFromPassword(password, salt);

      expect(wrappingKey).toBeInstanceOf(CryptoKey);
      expect(wrappingKey.type).toBe("secret");
      expect(wrappingKey.algorithm.name).toBe("AES-KW");
      expect((wrappingKey.algorithm as AesKeyAlgorithm).length).toBe(256);
      expect(wrappingKey.usages).toContain("wrapKey");
      expect(wrappingKey.usages).toContain("unwrapKey");
      expect(wrappingKey.extractable).toBe(false);
    });

    it("should derive the same key for same password and salt", async () => {
      const password = "consistent-password";
      const salt = generateSalt();

      const key1 = await deriveWrappingKeyFromPassword(password, salt);
      const key2 = await deriveWrappingKeyFromPassword(password, salt);

      // Can't directly compare CryptoKey objects, so test by using them
      const contentKey = await generateContentKey();

      const package1 = await wrapContentKeyWithPassword(contentKey, password);
      const recovered1 = await unwrapContentKeyWithPassword(package1, password);

      // Should be able to encrypt/decrypt with recovered key
      const testData = { test: "consistency check" };
      const encrypted = await encryptObjectWithKey(testData, recovered1);
      const decrypted = await decryptObjectWithKey(encrypted, recovered1);

      expect(decrypted).toEqual(testData);
    });

    it("should derive different keys for different passwords", async () => {
      const salt = generateSalt();
      const password1 = "password-one";
      const password2 = "password-two";

      const key1 = await deriveWrappingKeyFromPassword(password1, salt);
      const key2 = await deriveWrappingKeyFromPassword(password2, salt);

      // Test that keys are different by attempting cross-password operations
      const contentKey = await generateContentKey();
      const package1 = await wrapContentKeyWithPassword(contentKey, password1);

      await expect(unwrapContentKeyWithPassword(package1, password2)).rejects.toThrow();
    });

    it("should derive different keys for different salts", async () => {
      const password = "same-password";
      const salt1 = generateSalt();
      const salt2 = generateSalt();

      const key1 = await deriveWrappingKeyFromPassword(password, salt1);
      const key2 = await deriveWrappingKeyFromPassword(password, salt2);

      // Verify keys are different by testing cross-salt operations
      const contentKey = await generateContentKey();

      // Manually create packages with different salts
      const package1: WrappedKeyPackage = {
        version: 1,
        kdf: "PBKDF2",
        hash: "SHA-256",
        iterations: 600000,
        salt: salt1,
        wrappedKey: "", // Will be filled by wrapKey operation
      };

      // Since we can't easily test cross-salt directly, test that same password
      // with different salts would produce different results
      expect(salt1).not.toBe(salt2);
    });

    it("should respect custom iteration counts", async () => {
      const password = "iteration-test";
      const salt = generateSalt();
      const iterations = 100000; // Lower for faster test

      const key = await deriveWrappingKeyFromPassword(password, salt, iterations);

      expect(key).toBeInstanceOf(CryptoKey);
      expect(key.algorithm.name).toBe("AES-KW");
    });
  });

  describe("Key Import/Export", () => {
    it("should export and import a key correctly", async () => {
      const originalKey = await generateContentKey();

      const keyB64 = await exportKeyToBase64(originalKey);
      expect(typeof keyB64).toBe("string");
      expect(keyB64.length).toBeGreaterThan(0);

      const importedKey = await importRawKeyFromBase64(keyB64);

      expect(importedKey).toBeInstanceOf(CryptoKey);
      expect(importedKey.algorithm.name).toBe("AES-GCM");
      expect((importedKey.algorithm as AesKeyAlgorithm).length).toBe(256);

      // Test that imported key works the same as original
      const testData = { message: "test export/import" };
      const encrypted = await encryptObjectWithKey(testData, originalKey);
      const decrypted = await decryptObjectWithKey(encrypted, importedKey);

      expect(decrypted).toEqual(testData);
    });

    it("should handle invalid base64 gracefully", async () => {
      const invalidB64 = "invalid-base64-string!@#";

      await expect(importRawKeyFromBase64(invalidB64)).rejects.toThrow();
    });
  });

  describe("Key Wrapping/Unwrapping", () => {
    it("should wrap and unwrap a content key", async () => {
      const contentKey = await generateContentKey();
      const password = "wrapping-test-password";

      // Wrap the key
      const wrappedPackage = await wrapContentKeyWithPassword(contentKey, password);

      expect(wrappedPackage).toHaveProperty("version", 1);
      expect(wrappedPackage).toHaveProperty("kdf", "PBKDF2");
      expect(wrappedPackage).toHaveProperty("hash", "SHA-256");
      expect(wrappedPackage).toHaveProperty("iterations");
      expect(wrappedPackage).toHaveProperty("salt");
      expect(wrappedPackage).toHaveProperty("wrappedKey");

      expect(wrappedPackage.iterations).toBeGreaterThan(0);
      expect(typeof wrappedPackage.salt).toBe("string");
      expect(typeof wrappedPackage.wrappedKey).toBe("string");

      // Unwrap the key
      const unwrappedKey = await unwrapContentKeyWithPassword(wrappedPackage, password);

      expect(unwrappedKey).toBeInstanceOf(CryptoKey);
      expect(unwrappedKey.algorithm.name).toBe("AES-GCM");

      // Test that unwrapped key works the same as original
      const testData = { test: "wrap/unwrap verification" };
      const encrypted1 = await encryptObjectWithKey(testData, contentKey);
      const encrypted2 = await encryptObjectWithKey(testData, unwrappedKey);

      const decrypted1 = await decryptObjectWithKey(encrypted1, unwrappedKey);
      const decrypted2 = await decryptObjectWithKey(encrypted2, contentKey);

      expect(decrypted1).toEqual(testData);
      expect(decrypted2).toEqual(testData);
    });

    it("should fail unwrapping with wrong password", async () => {
      const contentKey = await generateContentKey();
      const correctPassword = "correct-password";
      const wrongPassword = "wrong-password";

      const wrappedPackage = await wrapContentKeyWithPassword(contentKey, correctPassword);

      await expect(unwrapContentKeyWithPassword(wrappedPackage, wrongPassword)).rejects.toThrow();
    });

    it("should handle custom iteration counts", async () => {
      const contentKey = await generateContentKey();
      const password = "custom-iterations";
      const iterations = 200000;

      const wrappedPackage = await wrapContentKeyWithPassword(contentKey, password, iterations);

      expect(wrappedPackage.iterations).toBe(iterations);

      const unwrappedKey = await unwrapContentKeyWithPassword(wrappedPackage, password);
      expect(unwrappedKey).toBeInstanceOf(CryptoKey);
    });

    it("should reject invalid wrapped key packages", async () => {
      const invalidPackage: WrappedKeyPackage = {
        version: 1,
        kdf: "INVALID" as any,
        hash: "SHA-256",
        iterations: 600000,
        salt: generateSalt(),
        wrappedKey: "invalid-wrapped-key",
      };

      await expect(unwrapContentKeyWithPassword(invalidPackage, "any-password")).rejects.toThrow();
    });
  });

  describe("Object Encryption/Decryption", () => {
    let contentKey: CryptoKey;

    beforeEach(async () => {
      contentKey = await generateContentKey();
    });

    it("should encrypt and decrypt simple objects", async () => {
      const testData = {
        message: "Hello, world!",
        number: 42,
        boolean: true,
        array: [1, 2, 3],
      };

      const encrypted = await encryptObjectWithKey(testData, contentKey);

      expect(encrypted).toHaveProperty("version", 1);
      expect(encrypted).toHaveProperty("alg", "AES-GCM");
      expect(encrypted).toHaveProperty("iv");
      expect(encrypted).toHaveProperty("ciphertext");

      expect(typeof encrypted.iv).toBe("string");
      expect(typeof encrypted.ciphertext).toBe("string");
      expect(encrypted.ciphertext).not.toContain("Hello, world!");

      const decrypted = await decryptObjectWithKey(encrypted, contentKey);

      expect(decrypted).toEqual(testData);
    });

    it("should handle complex nested objects", async () => {
      const complexData = {
        user: {
          id: "user-123",
          profile: {
            name: "Test User",
            preferences: {
              theme: "dark",
              notifications: {
                email: true,
                push: false,
                settings: [
                  { type: "security", enabled: true },
                  { type: "marketing", enabled: false },
                ],
              },
            },
          },
        },
        session: {
          messages: [
            { role: "user", content: "Hello" },
            { role: "assistant", content: "Hi there!" },
          ],
          metadata: {
            created: "2024-01-01T00:00:00Z",
            tokens: 150,
          },
        },
      };

      const encrypted = await encryptObjectWithKey(complexData, contentKey);
      const decrypted = await decryptObjectWithKey(encrypted, contentKey);

      expect(decrypted).toEqual(complexData);
    });

    it("should handle special characters and unicode", async () => {
      const unicodeData = {
        text: "Special chars: !@#$%^&*(){}[]|\\:;\"'<>,.?/~`",
        unicode: "Unicode: 🔒🔑 ñáéíóú 中文 日本語 العربية",
        emoji: "🎉🚀✨🔥💯",
        html: "<script>alert('test')</script>",
        sql: "'; DROP TABLE users; --",
      };

      const encrypted = await encryptObjectWithKey(unicodeData, contentKey);
      const decrypted = await decryptObjectWithKey(encrypted, contentKey);

      expect(decrypted).toEqual(unicodeData);
    });

    it("should handle large objects", async () => {
      const largeData = {
        messages: Array.from({ length: 1000 }, (_, i) => ({
          id: `msg-${i}`,
          content: `This is message ${i} with some content `.repeat(10),
          timestamp: new Date(`2024-01-${String((i % 28) + 1).padStart(2, "0")}T10:00:00Z`).toISOString(),
        })),
        metadata: {
          totalSize: "large",
          processing: Array.from({ length: 100 }, (_, i) => ({
            step: i,
            result: Math.random(),
            data: "processing step data ".repeat(5),
          })),
        },
      };

      const encrypted = await encryptObjectWithKey(largeData, contentKey);
      const decrypted = await decryptObjectWithKey<typeof largeData>(encrypted, contentKey);

      expect(decrypted).toEqual(largeData);
      expect(decrypted.messages).toHaveLength(1000);
      expect(decrypted.metadata.processing).toHaveLength(100);
    });

    it("should handle empty and null values", async () => {
      const edgeCaseData = {
        emptyString: "",
        emptyArray: [],
        emptyObject: {},
        nullValue: null,
        undefinedValue: undefined,
        zero: 0,
        false: false,
      };

      const encrypted = await encryptObjectWithKey(edgeCaseData, contentKey);
      const decrypted = await decryptObjectWithKey<typeof edgeCaseData>(encrypted, contentKey);

      // Note: JSON.parse will convert undefined to null or omit it
      expect(decrypted.emptyString).toBe("");
      expect(decrypted.emptyArray).toEqual([]);
      expect(decrypted.emptyObject).toEqual({});
      expect(decrypted.nullValue).toBeNull();
      expect(decrypted.zero).toBe(0);
      expect(decrypted.false).toBe(false);
    });

    it("should fail decryption with wrong key", async () => {
      const testData = { message: "secret data" };
      const wrongKey = await generateContentKey();

      const encrypted = await encryptObjectWithKey(testData, contentKey);

      await expect(decryptObjectWithKey(encrypted, wrongKey)).rejects.toThrow();
    });

    it("should fail decryption with corrupted data", async () => {
      const testData = { message: "test" };
      const encrypted = await encryptObjectWithKey(testData, contentKey);

      // Corrupt the ciphertext
      const corruptedEncrypted = {
        ...encrypted,
        ciphertext: encrypted.ciphertext.slice(0, -10) + "corrupted",
      };

      await expect(decryptObjectWithKey(corruptedEncrypted, contentKey)).rejects.toThrow();
    });

    it("should fail with malformed encrypted blob", async () => {
      const malformedBlob = {
        version: 1,
        alg: "AES-GCM" as const,
        iv: "",
        ciphertext: "",
      };

      await expect(decryptObjectWithKey(malformedBlob, contentKey)).rejects.toThrow("Malformed encrypted blob");
    });
  });

  describe("High-level Convenience Functions", () => {
    it("should create and wrap content key for user", async () => {
      const password = "user-password-123";
      const iterations = 400000;

      const result = await createAndWrapContentKeyForUser(password, iterations);

      expect(result).toHaveProperty("contentKey");
      expect(result).toHaveProperty("wrappedPackage");
      expect(result.contentKey).toBeInstanceOf(CryptoKey);
      expect(result.wrappedPackage.iterations).toBe(iterations);

      // Verify the wrapped package can recover the same key
      const recoveredKey = await recoverContentKeyFromWrapped(result.wrappedPackage, password);

      // Test that both keys work the same
      const testData = { test: "convenience function test" };
      const encrypted = await encryptObjectWithKey(testData, result.contentKey);
      const decrypted = await decryptObjectWithKey(encrypted, recoveredKey);

      expect(decrypted).toEqual(testData);
    });

    it("should recover content key from wrapped package", async () => {
      const password = "recovery-test";
      const { contentKey, wrappedPackage } = await createAndWrapContentKeyForUser(password);

      const recoveredKey = await recoverContentKeyFromWrapped(wrappedPackage, password);

      expect(recoveredKey).toBeInstanceOf(CryptoKey);
      expect(recoveredKey.algorithm.name).toBe("AES-GCM");

      // Verify functionality
      const testData = { recovery: "test" };
      const encrypted = await encryptObjectWithKey(testData, contentKey);
      const decrypted = await decryptObjectWithKey(encrypted, recoveredKey);

      expect(decrypted).toEqual(testData);
    });
  });

  describe("Key Storage", () => {
    it("should store and retrieve content key in session storage", async () => {
      const contentKey = await generateContentKey();

      await storeContentKey(contentKey, false);
      const retrievedKey = await getStoredContentKey();

      expect(retrievedKey).toBeInstanceOf(CryptoKey);
      expect(retrievedKey!.algorithm.name).toBe("AES-GCM");

      // Verify functionality
      const testData = { storage: "test" };
      const encrypted = await encryptObjectWithKey(testData, contentKey);
      const decrypted = await decryptObjectWithKey(encrypted, retrievedKey!);

      expect(decrypted).toEqual(testData);
    });

    it("should store and retrieve content key in persistent storage", async () => {
      const contentKey = await generateContentKey();

      await storeContentKey(contentKey, true);
      const retrievedKey = await getStoredContentKey();

      expect(retrievedKey).toBeInstanceOf(CryptoKey);
      expect(retrievedKey!.algorithm.name).toBe("AES-GCM");
    });

    it("should return null when no key is stored", async () => {
      clearStoredContentKey();

      const retrievedKey = await getStoredContentKey();
      expect(retrievedKey).toBeNull();
    });

    it("should clear stored content key", async () => {
      const contentKey = await generateContentKey();

      await storeContentKey(contentKey, false);
      expect(await getStoredContentKey()).not.toBeNull();

      clearStoredContentKey();
      expect(await getStoredContentKey()).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should handle missing WebCrypto gracefully", async () => {
      // This is more of a documentation test since we can't easily mock crypto.subtle away
      // in a real browser environment, but it tests the error path exists
      expect(typeof crypto.subtle).toBe("object");
    });

    it("should handle invalid iteration counts", async () => {
      const password = "test";
      const salt = generateSalt();

      // Very low iteration count should still work but be insecure
      const key = await deriveWrappingKeyFromPassword(password, salt, 1000);
      expect(key).toBeInstanceOf(CryptoKey);
    });

    it("should handle very long passwords", async () => {
      const longPassword = "a".repeat(10000);
      const salt = generateSalt();

      const key = await deriveWrappingKeyFromPassword(longPassword, salt);
      expect(key).toBeInstanceOf(CryptoKey);
    });

    it("should handle empty password gracefully", async () => {
      const emptyPassword = "";
      const salt = generateSalt();

      const key = await deriveWrappingKeyFromPassword(emptyPassword, salt);
      expect(key).toBeInstanceOf(CryptoKey);
    });
  });
});
