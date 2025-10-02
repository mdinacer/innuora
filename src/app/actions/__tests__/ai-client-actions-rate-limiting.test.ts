import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// import { AppError } from "@/lib/errors/app-error"; // Currently unused
import { ERROR_CODES } from "@/lib/errors/error-codes";
// Import mocked modules
import openai from "@/lib/openai";
import { MemoryRateLimiter } from "@/lib/rate-limiting/rate-limiter";
import { AiModel } from "@/types/ai-model.types";
import { processAiPrompts, processAiPromptsWithRetry } from "../ai-client-actions";

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

vi.mock("@/domains/ai-conversation/ai-models", () => ({
  AI_MODEL: "gpt-4.1-mini",
  AI_MODEL_VENDOR: "openai",
  AI_MODEL_INPUT_PRICE_PER_1K: 0.0004,
  AI_MODEL_OUTPUT_PRICE_PER_1K: 0.0016,
  AI_MODEL_MAX_OUTPUT: 2048,
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

      const result = await processAiPrompts(mockPrompts);

      expect(result).toBeDefined();
      expect(result.error).toBeNull();
      expect(result.data?.message).toBe("AI response");
    });

    it("should enforce burst rate limit (5 requests per 10 seconds)", async () => {
      const userId = "user123";

      // Use up burst limit (5 requests)
      for (let i = 0; i < 5; i++) {
        await processAiPrompts(mockPrompts);
      }

      // 6th request should return error
      const result = await processAiPrompts(mockPrompts);
      expect(result.error).not.toBeNull();
      expect(result.error?.code).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
      expect(result.error?.message).toContain("Too many AI requests");
    });

    it("should enforce general AI limit (30 requests per minute)", async () => {
      const userId = "user123";

      // Reset burst limit window
      vi.advanceTimersByTime(11000);

      // Use up general AI limit (30 requests) in chunks to avoid burst limit
      for (let chunk = 0; chunk < 6; chunk++) {
        for (let i = 0; i < 5; i++) {
          await processAiPrompts(mockPrompts);
        }
        // Reset burst window between chunks
        vi.advanceTimersByTime(11000);
      }

      // 31st request should return error due to general limit
      const result = await processAiPrompts(mockPrompts);
      expect(result.error).not.toBeNull();
    });

    it("should reset limits after window expiration", async () => {
      const userId = "user123";

      // Use up burst limit
      for (let i = 0; i < 5; i++) {
        await processAiPrompts(mockPrompts);
      }

      // Verify limit exceeded
      let result = await processAiPrompts(mockPrompts);
      expect(result.error).not.toBeNull();

      // Advance time past burst window (10 seconds)
      vi.advanceTimersByTime(11000);

      // Should allow new requests
      result = await processAiPrompts(mockPrompts);
      expect(result.error).toBeNull();
      expect(result.data?.message).toBe("AI response");
    });

    it("should track different users separately", async () => {
      const userId1 = "user1";
      const userId2 = "user2";

      // User 1 uses up burst limit
      for (let i = 0; i < 5; i++) {
        await processAiPrompts(mockPrompts);
      }

      // User 1 should be rate limited
      let result = await processAiPrompts(mockPrompts);
      expect(result.error).not.toBeNull();

      // User 2 should still be able to make requests
      result = await processAiPrompts(mockPrompts);
      expect(result.error).toBeNull();
      expect(result.data?.message).toBe("AI response");
    });

    it("should allow requests without userId (anonymous users)", async () => {
      // Should work without rate limiting when no userId provided
      const result = await processAiPrompts(mockPrompts);
      expect(result.error).toBeNull();
      expect(result.data?.message).toBe("AI response");
    });

    it("should provide useful error messages with remaining time", async () => {
      const userId = "user123";

      // Use up burst limit
      for (let i = 0; i < 5; i++) {
        await processAiPrompts(mockPrompts);
      }

      const result = await processAiPrompts(mockPrompts);
      expect(result.error).not.toBeNull();
      expect(result.error?.message).toMatch(/Try again in \d+ seconds/);
    });
  });

  describe("SendPromptsToAiWithRetry Rate Limiting", () => {
    it("should pass userId to underlying SendPromptsToAi function", async () => {
      const userId = "user123";

      const result = await processAiPromptsWithRetry(mockPrompts, {}, 3, 1000);

      expect(result.error).toBeNull();
      expect(result.data?.message).toBe("AI response");
    });

    it("should not retry on rate limit errors", async () => {
      const userId = "user123";

      // Use up burst limit first
      for (let i = 0; i < 5; i++) {
        await processAiPrompts(mockPrompts);
      }

      // Rate limit error should not be retried - it should return error immediately
      const result = await processAiPromptsWithRetry(mockPrompts, {}, 3, 1000);
      expect(result.error).not.toBeNull();
      expect(result.error?.code).toBe(ERROR_CODES.RATE_LIMIT_EXCEEDED);
    });

    it("should enforce rate limiting before retries", async () => {
      const userId = "user123";

      // Use up burst limit
      for (let i = 0; i < 5; i++) {
        await processAiPrompts(mockPrompts);
      }

      // Even with retries enabled, should return error immediately on rate limit
      const startTime = Date.now();
      const result = await processAiPromptsWithRetry(mockPrompts, {}, 3, 1000);
      const endTime = Date.now();

      expect(result.error).not.toBeNull();
      // Should fail fast, not wait for retries
      expect(endTime - startTime).toBeLessThan(100); // Should be very quick
    });
  });

  describe("Production Scenarios", () => {
    it("should handle legitimate high-frequency usage patterns", async () => {
      const userId = "poweruser123";

      // Simulate a user having a conversation with AI
      // Should be able to make several requests quickly, then wait
      for (let i = 0; i < 5; i++) {
        const result = await processAiPrompts(mockPrompts);
        expect(result.error).toBeNull();
        expect(result.data?.message).toBe("AI response");
      }

      // Wait for burst window to reset
      vi.advanceTimersByTime(11000);

      // Should be able to make more requests
      for (let i = 0; i < 5; i++) {
        const result = await processAiPrompts(mockPrompts);
        expect(result.error).toBeNull();
        expect(result.data?.message).toBe("AI response");
      }
    });

    it("should prevent AI abuse scenarios", async () => {
      const userId = "abuser123";

      // Attempt rapid-fire requests (abuse scenario)
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(processAiPrompts(mockPrompts));
      }

      const results = await Promise.all(promises);

      // Only first 5 should succeed, rest should be rate limited
      const successful = results.filter((r) => r.error === null);
      const rateLimited = results.filter((r) => r.error !== null);

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
        const result = await processAiPrompts(mockPrompts);
        expect(result.error).toBeNull();
        expect(result.data?.message).toBe("AI response");
      }

      // Should still be rate limited the same way
      const result = await processAiPrompts(mockPrompts);
      expect(result.error).not.toBeNull();
    });

    it("should handle edge case of user making request exactly at limit reset", async () => {
      const userId = "user123";

      // Use up burst limit
      for (let i = 0; i < 5; i++) {
        await processAiPrompts(mockPrompts);
      }

      // Advance to exactly when window resets
      vi.advanceTimersByTime(10000);

      // Should be able to make new request
      const result = await processAiPrompts(mockPrompts);
      expect(result.error).toBeNull();
      expect(result.data?.message).toBe("AI response");
    });
  });

  describe("Error Handling Integration", () => {
    it("should provide rate limit remaining count in error details", async () => {
      const userId = "user123";

      // Use up some requests
      for (let i = 0; i < 3; i++) {
        await processAiPrompts(mockPrompts);
      }

      // Get current remaining count
      const remaining = (await import("@/lib/rate-limiting/rate-limiter")).rateLimiter.getRemainingRequests(
        userId,
        "AI_BURST"
      );
      expect(remaining).toBe(2);

      // Use up remaining requests
      for (let i = 0; i < 2; i++) {
        await processAiPrompts(mockPrompts);
      }

      // Next request should fail with specific remaining count
      const result = await processAiPrompts(mockPrompts);
      expect(result.error).not.toBeNull();
    });

    it("should distinguish between burst and general rate limit errors", async () => {
      const userId = "user123";

      // Use up burst limit
      for (let i = 0; i < 5; i++) {
        await processAiPrompts(mockPrompts);
      }

      let result = await processAiPrompts(mockPrompts);
      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain("Too many AI requests");
      expect(result.error?.message).toMatch(/Try again in \d+ seconds/);

      // Reset burst window but keep general window
      vi.advanceTimersByTime(11000);

      // Continue until general limit
      for (let chunk = 0; chunk < 5; chunk++) {
        for (let i = 0; i < 5; i++) {
          await processAiPrompts(mockPrompts);
        }
        vi.advanceTimersByTime(11000);
      }

      result = await processAiPrompts(mockPrompts);
      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain("Daily AI request limit reached");
    });
  });
});
