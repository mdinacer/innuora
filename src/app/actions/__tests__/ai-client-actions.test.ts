/**
 * Unit tests for AI client actions
 * Critical business risk protection - tests AI integration reliability and cost calculation
 */

import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import { processAiPrompts, processAiPromptsWithRetry } from "../ai-client-actions";

// Mock the dependencies
vi.mock("@/lib/openai", () => ({
  default: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}));

vi.mock("@/domains/ai-conversation/ai-models", () => ({
  AI_MODEL: "gpt-4.1-mini",
  AI_MODEL_VENDOR: "openai",
  AI_MODEL_INPUT_PRICE_PER_1K: 0.0004,
  AI_MODEL_OUTPUT_PRICE_PER_1K: 0.0016,
  AI_MODEL_MAX_OUTPUT: 2048,
}));

vi.mock("@/app/actions/auth-actions", () => ({
  findCurrentUser: vi.fn(() => null), // No user by default (no rate limiting)
}));

vi.mock("@/lib/logging/unified-logger", () => ({
  logger: {
    wrapOperation: vi.fn(async (fn, errorCode) => {
      try {
        const result = await fn();
        return { data: result, error: null };
      } catch (error) {
        return {
          data: null,
          error: {
            message: error instanceof Error ? error.message : String(error),
            code: errorCode,
          },
        };
      }
    }),
    logErrorAndThrow: vi.fn((errorCode, error, context) => {
      throw new AppError(error.message, errorCode, context);
    }),
  },
}));

