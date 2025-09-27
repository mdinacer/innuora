/**
 * Unit tests for AI client actions
 * Critical business risk protection - tests AI integration reliability and cost calculation
 */

import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppError } from "@/lib/errors";
import { AiModel } from "@/types/ai-model.types";
import { SendPromptsToAi, SendPromptsToAiWithRetry } from "../ai-client-actions";

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

vi.mock("@/domains/credits/credits-calculation", () => ({
  calculateCreditsUsed: vi.fn(),
}));

vi.mock("@/lib/logging/unified-logger", () => ({
  logger: {
    wrapOperation: vi.fn((fn) => fn()),
    logErrorAndThrow: vi.fn((errorCode, error, context) => {
      throw new AppError(error.message, errorCode, context);
    }),
  },
}));

// Mock global fetch for OpenRouter
global.fetch = vi.fn();

describe("AI Client Actions", () => {
  // Mock models
  const mockOpenAIModel: AiModel = {
    model: "gpt-4o",
    apiPath: "gpt-4o",
    context: 128000,
    pricing: {
      prompt: 0.0025,
      completion: 0.01,
    },
    vendor: "openai",
    mode: "paid",
  };

  const mockOpenRouterModel: AiModel = {
    model: "mistral-7b",
    apiPath: "mistralai/mistral-7b-instruct:free",
    context: 32768,
    vendor: "mistralai",
    mode: "free",
  };

  const mockPrompts: ChatCompletionMessageParam[] = [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello, how are you?" },
  ];

  const mockChatCompletion: ChatCompletion = {
    id: "chatcmpl-test",
    object: "chat.completion",
    created: Date.now(),
    model: "gpt-4o",
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
    // Reset environment variables
    delete process.env.OPEN_ROUTER_API_KEY;
  });

  describe("SendPromptsToAi", () => {
    describe("OpenAI Integration", () => {
      it("should successfully call OpenAI and return response", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const mockCalculateCredits = await import("@/domains/credits/credits-calculation");

        vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(mockChatCompletion);
        vi.mocked(mockCalculateCredits.calculateCreditsUsed).mockReturnValue(5);

        // Act
        const result = await SendPromptsToAi(mockPrompts, mockOpenAIModel);

        // Assert
        expect(result).toEqual({
          message: "Hello! I'm doing well, thank you for asking.",
          modelTokenUsage: {
            type: "completion",
            model: "gpt-4o",
            mode: "paid",
            usage: mockChatCompletion.usage,
            timestamp: expect.any(String),
            version: "",
            costUSD: 0,
          },
          consumedCredits: 5,
        });

        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledWith({
          model: "gpt-4o",
          messages: mockPrompts,
          stream: false,
          max_tokens: 700,
          temperature: 0.6,
          top_p: 0.9,
        });

        expect(mockCalculateCredits.calculateCreditsUsed).toHaveBeenCalledWith(
          mockOpenAIModel,
          mockChatCompletion.usage
        );
      });

      it("should handle OpenAI API errors gracefully", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const apiError = new Error("OpenAI API rate limit exceeded");
        vi.mocked(mockOpenAI.default.chat.completions.create).mockRejectedValue(apiError);

        // Act & Assert
        await expect(SendPromptsToAi(mockPrompts, mockOpenAIModel)).rejects.toThrow();
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
        };
        vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(emptyCompletion);

        // Act & Assert
        await expect(SendPromptsToAi(mockPrompts, mockOpenAIModel)).rejects.toThrow("AI returned empty content");
      });
    });

    describe("OpenRouter Integration", () => {
      beforeEach(() => {
        process.env.OPEN_ROUTER_API_KEY = "test-openrouter-key";
      });

      it("should successfully call OpenRouter and return response", async () => {
        // Arrange
        const mockCalculateCredits = await import("@/domains/credits/credits-calculation");
        vi.mocked(mockCalculateCredits.calculateCreditsUsed).mockReturnValue(2);

        vi.mocked(fetch).mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(mockChatCompletion),
        } as Response);

        // Act
        const result = await SendPromptsToAi(mockPrompts, mockOpenRouterModel);

        // Assert
        expect(result).toEqual({
          message: "Hello! I'm doing well, thank you for asking.",
          modelTokenUsage: {
            type: "completion",
            model: "gpt-4o",
            mode: "free",
            usage: mockChatCompletion.usage,
            timestamp: expect.any(String),
            version: "",
            costUSD: 0,
          },
          consumedCredits: 2,
        });

        expect(fetch).toHaveBeenCalledWith("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: "Bearer test-openrouter-key",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct:free",
            messages: mockPrompts,
            stream: false,
            max_tokens: 700,
            temperature: 0.6,
            top_p: 0.9,
          }),
        });
      });

      it("should handle missing OpenRouter API key", async () => {
        // Arrange
        delete process.env.OPEN_ROUTER_API_KEY;

        // Act & Assert
        await expect(SendPromptsToAi(mockPrompts, mockOpenRouterModel)).rejects.toThrow(
          "OPEN_ROUTER_API_KEY environment variable is not set"
        );
      });

      it("should handle OpenRouter API errors", async () => {
        // Arrange
        vi.mocked(fetch).mockResolvedValue({
          ok: false,
          status: 429,
          text: () => Promise.resolve("Rate limit exceeded"),
        } as Response);

        // Act & Assert
        await expect(SendPromptsToAi(mockPrompts, mockOpenRouterModel)).rejects.toThrow("429 - Rate limit exceeded");
      });

      it("should handle network errors gracefully", async () => {
        // Arrange
        vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

        // Act & Assert
        await expect(SendPromptsToAi(mockPrompts, mockOpenRouterModel)).rejects.toThrow();
      });
    });

    describe("Input Validation", () => {
      it("should reject empty prompts array", async () => {
        // Act & Assert
        await expect(SendPromptsToAi([], mockOpenAIModel)).rejects.toThrow(AppError);
      });

      it("should reject prompts with missing role", async () => {
        // Arrange
        const invalidPrompts = [{ content: "Hello" }] as ChatCompletionMessageParam[];

        // Act & Assert
        await expect(SendPromptsToAi(invalidPrompts, mockOpenAIModel)).rejects.toThrow(AppError);
      });

      it("should reject prompts with missing content", async () => {
        // Arrange
        const invalidPrompts = [{ role: "user" }] as ChatCompletionMessageParam[];

        // Act & Assert
        await expect(SendPromptsToAi(invalidPrompts, mockOpenAIModel)).rejects.toThrow(AppError);
      });

      it("should reject missing AI model", async () => {
        // Act & Assert
        await expect(SendPromptsToAi(mockPrompts, null as any)).rejects.toThrow("Cannot read properties of null");
      });

      it("should reject AI model without apiPath", async () => {
        // Arrange
        const invalidModel = { ...mockOpenAIModel, apiPath: "" };

        // Act & Assert
        await expect(SendPromptsToAi(mockPrompts, invalidModel)).rejects.toThrow(AppError);
      });

      it("should reject AI model without vendor", async () => {
        // Arrange
        const invalidModel = { ...mockOpenAIModel, vendor: "" as any };

        // Act & Assert
        await expect(SendPromptsToAi(mockPrompts, invalidModel)).rejects.toThrow(AppError);
      });

      it("should reject unsupported vendor", async () => {
        // Arrange
        const invalidModel = { ...mockOpenAIModel, vendor: "unsupported" as any };

        // Act & Assert
        await expect(SendPromptsToAi(mockPrompts, invalidModel)).rejects.toThrow(AppError);
      });
    });

    describe("Token Usage and Credit Calculation", () => {
      it("should handle missing usage data gracefully", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const completionWithoutUsage = { ...mockChatCompletion, usage: undefined };
        vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(completionWithoutUsage);

        // Act
        const result = await SendPromptsToAi(mockPrompts, mockOpenAIModel);

        // Assert
        expect(result.consumedCredits).toBe(0);
        expect(result.modelTokenUsage).toBeNull();
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
        await SendPromptsToAi(mockPrompts, mockOpenAIModel, customOptions);

        // Assert
        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledWith({
          model: "gpt-4o",
          messages: mockPrompts,
          stream: false,
          max_tokens: 1000,
          temperature: 0.8,
          top_p: 0.9,
        });
      });
    });
  });

  describe("SendPromptsToAiWithRetry", () => {
    describe("Retry Logic", () => {
      it("should succeed on first attempt", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const mockCalculateCredits = await import("@/domains/credits/credits-calculation");

        vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(mockChatCompletion);
        vi.mocked(mockCalculateCredits.calculateCreditsUsed).mockReturnValue(5);

        // Act
        const result = await SendPromptsToAiWithRetry(mockPrompts, mockOpenAIModel);

        // Assert
        expect(result.message).toBe("Hello! I'm doing well, thank you for asking.");
        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledTimes(1);
      });

      it("should retry on transient failures and eventually succeed", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const mockCalculateCredits = await import("@/domains/credits/credits-calculation");

        vi.mocked(mockOpenAI.default.chat.completions.create)
          .mockRejectedValueOnce(new Error("Temporary network error"))
          .mockRejectedValueOnce(new Error("Rate limit"))
          .mockResolvedValueOnce(mockChatCompletion);

        vi.mocked(mockCalculateCredits.calculateCreditsUsed).mockReturnValue(5);

        // Act
        const result = await SendPromptsToAiWithRetry(mockPrompts, mockOpenAIModel, {}, 3, 100);

        // Assert
        expect(result.message).toBe("Hello! I'm doing well, thank you for asking.");
        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledTimes(3);
      });

      it("should retry on generic network errors", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const mockCalculateCredits = await import("@/domains/credits/credits-calculation");

        vi.mocked(mockOpenAI.default.chat.completions.create)
          .mockRejectedValueOnce(new Error("Network timeout"))
          .mockResolvedValueOnce(mockChatCompletion);

        vi.mocked(mockCalculateCredits.calculateCreditsUsed).mockReturnValue(5);

        // Act
        const result = await SendPromptsToAiWithRetry(mockPrompts, mockOpenAIModel, {}, 3, 10);

        // Assert
        expect(result.message).toBe("Hello! I'm doing well, thank you for asking.");
        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledTimes(2);
      });

      it("should fail after exhausting all retries", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const persistentError = new Error("Persistent API error");
        vi.mocked(mockOpenAI.default.chat.completions.create).mockRejectedValue(persistentError);

        // Act & Assert
        await expect(SendPromptsToAiWithRetry(mockPrompts, mockOpenAIModel, {}, 2, 10)).rejects.toThrow(
          "Failed after 2 attempts"
        );

        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledTimes(2);
      });

      it("should use exponential backoff for retries", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const retryError = new Error("Retry test");
        vi.mocked(mockOpenAI.default.chat.completions.create).mockRejectedValue(retryError);

        const startTime = Date.now();

        // Act
        try {
          await SendPromptsToAiWithRetry(mockPrompts, mockOpenAIModel, {}, 3, 50);
        } catch {
          // Expected to fail
        }

        const endTime = Date.now();
        const elapsed = endTime - startTime;

        // Assert
        // Should have waited approximately: 50ms + 100ms = 150ms
        // Adding some tolerance for test execution time
        expect(elapsed).toBeGreaterThan(100);
        expect(elapsed).toBeLessThan(500);
      });
    });

    describe("Custom Retry Parameters", () => {
      it("should respect custom maxRetries parameter", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        vi.mocked(mockOpenAI.default.chat.completions.create).mockRejectedValue(new Error("Test error"));

        // Act & Assert
        await expect(SendPromptsToAiWithRetry(mockPrompts, mockOpenAIModel, {}, 1, 10)).rejects.toThrow(
          "Failed after 1 attempts"
        );

        expect(mockOpenAI.default.chat.completions.create).toHaveBeenCalledTimes(1);
      });

      it("should work with maxRetries = 1 (no retries)", async () => {
        // Arrange
        const mockOpenAI = await import("@/lib/openai");
        const mockCalculateCredits = await import("@/domains/credits/credits-calculation");

        vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(mockChatCompletion);
        vi.mocked(mockCalculateCredits.calculateCreditsUsed).mockReturnValue(5);

        // Act
        const result = await SendPromptsToAiWithRetry(mockPrompts, mockOpenAIModel, {}, 1);

        // Assert
        expect(result.message).toBe("Hello! I'm doing well, thank you for asking.");
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
      const mockCalculateCredits = await import("@/domains/credits/credits-calculation");

      vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(mockChatCompletion);
      vi.mocked(mockCalculateCredits.calculateCreditsUsed).mockReturnValue(5);

      // Mock console.info
      const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      // Act
      await SendPromptsToAi(mockPrompts, mockOpenAIModel);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("AI Service Called:"),
        expect.any(Object),
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
      const mockCalculateCredits = await import("@/domains/credits/credits-calculation");

      vi.mocked(mockOpenAI.default.chat.completions.create).mockResolvedValue(mockChatCompletion);
      vi.mocked(mockCalculateCredits.calculateCreditsUsed).mockReturnValue(5);

      // Mock console.info
      const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      // Act
      await SendPromptsToAi(mockPrompts, mockOpenAIModel);

      // Assert
      expect(consoleSpy).not.toHaveBeenCalled();

      // Cleanup
      (process.env as any).NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });
});
