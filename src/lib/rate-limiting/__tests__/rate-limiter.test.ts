import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MemoryRateLimiter, RATE_LIMIT_RULES } from "../rate-limiter";

describe("MemoryRateLimiter", () => {
  let rateLimiter: MemoryRateLimiter;

  beforeEach(() => {
    vi.useFakeTimers();
    rateLimiter = new MemoryRateLimiter(RATE_LIMIT_RULES);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Basic Rate Limiting", () => {
    it("should allow requests within limit", () => {
      const result = rateLimiter.checkLimit("user123", "AI_BURST");

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4); // 5 max - 1 used = 4 remaining
      expect(result.total).toBe(5);
    });

    it("should reject requests when limit exceeded", () => {
      // Use up all requests
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkLimit("user123", "AI_BURST");
      }

      const result = rateLimiter.checkLimit("user123", "AI_BURST");

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should track different users separately", () => {
      // User 1 uses all requests
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkLimit("user1", "AI_BURST");
      }

      // User 2 should still have full limit
      const result = rateLimiter.checkLimit("user2", "AI_BURST");

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("should track different rules separately", () => {
      // Use up AI_BURST limit
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkLimit("user123", "AI_BURST");
      }

      // AI_REQUESTS should still be available
      const result = rateLimiter.checkLimit("user123", "AI_REQUESTS");

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(29); // 30 max - 1 used = 29 remaining
    });
  });

  describe("Window Management", () => {
    it("should reset limit when window expires", () => {
      // Use up all requests
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkLimit("user123", "AI_BURST");
      }

      // Verify limit exceeded
      expect(rateLimiter.checkLimit("user123", "AI_BURST").success).toBe(false);

      // Advance time past window (10 seconds)
      vi.advanceTimersByTime(11000);

      // Should allow new requests
      const result = rateLimiter.checkLimit("user123", "AI_BURST");
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("should provide correct reset time", () => {
      const startTime = Date.now();
      const result = rateLimiter.checkLimit("user123", "AI_BURST");

      // Reset time should be current window start + window duration
      const expectedResetTime = Math.floor(startTime / 10000) * 10000 + 10000;
      expect(result.resetTime).toBe(expectedResetTime);
    });
  });

  describe("Configuration Validation", () => {
    it("should throw error for invalid rule key", () => {
      expect(() => {
        rateLimiter.checkLimit("user123", "INVALID_RULE" as any);
      }).toThrow("Rate limit rule 'INVALID_RULE' not found");
    });

    it("should validate rate limit rules configuration", () => {
      expect(RATE_LIMIT_RULES.AI_REQUESTS.maxRequests).toBe(30);
      expect(RATE_LIMIT_RULES.AI_REQUESTS.windowMs).toBe(60000);
      expect(RATE_LIMIT_RULES.AI_BURST.maxRequests).toBe(5);
      expect(RATE_LIMIT_RULES.AI_BURST.windowMs).toBe(10000);
    });
  });

  describe("getRemainingRequests", () => {
    it("should return correct remaining requests", () => {
      // Use 3 requests
      for (let i = 0; i < 3; i++) {
        rateLimiter.checkLimit("user123", "AI_BURST");
      }

      const remaining = rateLimiter.getRemainingRequests("user123", "AI_BURST");
      expect(remaining).toBe(2); // 5 - 3 = 2
    });

    it("should return full limit for new user", () => {
      const remaining = rateLimiter.getRemainingRequests("newuser", "AI_BURST");
      expect(remaining).toBe(5);
    });

    it("should return full limit after window reset", () => {
      // Use all requests
      for (let i = 0; i < 5; i++) {
        rateLimiter.checkLimit("user123", "AI_BURST");
      }

      // Advance time past window
      vi.advanceTimersByTime(11000);

      const remaining = rateLimiter.getRemainingRequests("user123", "AI_BURST");
      expect(remaining).toBe(5);
    });
  });

  describe("Cleanup Mechanism", () => {
    it("should clean up old entries", () => {
      // Create entry
      rateLimiter.checkLimit("user123", "AI_BURST");

      // Advance time way past cleanup threshold (2 * windowMs)
      vi.advanceTimersByTime(30000);

      // Trigger cleanup (would normally happen every 60 seconds)
      vi.advanceTimersByTime(60000);

      // Entry should be cleaned up, so new request should have full limit
      const result = rateLimiter.checkLimit("user123", "AI_BURST");
      expect(result.remaining).toBe(4); // Full limit minus the new request
    });
  });

  describe("Edge Cases", () => {
    it("should handle concurrent requests correctly", () => {
      const results = [];

      // Simulate 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        results.push(rateLimiter.checkLimit("user123", "AI_BURST"));
      }

      // Only first 5 should succeed
      const successful = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      expect(successful).toHaveLength(5);
      expect(failed).toHaveLength(5);
    });

    it("should handle requests at window boundary", () => {
      const windowMs = RATE_LIMIT_RULES.AI_BURST.windowMs;

      // Make request at start of window
      const result1 = rateLimiter.checkLimit("user123", "AI_BURST");
      expect(result1.remaining).toBe(4); // 5 - 1 = 4

      // Make another request in same window
      const result2 = rateLimiter.checkLimit("user123", "AI_BURST");
      expect(result2.remaining).toBe(3); // 5 - 2 = 3

      // Advance to new window (need to advance enough to guarantee new window)
      vi.advanceTimersByTime(windowMs + 1);
      const result3 = rateLimiter.checkLimit("user123", "AI_BURST");
      expect(result3.remaining).toBe(4); // Should be new window (5 - 1 = 4)
    });
  });

  describe("Production Scenarios", () => {
    it("should handle AUTH_ATTEMPTS rate limiting for login security", () => {
      const userId = "attacker123";
      const windowMs = RATE_LIMIT_RULES.AUTH_ATTEMPTS.windowMs; // 15 minutes

      // Allow 5 attempts
      for (let i = 0; i < 5; i++) {
        const result = rateLimiter.checkLimit(userId, "AUTH_ATTEMPTS");
        expect(result.success).toBe(true);
      }

      // 6th attempt should fail
      const result = rateLimiter.checkLimit(userId, "AUTH_ATTEMPTS");
      expect(result.success).toBe(false);

      // Should be allowed after full window period
      vi.advanceTimersByTime(windowMs + 1000); // Full window + buffer
      expect(rateLimiter.checkLimit(userId, "AUTH_ATTEMPTS").success).toBe(true);
    });

    it("should handle CREDIT_PURCHASE rate limiting for financial safety", () => {
      const userId = "buyer123";

      // Allow 3 purchases per minute
      for (let i = 0; i < 3; i++) {
        const result = rateLimiter.checkLimit(userId, "CREDIT_PURCHASE");
        expect(result.success).toBe(true);
      }

      // 4th purchase should fail
      const result = rateLimiter.checkLimit(userId, "CREDIT_PURCHASE");
      expect(result.success).toBe(false);
    });

    it("should handle SESSION_CREATION rate limiting", () => {
      const userId = "prolific123";

      // Allow 10 sessions per minute
      for (let i = 0; i < 10; i++) {
        const result = rateLimiter.checkLimit(userId, "SESSION_CREATION");
        expect(result.success).toBe(true);
      }

      // 11th session should fail
      const result = rateLimiter.checkLimit(userId, "SESSION_CREATION");
      expect(result.success).toBe(false);
    });
  });
});