describe("AI Client Actions", () => {
  const mockPrompts: ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello, how are you?" },
  ];

  const mockChatCompletion: ChatCompletion = {
    id: "chatcmpl-test",
    object: "chat.completion",
    created: Date.now(),
    model: "gpt-4.1-mini",
    choices: [
      {
        logprobs: null,
        index: 0,
        message: {
          role: "assistant",
          content: "Hello! I'm doing well, thank you for asking.",
          refusal: null,
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 20,
      completion_tokens: 15,
      total_tokens: 35,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("processAiPrompts", () => {
    describe("OpenAI Integration", () => {
      it("should successfully call OpenAI and return response", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(mockChatCompletion);

        // Act
        const result = await processAiPrompts(mockPrompts);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          message: "Hello! I'm doing well, thank you for asking.",
          modelTokenUsage: {
            type: "completion",
            model: "gpt-4.1-mini",
            mode: "paid",
            usage: mockChatCompletion.usage,
            timestamp: expect.any(String),
            version: "",
            costUSD: 0,
          },
          consumedCredits: 2, // Input: Math.ceil((20/1000)*0.0004*100)=1 + Output: Math.ceil((15/1000)*0.0016*100)=1 = 2
        });

        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledWith({
          model: "gpt-4.1-mini",
          messages: mockPrompts,
          stream: false,
          max_tokens: 700,
          temperature: 0.6,
          top_p: 0.9,
        });
      });

      it("should handle OpenAI API errors gracefully", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const apiError = new Error("OpenAI API rate limit exceeded");
        vi.mocked(mockOpenAI.default.chat.completions.create).mockRejectedValue(apiError);

        // Act
        const result = await processAiPrompts(mockPrompts);

        // Assert
        expect(result.error).not.toBeNull();
      });

      it("should handle empty AI response", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const emptyCompletion = {
          ...mockChatCompletion,
          choices: [
            {
              ...mockChatCompletion.choices[0],
              message: { role: "assistant" as const, content: "" },
            },
          ],
        } as any;
        vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(emptyCompletion);

        // Act
        const result = await processAiPrompts(mockPrompts);

        // Assert
        expect(result.error).not.toBeNull();
        expect(result.error?.message).toContain("AI returned empty content");
      });
    });

    describe("Input Validation", () => {
      it("should reject empty prompts array", async () => {
        // Act
        const result = await processAiPrompts([]);

        // Assert
        expect(result.error).not.toBeNull();
        expect(result.error?.message).toContain("Prompts array cannot be empty");
      });

      it("should reject prompts with missing role", async () => {
        // Arrange
        const invalidPrompts = [{ content: "Hello" }] as ChatCompletionMessageParam[];

        // Act
        const result = await processAiPrompts(invalidPrompts);

        // Assert
        expect(result.error).not.toBeNull();
        expect(result.error?.message).toContain("missing required role or content");
      });

      it("should reject prompts with missing content", async () => {
        // Arrange
        const invalidPrompts = [{ role: "user" }] as ChatCompletionMessageParam[];

        // Act
        const result = await processAiPrompts(invalidPrompts);

        // Assert
        expect(result.error).not.toBeNull();
        expect(result.error?.message).toContain("missing required role or content");
      });
    });

    describe("Token Usage and Credit Calculation", () => {
      it("should calculate credits correctly based on token usage", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const completionWithMoreTokens = {
          ...mockChatCompletion,
          usage: {
            prompt_tokens: 1000,
            completion_tokens: 500,
            total_tokens: 1500,
          },
        };
        vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(completionWithMoreTokens);

        // Act
        const result = await processAiPrompts(mockPrompts);

        // Assert
        expect(result.error).toBeNull();
        // Input: Math.ceil((1000/1000)*0.0004*100) = 1
        // Output: Math.ceil((500/1000)*0.0016*100) = 1
        // Total: 2 credits
        expect(result.data?.consumedCredits).toBe(2);
      });

      it("should handle missing usage data gracefully", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const completionWithoutUsage = { ...mockChatCompletion, usage: undefined };
        vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(completionWithoutUsage);

        // Act
        const result = await processAiPrompts(mockPrompts);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data?.consumedCredits).toBe(0);
        expect(result.data?.modelTokenUsage).toBeNull();
      });

      it("should merge custom options with defaults", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(mockChatCompletion);

        const customOptions = {
          temperature: 0.8,
          max_tokens: 1000,
        };

        // Act
        await processAiPrompts(mockPrompts, customOptions);

        // Assert
        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledWith({
          model: "gpt-4.1-mini",
          messages: mockPrompts,
          stream: false,
          max_tokens: 1000,
          temperature: 0.8,
          top_p: 0.9,
        });
      });
    });
  });

  describe("processAiPromptsWithRetry", () => {
    describe("Retry Logic", () => {
      it("should succeed on first attempt", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(mockChatCompletion);

        // Act
        const result = await processAiPromptsWithRetry(mockPrompts);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data?.message).toBe("Hello! I'm doing well, thank you for asking.");
        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledTimes(1);
      });

      it("should retry on transient failures and eventually succeed", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        vi.mocked(mockOpenAI.default.chat.completions.create)
          .mockRejectedValueOnce(new Error("Temporary network error"))
          .mockRejectedValueOnce(new Error("Rate limit"))
          .mockResolvedValueOnce(mockChatCompletion);

        // Act
        const result = await processAiPromptsWithRetry(mockPrompts, {}, 3, 10);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data?.message).toBe("Hello! I'm doing well, thank you for asking.");
        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledTimes(3);
      });

      it("should retry on generic network errors", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        vi.mocked(mockOpenAI.default.chat.completions.create)
          .mockRejectedValueOnce(new Error("Network timeout"))
          .mockResolvedValueOnce(mockChatCompletion);

        // Act
        const result = await processAiPromptsWithRetry(mockPrompts, {}, 3, 10);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data?.message).toBe("Hello! I'm doing well, thank you for asking.");
        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledTimes(2);
      });

      it("should fail after exhausting all retries", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const persistentError = new Error("Persistent API error");
        vi.mocked(mockOpenAI.default.chat.completions.create).mockRejectedValue(persistentError);

        // Act
        const result = await processAiPromptsWithRetry(mockPrompts, {}, 2, 10);

        // Assert
        expect(result.error).not.toBeNull();
        expect(result.error?.message).toContain("Failed after 2 attempts");
        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledTimes(2);
      });

      it("should use exponential backoff for retries", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const retryError = new Error("Retry test");
        vi.mocked(mockOpenAI.default.chat.completions.create).mockRejectedValue(retryError);

        const startTime = Date.now();

        // Act
        await processAiPromptsWithRetry(mockPrompts, {}, 3, 50);

        const endTime = Date.now();
        const elapsed = endTime - startTime;

        // Assert
        // Should have waited approximately: 50ms + 100ms = 150ms
        expect(elapsed).toBeGreaterThan(100);
        expect(elapsed).toBeLessThan(500);
      });

      it("should stop retrying on non-retryable errors", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const emptyCompletion = {
          ...mockChatCompletion,
          choices: [
            {
              ...mockChatCompletion.choices[0],
              message: { role: "assistant" as const, content: "" },
            },
          ],
        } as any;
        vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(emptyCompletion);

        // Act
        const result = await processAiPromptsWithRetry(mockPrompts, {}, 3, 10);

        // Assert
        expect(result.error).not.toBeNull();
        expect(result.error?.message).toContain("AI returned empty content");
      });
    });

    describe("Custom Retry Parameters", () => {
      it("should respect custom maxRetries parameter", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        vi.mocked(mockOpenAI.default.chat.completions.create).mockRejectedValue(new Error("Test error"));

        // Act
        const result = await processAiPromptsWithRetry(mockPrompts, {}, 1, 10);

        // Assert
        expect(result.error).not.toBeNull();
        expect(result.error?.message).toContain("Failed after 1 attempts");
        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledTimes(1);
      });

      it("should work with maxRetries = 1 (no retries)", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(mockChatCompletion);

        // Act
        const result = await processAiPromptsWithRetry(mockPrompts, {}, 1);

        // Assert
        expect(result.error).toBeNull();
        expect(result.data?.message).toBe("Hello! I'm doing well, thank you for asking.");
        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Development Environment Logging", () => {
    it("should log AI responses in development mode", async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = "development";

      const mockOpenAI = await import("@/lib/openai");
      vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(mockChatCompletion);

      // Mock console.info
      const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      // Act
      await processAiPrompts(mockPrompts);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("AI Service Called:"),
        expect.any(Object),
        expect.any(Array),
        expect.any(String)
      );

      // Cleanup
      (process.env as any).NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it("should not log in production mode", async () => {
      // Arrange
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = "production";

      const mockOpenAI = await import("@/lib/openai");
      vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(mockChatCompletion);

      // Mock console.info
      const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      // Act
      await processAiPrompts(mockPrompts);

      // Assert
      expect(consoleSpy).not.toHaveBeenCalled();

      // Cleanup
      (process.env as any).NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });
});
