/**
 * Unit tests for encrypted session crypto functions
 * Critical data security - tests encryption/decryption accuracy
 */

import { Session as PrismaSession } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Session } from "@/domains/open-chat/open-chat.types";
import { clearStoredContentKey, generateContentKey, storeContentKey } from "@/lib/crypto/webcrypto-crypto";
import { EncryptedBlob } from "@/lib/crypto/webcrypto-crypto.types";
import { decryptSession, encryptSession } from "../encrypted-session.crypto";

// Mock the logger to avoid test noise
vi.mock("@/lib/logging/unified-logger", () => ({
  logger: {
    wrapOperation: vi.fn(async (fn) => await fn()),
    logErrorAndThrow: vi.fn((code, error) => {
      throw error;
    }),
  },
}));

describe("Encrypted Session Crypto", () => {
  let contentKey: CryptoKey;

  beforeEach(async () => {
    // Clear any existing keys
    clearStoredContentKey();

    // Generate fresh content key for each test
    const keyResult = await generateContentKey();
    if (keyResult.error) throw new Error(keyResult.error.message);
    contentKey = keyResult.data!;

    const storeResult = await storeContentKey(contentKey);
    if (storeResult.error) throw new Error(storeResult.error.message);
  });

  afterEach(async () => {
    await clearStoredContentKey();
  });

  describe("encryptSession", () => {
    it("should encrypt a complete session with all data", async () => {
      const session: Partial<Session> = {
        id: "test-session-1",
        userId: "user-123",
        title: "Test Session",
        subtitle: "Test subtitle",
        autoUpdateTitle: true,
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "Hello, this is a test message",
            timestamp: new Date("2024-01-01T10:00:00Z").getTime(),
          },
          {
            id: "msg-2",
            role: "assistant",
            content: "Hello! How can I help you today?",
            timestamp: new Date("2024-01-01T10:01:00Z").getTime(),
          },
        ],
        memoryStore: "User personality: friendly and curious. Conversation context: therapy session.",
        aggregatedAnalysis: null,
        analysisSnapshots: [
          {
            core_module: "cognitive",
            process_module: "reframing",
            utility_module: "validate",
            intensity: "moderate",
            crisis: "mild",
            distortions: [],
            themes: [],
            core_beliefs: [],
            silent_rules: [],
            behavioral_patterns: [],
            state: "first_time",
            therapeutic_readiness: "ready",
            update_memory: true,
            recall_memory: false,
            analysis_value: "medium",
          },
        ],
        metadata: {
          messageCount: 2,
          tokenCount: 150,
          costUSD: 0.005,
          creditsUsed: 2,
          activeDurationMs: 60000,
          lastActiveAt: new Date("2024-01-01T10:01:00Z"),
          tokenUsage: [],
        },
        persistOnCloud: true,
      };

      const encryptedSession = await encryptSession(session);

      // Verify basic properties are preserved
      expect(encryptedSession.id).toBe(session.id);
      expect(encryptedSession.userId).toBe(session.userId);
      expect(encryptedSession.title).toBe(session.title);
      expect(encryptedSession.subtitle).toBe(session.subtitle);
      expect(encryptedSession.autoUpdateTitle).toBe(session.autoUpdateTitle);
      expect(encryptedSession.persistOnCloud).toBe(session.persistOnCloud);

      // Verify metadata is processed correctly
      expect(encryptedSession.metadata).toBeDefined();
      if (encryptedSession.metadata && typeof encryptedSession.metadata === "object") {
        expect((encryptedSession.metadata as any).tokenUsage).toEqual([]);
        expect((encryptedSession.metadata as any).lastActiveAt).toBeDefined();
      }

      // Verify sensitive data is encrypted
      expect(encryptedSession.encryptedData).toBeDefined();
      expect(encryptedSession.encryptedData).toHaveProperty("version");
      expect(encryptedSession.encryptedData).toHaveProperty("alg");
      expect(encryptedSession.encryptedData).toHaveProperty("iv");
      expect(encryptedSession.encryptedData).toHaveProperty("ciphertext");

      // Verify encrypted data doesn't contain plain text
      const encryptedBlob = encryptedSession.encryptedData as EncryptedBlob;
      expect(encryptedBlob.ciphertext).not.toContain("Hello, this is a test message");
      expect(encryptedBlob.ciphertext).not.toContain("therapy session");
    });

    it("should encrypt session with only messages", async () => {
      const session: Partial<Session> = {
        id: "test-session-2",
        userId: "user-123",
        title: "Minimal Session",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "Quick question",
            timestamp: Date.now(),
          },
        ],
      };

      const encryptedSession = await encryptSession(session);

      expect(encryptedSession.id).toBe(session.id);
      expect(encryptedSession.encryptedData).toBeDefined();

      const encryptedBlob = encryptedSession.encryptedData as EncryptedBlob;
      expect(encryptedBlob.ciphertext).not.toContain("Quick question");
    });

    it("should handle session with no messages", async () => {
      const session: Partial<Session> = {
        id: "test-session-3",
        userId: "user-123",
        title: "Empty Session",
        messages: [],
      };

      const encryptedSession = await encryptSession(session);

      expect(encryptedSession.id).toBe(session.id);
      expect(encryptedSession.title).toBe(session.title);

      // No encrypted data should be created for empty messages
      expect(encryptedSession.encryptedData).toBeUndefined();
    });

    it("should handle session with partial data", async () => {
      const session: Partial<Session> = {
        id: "test-session-4",
        userId: "user-123",
        title: "Partial Session",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "Test message",
            timestamp: Date.now(),
          },
        ],
        memoryStore: "User personality: analytical",
        // No continuitySummary, aggregatedAnalysis, or analysisSnapshots
      };

      const encryptedSession = await encryptSession(session);

      expect(encryptedSession.id).toBe(session.id);
      expect(encryptedSession.encryptedData).toBeDefined();
    });

    it("should throw error when no content key is available", async () => {
      clearStoredContentKey();

      const session: Partial<Session> = {
        id: "test-session-5",
        userId: "user-123",
        title: "Test Session",
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "Test",
            timestamp: Date.now(),
          },
        ],
      };

      await expect(encryptSession(session)).rejects.toThrow("No content key found");
    });
  });

  describe("decryptSession", () => {
    it("should decrypt a complete encrypted session", async () => {
      const originalSession: Partial<Session> = {
        id: "test-session-6",
        userId: "user-123",
        title: "Complete Session",
        subtitle: "Test subtitle",
        autoUpdateTitle: true,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T10:00:00Z"),
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "Original message content",
            timestamp: new Date("2024-01-01T09:30:00Z").getTime(),
          },
          {
            id: "msg-2",
            role: "assistant",
            content: "Assistant response content",
            timestamp: new Date("2024-01-01T09:31:00Z").getTime(),
          },
        ],
        memoryStore: "User personality: introverted and thoughtful. Conversation themes: self-reflection, growth.",
        aggregatedAnalysis: null,
        analysisSnapshots: [
          {
            core_module: "cognitive",
            process_module: "reframing",
            utility_module: "validate",
            intensity: "moderate",
            crisis: "mild",
            distortions: [],
            themes: [],
            core_beliefs: [],
            silent_rules: [],
            behavioral_patterns: [],
            state: "first_time",
            therapeutic_readiness: "ready",
            update_memory: true,
            recall_memory: false,
            analysis_value: "medium",
          },
        ],
        metadata: {
          messageCount: 2,
          tokenCount: 250,
          costUSD: 0.008,
          creditsUsed: 3,
          activeDurationMs: 120000,
          lastActiveAt: new Date("2024-01-01T09:31:00Z"),
          tokenUsage: [],
        },
        persistOnCloud: true,
      };

      // Encrypt then decrypt
      const encryptedSession = await encryptSession(originalSession);
      const decryptedSession = await decryptSession(encryptedSession);

      // Verify all properties are correctly restored
      expect(decryptedSession.id).toBe(originalSession.id);
      expect(decryptedSession.userId).toBe(originalSession.userId);
      expect(decryptedSession.title).toBe(originalSession.title);
      expect(decryptedSession.subtitle).toBe(originalSession.subtitle);
      expect(decryptedSession.autoUpdateTitle).toBe(originalSession.autoUpdateTitle);
      expect(decryptedSession.persistOnCloud).toBe(originalSession.persistOnCloud);

      // Verify dates
      expect(decryptedSession.createdAt).toEqual(originalSession.createdAt);
      expect(decryptedSession.updatedAt).toEqual(originalSession.updatedAt);

      // Verify decrypted messages
      expect(decryptedSession.messages).toHaveLength(2);
      expect(decryptedSession.messages[0].content).toBe("Original message content");
      expect(decryptedSession.messages[1].content).toBe("Assistant response content");
      expect(decryptedSession.messages[0].role).toBe("user");
      expect(decryptedSession.messages[1].role).toBe("assistant");

      // Verify decrypted complex data
      expect(decryptedSession.memoryStore).toEqual(originalSession.memoryStore);
      expect(decryptedSession.aggregatedAnalysis).toEqual(originalSession.aggregatedAnalysis);

      // Verify analysis snapshots
      expect(decryptedSession.analysisSnapshots).toHaveLength(originalSession.analysisSnapshots!.length);
      expect(decryptedSession.analysisSnapshots[0].core_module).toBe(originalSession.analysisSnapshots![0].core_module);
      expect(decryptedSession.analysisSnapshots[0].intensity).toBe(originalSession.analysisSnapshots![0].intensity);

      // Verify metadata is preserved and updated
      expect(decryptedSession.metadata.messageCount).toBe(originalSession.metadata!.messageCount);
      expect(decryptedSession.metadata.tokenCount).toBe(originalSession.metadata!.tokenCount);
      expect(decryptedSession.metadata.costUSD).toBe(originalSession.metadata!.costUSD);
      expect(decryptedSession.metadata.creditsUsed).toBe(originalSession.metadata!.creditsUsed);
    });

    it("should decrypt session with minimal data", async () => {
      const originalSession: Partial<Session> = {
        id: "test-session-7",
        userId: "user-123",
        title: "Minimal Session",
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:05:00Z"),
        messages: [
          {
            id: "msg-1",
            role: "user",
            content: "Simple message",
            timestamp: Date.now(),
          },
        ],
      };

      const encryptedSession = await encryptSession(originalSession);
      const decryptedSession = await decryptSession(encryptedSession);

      expect(decryptedSession.id).toBe(originalSession.id);
      expect(decryptedSession.messages).toHaveLength(1);
      expect(decryptedSession.messages[0].content).toBe("Simple message");

      // Verify defaults are applied
      expect(decryptedSession.subtitle).toBe("");
      expect(decryptedSession.autoUpdateTitle).toBe(false);
      expect(decryptedSession.memoryStore).toBeNull();
      expect(decryptedSession.aggregatedAnalysis).toBeNull();
      expect(decryptedSession.analysisSnapshots).toEqual([]);
    });

    it("should handle session with no encrypted data", async () => {
      const prismaSession: PrismaSession = {
        id: "test-session-8",
        userId: "user-123",
        title: "No Encrypted Data",
        subtitle: null,
        autoUpdateTitle: false,
        createdAt: new Date("2024-01-01T09:00:00Z"),
        updatedAt: new Date("2024-01-01T09:05:00Z"),
        metadata: {
          messageCount: 0,
          tokenCount: 0,
          costUSD: 0,
          creditsUsed: 0,
          activeDurationMs: 0,
          lastActiveAt: "2024-01-01T09:00:00Z",
          tokenUsage: [],
        },
        encryptedData: null,
        persistOnCloud: false,
      };

      const decryptedSession = await decryptSession(prismaSession);

      expect(decryptedSession.id).toBe(prismaSession.id);
      expect(decryptedSession.messages).toEqual([]);
      expect(decryptedSession.memoryStore).toBeNull();
      expect(decryptedSession.aggregatedAnalysis).toBeNull();
      expect(decryptedSession.analysisSnapshots).toEqual([]);

      // Verify default metadata is applied
      expect(decryptedSession.metadata.messageCount).toBe(0);
      expect(decryptedSession.metadata.tokenCount).toBe(0);
    });

    it("should handle invalid encrypted data gracefully", async () => {
      const prismaSession: PrismaSession = {
        id: "test-session-10",
        userId: "user-123",
        title: "Invalid Encrypted Data",
        subtitle: null,
        autoUpdateTitle: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: null,
        encryptedData: {
          version: 1,
          alg: "AES-GCM",
          iv: "invalid-base64",
          ciphertext: "invalid-ciphertext",
        } as any,
        persistOnCloud: false,
      };

      const decryptedSession = await decryptSession(prismaSession);

      // Should return session with defaults when encrypted data is invalid
      expect(decryptedSession.id).toBe(prismaSession.id);
      expect(decryptedSession.messages).toEqual([]);
      expect(decryptedSession.memoryStore).toBeNull();
    });

    it("should throw error when no content key is available", async () => {
      clearStoredContentKey();

      const prismaSession: PrismaSession = {
        id: "test-session-11",
        userId: "user-123",
        title: "No Key Available",
        subtitle: null,
        autoUpdateTitle: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: null,
        encryptedData: null,
        persistOnCloud: false,
      };

      await expect(decryptSession(prismaSession)).rejects.toThrow("No content key found");
    });
  });

  describe("Round-trip encryption/decryption", () => {
    it("should preserve all data through encrypt/decrypt cycle", async () => {
      const originalSession: Partial<Session> = {
        id: "roundtrip-test",
        userId: "user-456",
        title: "Round Trip Test",
        subtitle: "Testing data integrity",
        autoUpdateTitle: false,
        createdAt: new Date("2024-01-15T14:30:00Z"),
        updatedAt: new Date("2024-01-15T15:00:00Z"),
        messages: [
          {
            id: "msg-rt-1",
            role: "user",
            content: "Testing round-trip encryption with special characters: !@#$%^&*(){}[]|\\:;\"'<>,.?/~`",
            timestamp: new Date("2024-01-15T14:30:00Z").getTime(),
          },
          {
            id: "msg-rt-2",
            role: "assistant",
            content: "Response with unicode: 🔒🔑 encryption test ñáéíóú",
            timestamp: new Date("2024-01-15T14:31:00Z").getTime(),
          },
        ],
        memoryStore:
          "User personality: detail-oriented and security-conscious. Preferences: formal communication style, interested in security and technology. Sensitive data: This should be encrypted and preserved.",
        aggregatedAnalysis: null,
        analysisSnapshots: [
          {
            core_module: "cognitive",
            process_module: "reframing",
            utility_module: "validate",
            intensity: "moderate",
            crisis: "mild",
            distortions: [],
            themes: [],
            core_beliefs: [],
            silent_rules: [],
            behavioral_patterns: [],
            state: "first_time",
            therapeutic_readiness: "ready",
            update_memory: true,
            recall_memory: false,
            analysis_value: "medium",
          },
        ],
        metadata: {
          messageCount: 2,
          tokenCount: 425,
          costUSD: 0.012,
          creditsUsed: 5,
          activeDurationMs: 300000,
          lastActiveAt: new Date("2024-01-15T15:00:00Z"),
          tokenUsage: [],
        },
        persistOnCloud: true,
      };

      // Perform full round-trip
      const encryptedSession = await encryptSession(originalSession);
      const decryptedSession = await decryptSession(encryptedSession);

      // Verify main properties are correctly restored
      expect(decryptedSession.id).toBe(originalSession.id);
      expect(decryptedSession.userId).toBe(originalSession.userId);
      expect(decryptedSession.title).toBe(originalSession.title);
      expect(decryptedSession.subtitle).toBe(originalSession.subtitle);
      expect(decryptedSession.autoUpdateTitle).toBe(originalSession.autoUpdateTitle);
      expect(decryptedSession.persistOnCloud).toBe(originalSession.persistOnCloud);

      // Verify messages are correctly preserved
      expect(decryptedSession.messages).toHaveLength(originalSession.messages!.length);
      expect(decryptedSession.messages[0].content).toBe(originalSession.messages![0].content);
      expect(decryptedSession.messages[1].content).toBe(originalSession.messages![1].content);
      expect(decryptedSession.messages[0].timestamp).toBe(originalSession.messages![0].timestamp);
      expect(decryptedSession.messages[1].timestamp).toBe(originalSession.messages![1].timestamp);

      // Verify complex data structures
      expect(decryptedSession.memoryStore).toEqual(originalSession.memoryStore);
      expect(decryptedSession.aggregatedAnalysis).toEqual(originalSession.aggregatedAnalysis);

      // Verify analysis snapshots
      expect(decryptedSession.analysisSnapshots).toHaveLength(originalSession.analysisSnapshots!.length);
      expect(decryptedSession.analysisSnapshots[0].core_module).toBe(originalSession.analysisSnapshots![0].core_module);
      expect(decryptedSession.analysisSnapshots[0].intensity).toBe(originalSession.analysisSnapshots![0].intensity);

      // Verify dates are preserved
      expect(decryptedSession.createdAt).toEqual(originalSession.createdAt);
      expect(decryptedSession.updatedAt).toEqual(originalSession.updatedAt);

      // Verify metadata integrity
      expect(decryptedSession.metadata.messageCount).toBe(originalSession.metadata!.messageCount);
      expect(decryptedSession.metadata.tokenCount).toBe(originalSession.metadata!.tokenCount);
      expect(decryptedSession.metadata.costUSD).toBe(originalSession.metadata!.costUSD);
      expect(decryptedSession.metadata.creditsUsed).toBe(originalSession.metadata!.creditsUsed);
      expect(decryptedSession.metadata.activeDurationMs).toBe(originalSession.metadata!.activeDurationMs);
    });

    it("should handle large session data", async () => {
      // Create a session with large amounts of data
      const largeMessages = Array.from({ length: 100 }, (_, i) => ({
        id: `large-msg-${i}`,
        role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
        content: `This is message ${i} with substantial content. `.repeat(10),
        timestamp: new Date(
          `2024-01-01T${String(Math.floor(i / 4)).padStart(2, "0")}:${String((i * 15) % 60).padStart(2, "0")}:00Z`
        ).getTime(),
      }));

      const largeSession: Partial<Session> = {
        id: "large-session-test",
        userId: "user-large",
        title: "Large Session Test",
        messages: largeMessages,
        memoryStore:
          "User personality: verbose communicator. Conversation history includes 50 previous interactions. Identified 25 behavioral patterns.",
        analysisSnapshots: Array.from({ length: 20 }, () => ({
          core_module: "cognitive",
          process_module: "reframing",
          utility_module: "validate",
          intensity: "moderate",
          crisis: "mild",
          distortions: [],
          themes: [],
          core_beliefs: [],
          silent_rules: [],
          behavioral_patterns: [],
          state: "first_time",
          therapeutic_readiness: "ready",
          update_memory: true,
          recall_memory: false,
        })),
      };

      const encryptedSession = await encryptSession(largeSession);
      const decryptedSession = await decryptSession(encryptedSession);

      expect(decryptedSession.messages).toHaveLength(100);
      expect(decryptedSession.messages[50].content).toBe(largeMessages[50].content);
      expect(decryptedSession.memoryStore).toBe(largeSession.memoryStore);
      expect(decryptedSession.analysisSnapshots).toHaveLength(20);
    });
  });
});
