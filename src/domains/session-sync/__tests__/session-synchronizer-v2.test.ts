/**
 * Critical tests for SessionSynchronizer V2
 * Ensuring refactored functionality works correctly
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { SessionSynchronizerV2 } from "../session-synchronizer-v2";

// Mock dependencies
vi.mock("@/domains/encrypted-session/encrypted-session.store", () => ({
  useSessionStore: {
    getState: vi.fn(() => ({
      sessions: {
        "test-session-1": {
          id: "test-session-1",
          title: "Test Session",
          persistOnCloud: true,
          updatedAt: new Date(),
        },
      },
    })),
  },
}));

vi.mock("@/lib/logging/unified-logger", () => ({
  logger: {
    logInfo: vi.fn(),
    logWarning: vi.fn(),
    logError: vi.fn(),
  },
}));

describe("SessionSynchronizerV2", () => {
  let synchronizer: SessionSynchronizerV2;

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Get fresh instance for each test
    synchronizer = SessionSynchronizerV2.getInstance();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance on multiple calls", () => {
      const instance1 = SessionSynchronizerV2.getInstance();
      const instance2 = SessionSynchronizerV2.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe("Sync Status Management", () => {
    it("should return default sync status for unknown session", () => {
      const status = synchronizer.getSyncStatus("unknown-session");

      expect(status).toEqual({
        local: "pending",
        cloud: "pending",
        lastLocalSync: null,
        lastCloudSync: null,
        localError: null,
        cloudError: null,
      });
    });

    it("should track local sync status separately from cloud sync", () => {
      const sessionId = "test-session-1";

      const localStatus = synchronizer.getLocalSyncStatus(sessionId);
      const cloudStatus = synchronizer.getCloudSyncStatus(sessionId);

      expect(localStatus).toBe("pending");
      expect(cloudStatus).toBe("pending");
    });
  });

  describe("Configuration Management", () => {
    it("should allow updating sync configuration", () => {
      const newConfig = {
        localSync: {
          enabled: true,
          debounceMs: 500,
        },
      };

      expect(() => {
        synchronizer.updateSyncConfig(newConfig);
      }).not.toThrow();

      const currentConfig = synchronizer.getSyncConfig();
      expect(currentConfig.localSync.debounceMs).toBe(500);
    });
  });

  describe("Service Access", () => {
    it("should provide access to internal services", () => {
      const services = synchronizer.getServices();

      expect(services).toHaveProperty("configManager");
      expect(services).toHaveProperty("stateManager");
      expect(services).toHaveProperty("retryService");
      expect(services).toHaveProperty("localSyncService");
      expect(services).toHaveProperty("cloudSyncService");
    });
  });

  describe("Cleanup", () => {
    it("should cleanup resources without throwing", () => {
      expect(() => {
        synchronizer.cleanup();
      }).not.toThrow();
    });
  });

  describe("Legacy API Compatibility", () => {
    it("should maintain backward compatibility for getLastSyncTime", () => {
      const sessionId = "test-session-1";
      const lastSyncTime = synchronizer.getLastSyncTime(sessionId);

      // Should return null for new session
      expect(lastSyncTime).toBeNull();
    });

    it("should maintain backward compatibility for retrySession", async () => {
      const sessionId = "test-session-1";

      // Should not throw for unknown session
      await expect(synchronizer.retrySession(sessionId)).resolves.not.toThrow();
    });
  });
});
