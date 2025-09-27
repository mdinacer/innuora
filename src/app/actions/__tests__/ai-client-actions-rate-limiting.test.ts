import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
// Import mocked modules
import openai from "@/lib/openai";
import { MemoryRateLimiter } from "@/lib/rate-limiting/rate-limiter";
import { AiModel } from "@/types/ai-model.types";
import { SendPromptsToAi, SendPromptsToAiWithRetry } from "../ai-client-actions";

// Mock the logger to avoid test pollution
vi.mock("@/lib/logging/unified-logger", () => ({
  logger: {
    wrapOperation: vi.fn((fn) => fn()),
  },
}));

// Mock OpenAI and fetch for OpenRouter
vi.mock("@/lib/openai", () => ({
  default: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

// Mock fetch for OpenRouter API calls
global.fetch = vi.fn();

vi.mock("@/domains/credits/credits-calculation", () => ({
  calculateCreditsUsed: vi.fn(() => 5),
}));

// Mock the rateLimiter module to use our test instance
vi.mock("@/lib/rate-limiting/rate-limiter", async () => {
  const actual = await vi.importActual("@/lib/rate-limiting/rate-limiter");
  return {
    ...actual,
    rateLimiter: {
      checkLimit: vi.fn(),
    },
  };
});

describe.skip("AI Actions Rate Limiting", () => {
  const mockOpenAIModel: AiModel = {
    model: "gpt-4o",
    apiPath: "gpt-4o",
    context: 128000,
    pricing: { prompt: 0.0025, completion: 0.01 },
    vendor: "openai",
    mode: "paid",
  };

  const mockPrompts = [{ role: "user" as const, content: "Test message" }];

  const mockResponse = {
    choices: [{ message: { content: "AI response" } }],
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  };

  let testRateLimiter: MemoryRateLimiter;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00.000Z"));
    vi.clearAllMocks();

    // Create fresh rate limiter for each test with correct rule names
    testRateLimiter = new MemoryRateLimiter({
      AI_BURST: { windowMs: 10000, maxRequests: 5 },
      AI_REQUESTS: { windowMs: 60000, maxRequests: 30 },
    });

    // Mock the rate limiter to use our test instance
    const { rateLimiter } = await import("@/lib/rate-limiting/rate-limiter");
    vi.mocked(rateLimiter.checkLimit).mockImplementation((identifier, ruleKey) =>
      testRateLimiter.checkLimit(identifier, ruleKey)
    );

    // Mock successful AI responses
    (openai.chat.completions.create as any).mockResolvedValue(mockResponse);

    // Mock OpenRouter fetch response
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("SendPromptsToAi Rate Limiting", () => {
    it("should allow AI requests within burst limit", async () => {
      const userId = "user123";

      const result = await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);

      expect(result).toBeDefined();
      expect(result.message).toBe("AI response");
    });

    it("should enforce burst rate limit (5 requests per 10 seconds)", async () => {
      const userId = "user123";

      // Use up burst limit (5 requests)
      for (let i = 0; i < 5; i++) {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      }

      // 6th request should fail
      await expect(SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId)).rejects.toThrow(AppError);

      try {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect((error as AppError).errorCode).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
        expect((error as AppError).message).toContain("Too many AI requests");
      }
    });

    it("should enforce general AI limit (30 requests per minute)", async () => {
      const userId = "user123";

      // Reset burst limit window
      vi.advanceTimersByTime(11000);

      // Use up general AI limit (30 requests) in chunks to avoid burst limit
      for (let chunk = 0; chunk < 6; chunk++) {
        for (let i = 0; i < 5; i++) {
          await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
        }
        // Reset burst window between chunks
        vi.advanceTimersByTime(11000);
      }

      // 31st request should fail due to general limit
      await expect(SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId)).rejects.toThrow(AppError);
    });

    it("should reset limits after window expiration", async () => {
      const userId = "user123";

      // Use up burst limit
      for (let i = 0; i < 5; i++) {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      }

      // Verify limit exceeded
      await expect(SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId)).rejects.toThrow();

      // Advance time past burst window (10 seconds)
      vi.advanceTimersByTime(11000);

      // Should allow new requests
      const result = await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      expect(result.message).toBe("AI response");
    });

    it("should track different users separately", async () => {
      const userId1 = "user1";
      const userId2 = "user2";

      // User 1 uses up burst limit
      for (let i = 0; i < 5; i++) {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId1);
      }

      // User 1 should be rate limited
      await expect(SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId1)).rejects.toThrow();

      // User 2 should still be able to make requests
      const result = await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId2);
      expect(result.message).toBe("AI response");
    });

    it("should allow requests without userId (anonymous users)", async () => {
      // Should work without rate limiting when no userId provided
      const result = await SendPromptsToAi(mockPrompts, mockOpenAIModel, {});
      expect(result.message).toBe("AI response");
    });

    it("should provide useful error messages with remaining time", async () => {
      const userId = "user123";

      // Use up burst limit
      for (let i = 0; i < 5; i++) {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      }

      try {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        const appError = error as AppError;
        expect(appError.message).toMatch(/Try again in \d+ seconds/);
        expect(appError.details).toHaveProperty("remaining");
        expect(appError.details).toHaveProperty("resetTime");
      }
    });
  });

  describe("SendPromptsToAiWithRetry Rate Limiting", () => {
    it("should pass userId to underlying SendPromptsToAi function", async () => {
      const userId = "user123";

      const result = await SendPromptsToAiWithRetry(mockPrompts, mockOpenAIModel, {}, 3, 1000, userId);

      expect(result.message).toBe("AI response");
    });

    it("should not retry on rate limit errors", async () => {
      const userId = "user123";

      // Use up burst limit first
      for (let i = 0; i < 5; i++) {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      }

      // Rate limit error should not be retried - it should fail immediately
      await expect(SendPromptsToAiWithRetry(mockPrompts, mockOpenAIModel, {}, 3, 1000, userId)).rejects.toThrow(
        AppError
      );
    });

    it("should enforce rate limiting before retries", async () => {
      const userId = "user123";

      // Use up burst limit
      for (let i = 0; i < 5; i++) {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      }

      // Even with retries enabled, should fail immediately on rate limit
      const startTime = Date.now();
      await expect(SendPromptsToAiWithRetry(mockPrompts, mockOpenAIModel, {}, 3, 1000, userId)).rejects.toThrow();

      // Should fail fast, not wait for retries
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(100); // Should be very quick
    });
  });

  describe("Production Scenarios", () => {
    it("should handle legitimate high-frequency usage patterns", async () => {
      const userId = "poweruser123";

      // Simulate a user having a conversation with AI
      // Should be able to make several requests quickly, then wait
      for (let i = 0; i < 5; i++) {
        const result = await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
        expect(result.message).toBe("AI response");
      }

      // Wait for burst window to reset
      vi.advanceTimersByTime(11000);

      // Should be able to make more requests
      for (let i = 0; i < 5; i++) {
        const result = await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
        expect(result.message).toBe("AI response");
      }
    });

    it("should prevent AI abuse scenarios", async () => {
      const userId = "abuser123";

      // Attempt rapid-fire requests (abuse scenario)
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId).catch((e) => e));
      }

      const results = await Promise.all(promises);

      // Only first 5 should succeed, rest should be rate limited
      const successful = results.filter((r) => !(r instanceof AppError));
      const rateLimited = results.filter((r) => r instanceof AppError);

      expect(successful).toHaveLength(5);
      expect(rateLimited).toHaveLength(15);
    });

    it("should handle cost-based rate limiting for expensive models", async () => {
      const userId = "user123";
      const expensiveModel: AiModel = {
        ...mockOpenAIModel,
        model: "gpt-4",
        pricing: { prompt: 0.03, completion: 0.06 }, // Much more expensive
      };

      // Even with same rate limits, expensive models are naturally limited by cost
      // This test ensures rate limiting works regardless of model cost
      for (let i = 0; i < 5; i++) {
        const result = await SendPromptsToAi(mockPrompts, expensiveModel, {}, userId);
        expect(result.message).toBe("AI response");
      }

      // Should still be rate limited the same way
      await expect(SendPromptsToAi(mockPrompts, expensiveModel, {}, userId)).rejects.toThrow();
    });

    it("should handle edge case of user making request exactly at limit reset", async () => {
      const userId = "user123";

      // Use up burst limit
      for (let i = 0; i < 5; i++) {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      }

      // Advance to exactly when window resets
      vi.advanceTimersByTime(10000);

      // Should be able to make new request
      const result = await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      expect(result.message).toBe("AI response");
    });
  });

  describe("Error Handling Integration", () => {
    it("should provide rate limit remaining count in error details", async () => {
      const userId = "user123";

      // Use up some requests
      for (let i = 0; i < 3; i++) {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      }

      // Get current remaining count
      const remaining = (await import("@/lib/rate-limiting/rate-limiter")).rateLimiter.getRemainingRequests(
        userId,
        "AI_BURST"
      );
      expect(remaining).toBe(2);

      // Use up remaining requests
      for (let i = 0; i < 2; i++) {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      }

      // Next request should fail with specific remaining count
      try {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      } catch (error) {
        const appError = error as AppError;
        expect(appError.details).toHaveProperty("remaining", 0);
      }
    });

    it("should distinguish between burst and general rate limit errors", async () => {
      const userId = "user123";

      // Use up burst limit
      for (let i = 0; i < 5; i++) {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      }

      try {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      } catch (error) {
        const appError = error as AppError;
        expect(appError.message).toContain("Too many AI requests");
        expect(appError.message).toMatch(/Try again in \d+ seconds/);
      }

      // Reset burst window but keep general window
      vi.advanceTimersByTime(11000);

      // Continue until general limit
      for (let chunk = 0; chunk < 5; chunk++) {
        for (let i = 0; i < 5; i++) {
          await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
        }
        vi.advanceTimersByTime(11000);
      }

      try {
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, {}, userId);
      } catch (error) {
        const appError = error as AppError;
        expect(appError.message).toContain("Daily AI request limit reached");
      }
    });
  });
});
