/**
 * Tests for SessionWellnessFrequencyManager
 * Ensures token optimization works correctly
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SessionWellnessFrequencyManager } from "../session-wellness.frequency-manager";

describe("SessionWellnessFrequencyManager", () => {
  let manager: SessionWellnessFrequencyManager;
  const sessionId = "test-session-123";

  beforeEach(() => {
    manager = new SessionWellnessFrequencyManager();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("shouldCheckWellness", () => {
    it("should skip wellness checks in early session", () => {
      // First 6 messages should be skipped
      for (let i = 1; i <= 5; i++) {
        expect(manager.shouldCheckWellness(sessionId, i, false)).toBe(false);
      }
    });

    it("should not check on message 6 (still early)", () => {
      expect(manager.shouldCheckWellness(sessionId, 6, false)).toBe(false);
    });

    it("should perform first check after early session threshold", () => {
      // Message 14 = 6 early + 8 threshold = first check
      expect(manager.shouldCheckWellness(sessionId, 14, false)).toBe(true);
    });

    it("should check every 8 messages after early session", () => {
      // First check at message 14
      expect(manager.shouldCheckWellness(sessionId, 14, false)).toBe(true);

      // Advance time by 2 minutes to pass minimum time gap
      vi.advanceTimersByTime(2 * 60 * 1000);

      // Next check at message 22 (14 + 8)
      expect(manager.shouldCheckWellness(sessionId, 22, false)).toBe(true);

      // Advance time again
      vi.advanceTimersByTime(2 * 60 * 1000);

      // Next check at message 30 (22 + 8)
      expect(manager.shouldCheckWellness(sessionId, 30, false)).toBe(true);
    });

    it("should not check between threshold intervals", () => {
      // First check at message 14
      manager.shouldCheckWellness(sessionId, 14, false);

      // Should not check at messages 15-21
      for (let i = 15; i <= 21; i++) {
        expect(manager.shouldCheckWellness(sessionId, i, false)).toBe(false);
      }
    });

    it("should use lower threshold during crisis", () => {
      // During crisis, should check every 3 messages instead of 8
      // First crisis check at message 9 (6 early + 3 crisis threshold)
      expect(manager.shouldCheckWellness(sessionId, 9, true)).toBe(true);

      // Advance time by 2 minutes
      vi.advanceTimersByTime(2 * 60 * 1000);

      // Next crisis check at message 12 (9 + 3)
      expect(manager.shouldCheckWellness(sessionId, 12, true)).toBe(true);
    });

    it("should handle mixed crisis and normal patterns", () => {
      // Start with crisis
      expect(manager.shouldCheckWellness(sessionId, 9, true)).toBe(true);

      // Advance time
      vi.advanceTimersByTime(2 * 60 * 1000);

      // Crisis resolved, should wait for normal threshold
      expect(manager.shouldCheckWellness(sessionId, 12, false)).toBe(false);
      expect(manager.shouldCheckWellness(sessionId, 17, false)).toBe(true); // 9 + 8
    });
  });

  describe("forceCheck", () => {
    it("should allow forcing a check", () => {
      manager.forceCheck(sessionId, 10);

      // Advance time
      vi.advanceTimersByTime(2 * 60 * 1000);

      // After forcing, normal threshold should apply
      expect(manager.shouldCheckWellness(sessionId, 12, false)).toBe(false);
      expect(manager.shouldCheckWellness(sessionId, 18, false)).toBe(true); // 10 + 8
    });
  });

  describe("getCheckStats", () => {
    it("should return correct stats for new session", () => {
      const stats = manager.getCheckStats(sessionId, 10);

      expect(stats.messagesSinceLastCheck).toBe(10);
      expect(stats.checksPerformed).toBe(0);
    });

    it("should return correct stats after checks", () => {
      manager.shouldCheckWellness(sessionId, 14, false);

      const stats = manager.getCheckStats(sessionId, 20);
      expect(stats.messagesSinceLastCheck).toBe(6); // 20 - 14
      expect(stats.checksPerformed).toBe(1);
    });
  });

  describe("getTokenSavingsEstimate", () => {
    it("should calculate correct token savings", () => {
      const savings = manager.getTokenSavingsEstimate(sessionId, 30);

      // Messages 7-30 = 24 eligible messages
      // Unoptimized: 24 checks
      // Optimized: 3 checks (every 8 messages)
      // Saved: 21 checks * 200 tokens = 4200 tokens
      expect(savings.estimatedSavedChecks).toBe(21);
      expect(savings.estimatedTokensSaved).toBe(4200);
    });

    it("should handle early session correctly", () => {
      const savings = manager.getTokenSavingsEstimate(sessionId, 5);

      // No eligible messages for checks yet
      expect(savings.estimatedSavedChecks).toBe(0);
      expect(savings.estimatedTokensSaved).toBe(0);
    });
  });

  describe("cleanupSession", () => {
    it("should clean up session state", () => {
      manager.shouldCheckWellness(sessionId, 14, false);
      manager.cleanupSession(sessionId);

      // After cleanup, should behave like new session
      const stats = manager.getCheckStats(sessionId, 10);
      expect(stats.checksPerformed).toBe(0);
    });
  });

  describe("real-world scenarios", () => {
    it("should handle typical 50-message conversation", () => {
      let checksPerformed = 0;

      for (let messageCount = 1; messageCount <= 50; messageCount++) {
        if (manager.shouldCheckWellness(sessionId, messageCount, false)) {
          checksPerformed++;
          // Advance time after each check to simulate real conversation pace
          vi.advanceTimersByTime(2 * 60 * 1000);
        }
      }

      // Expected checks around: 14, 22, 30, 38, 46 (approximately 5-6 checks)
      expect(checksPerformed).toBeGreaterThanOrEqual(5);
      expect(checksPerformed).toBeLessThanOrEqual(6);

      const savings = manager.getTokenSavingsEstimate(sessionId, 50);
      // Significant token savings should be achieved
      expect(savings.estimatedSavedChecks).toBeGreaterThan(35);
      expect(savings.estimatedTokensSaved).toBeGreaterThan(7000);
    });

    it("should handle crisis scenario appropriately", () => {
      let checksPerformed = 0;

      // Messages 1-20: no crisis
      for (let messageCount = 1; messageCount <= 20; messageCount++) {
        if (manager.shouldCheckWellness(sessionId, messageCount, false)) {
          checksPerformed++;
          vi.advanceTimersByTime(2 * 60 * 1000);
        }
      }

      // Messages 21-30: crisis mode
      for (let messageCount = 21; messageCount <= 30; messageCount++) {
        if (manager.shouldCheckWellness(sessionId, messageCount, true)) {
          checksPerformed++;
          vi.advanceTimersByTime(2 * 60 * 1000);
        }
      }

      // Expected: 14 (normal), plus additional crisis checks
      expect(checksPerformed).toBeGreaterThan(3);
      expect(checksPerformed).toBeLessThan(10); // Should still be optimized
    });
  });
});
