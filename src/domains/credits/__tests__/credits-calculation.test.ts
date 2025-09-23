/**
 * Unit tests for credits calculation functions
 * Critical revenue protection - tests billing accuracy
 */

import { CompletionUsage } from "openai/resources";
import { describe, expect, it } from "vitest";

import { AiModel } from "@/types/ai-model.types";
import { calculateCreditsUsed, CreditSystemConfig, DEFAULT_CREDIT_CONFIG } from "../credits-calculation";

describe("calculateCreditsUsed", () => {
  // Mock AI models for testing
  const mockGPT4Model: AiModel = {
    model: "gpt-4o",
    apiPath: "/v1/chat/completions",
    context: 128000,
    pricing: {
      prompt: 0.0025, // $0.0025 per 1K input tokens
      completion: 0.01, // $0.01 per 1K output tokens
    },
    vendor: "openai",
    mode: "paid",
  };

  const mockGPT35Model: AiModel = {
    model: "gpt-3.5-turbo",
    apiPath: "/v1/chat/completions",
    context: 16385,
    pricing: {
      prompt: 0.0005, // $0.0005 per 1K input tokens
      completion: 0.0015, // $0.0015 per 1K output tokens
    },
    vendor: "openai",
    mode: "paid",
  };

  const mockFreeModel: AiModel = {
    model: "openchat",
    apiPath: "/v1/chat/completions",
    context: 8192,
    // No pricing - should throw error
    vendor: "tngtech",
    mode: "free",
  };

  describe("Basic calculations", () => {
    it("should calculate credits correctly for standard GPT-4 usage", () => {
      const tokenUsage: CompletionUsage = {
        prompt_tokens: 1000, // 1K input tokens
        completion_tokens: 500, // 500 output tokens
        total_tokens: 1500,
      };

      const credits = calculateCreditsUsed(mockGPT4Model, tokenUsage);

      // Expected calculation:
      // Input cost: (1000/1000) * $0.0025 = $0.0025
      // Output cost: (500/1000) * $0.01 = $0.005
      // Raw cost: $0.0075
      // With 2x margin: $0.015
      // Convert to credits: $0.015 / $0.0025 = 6 credits
      // Rounded up: 6 credits
      expect(credits).toBe(6);
    });

    it("should calculate credits correctly for smaller GPT-3.5 usage", () => {
      const tokenUsage: CompletionUsage = {
        prompt_tokens: 500,
        completion_tokens: 200,
        total_tokens: 700,
      };

      const credits = calculateCreditsUsed(mockGPT35Model, tokenUsage);

      // Expected calculation:
      // Input cost: (500/1000) * $0.0005 = $0.00025
      // Output cost: (200/1000) * $0.0015 = $0.0003
      // Raw cost: $0.00055
      // With 2x margin: $0.0011
      // Convert to credits: $0.0011 / $0.0025 = 0.44 credits
      // Rounded up: 1 credit (minimum floor)
      expect(credits).toBe(1);
    });

    it("should handle zero token usage", () => {
      const tokenUsage: CompletionUsage = {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      };

      const credits = calculateCreditsUsed(mockGPT4Model, tokenUsage);

      // Zero tokens should result in zero credits
      expect(credits).toBe(0);
    });

    it("should handle large token usage correctly", () => {
      const tokenUsage: CompletionUsage = {
        prompt_tokens: 50000, // 50K tokens
        completion_tokens: 10000, // 10K tokens
        total_tokens: 60000,
      };

      const credits = calculateCreditsUsed(mockGPT4Model, tokenUsage);

      // Expected calculation:
      // Input cost: (50000/1000) * $0.0025 = $0.125
      // Output cost: (10000/1000) * $0.01 = $0.1
      // Raw cost: $0.225
      // With 2x margin: $0.45
      // Convert to credits: $0.45 / $0.0025 = 180 credits
      expect(credits).toBe(180);
    });
  });

  describe("Rounding behavior", () => {
    it("should always round up fractional credits", () => {
      const tokenUsage: CompletionUsage = {
        prompt_tokens: 100, // Small usage that results in fractional credits
        completion_tokens: 50,
        total_tokens: 150,
      };

      const credits = calculateCreditsUsed(mockGPT4Model, tokenUsage);

      // This should result in a fractional credit amount that gets rounded up
      expect(credits).toBeGreaterThan(0);
      expect(Number.isInteger(credits)).toBe(true);
    });

    it("should not round down even tiny amounts", () => {
      const tokenUsage: CompletionUsage = {
        prompt_tokens: 1, // Minimal tokens
        completion_tokens: 1,
        total_tokens: 2,
      };

      const credits = calculateCreditsUsed(mockGPT4Model, tokenUsage);

      // Even minimal usage should result in at least 1 credit
      expect(credits).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Custom configuration", () => {
    it("should respect custom credit value configuration", () => {
      const customConfig: CreditSystemConfig = {
        creditUsdValue: 0.005, // 1 credit = $0.005 (double the default)
        marginMultiplier: 2.0,
        minimumChargeCredits: 0,
      };

      const tokenUsage: CompletionUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
      };

      const credits = calculateCreditsUsed(mockGPT4Model, tokenUsage, customConfig);

      // With doubled credit value, should result in half the credits
      // Previous calculation was 6 credits, now should be 3
      expect(credits).toBe(3);
    });

    it("should respect custom margin multiplier", () => {
      const customConfig: CreditSystemConfig = {
        creditUsdValue: 0.0025,
        marginMultiplier: 3.0, // Triple the margin
        minimumChargeCredits: 0,
      };

      const tokenUsage: CompletionUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
      };

      const credits = calculateCreditsUsed(mockGPT4Model, tokenUsage, customConfig);

      // With 3x margin instead of 2x, should result in more credits
      // Base calculation: $0.0075 * 3 = $0.0225 / $0.0025 = 9 credits
      expect(credits).toBe(9);
    });

    it("should enforce minimum charge credits", () => {
      const customConfig: CreditSystemConfig = {
        creditUsdValue: 0.0025,
        marginMultiplier: 2.0,
        minimumChargeCredits: 5, // Minimum 5 credits
      };

      const tokenUsage: CompletionUsage = {
        prompt_tokens: 10, // Very small usage
        completion_tokens: 5,
        total_tokens: 15,
      };

      const credits = calculateCreditsUsed(mockGPT4Model, tokenUsage, customConfig);

      // Should enforce minimum of 5 credits despite tiny usage
      expect(credits).toBe(5);
    });

    it("should not enforce minimum when calculated credits are higher", () => {
      const customConfig: CreditSystemConfig = {
        creditUsdValue: 0.0025,
        marginMultiplier: 2.0,
        minimumChargeCredits: 2, // Minimum 2 credits
      };

      const tokenUsage: CompletionUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
      };

      const credits = calculateCreditsUsed(mockGPT4Model, tokenUsage, customConfig);

      // Calculated credits (6) should be higher than minimum (2)
      expect(credits).toBe(6);
      expect(credits).toBeGreaterThan(customConfig.minimumChargeCredits);
    });
  });

  describe("Error handling", () => {
    it("should throw error when model has no pricing", () => {
      const tokenUsage: CompletionUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
      };

      expect(() => {
        calculateCreditsUsed(mockFreeModel, tokenUsage);
      }).toThrow("Model openchat has no pricing info");
    });

    it("should throw error when model pricing is undefined", () => {
      const modelWithoutPricing: AiModel = {
        ...mockGPT4Model,
        pricing: undefined,
      };

      const tokenUsage: CompletionUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
      };

      expect(() => {
        calculateCreditsUsed(modelWithoutPricing, tokenUsage);
      }).toThrow();
    });
  });

  describe("Edge cases", () => {
    it("should handle models with zero pricing", () => {
      const freeModelWithZeroPricing: AiModel = {
        ...mockGPT4Model,
        pricing: {
          prompt: 0,
          completion: 0,
        },
      };

      const tokenUsage: CompletionUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
      };

      const credits = calculateCreditsUsed(freeModelWithZeroPricing, tokenUsage);

      // Zero cost should result in zero credits
      expect(credits).toBe(0);
    });

    it("should handle negative token values gracefully", () => {
      const tokenUsage: CompletionUsage = {
        prompt_tokens: -100, // Invalid negative value
        completion_tokens: 500,
        total_tokens: 400,
      };

      // Function should handle negative values without crashing
      // (though this represents invalid input in practice)
      expect(() => {
        calculateCreditsUsed(mockGPT4Model, tokenUsage);
      }).not.toThrow();
    });

    it("should handle very high margin multipliers", () => {
      const extremeConfig: CreditSystemConfig = {
        creditUsdValue: 0.0025,
        marginMultiplier: 1000.0, // Extreme margin
        minimumChargeCredits: 0,
      };

      const tokenUsage: CompletionUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
      };

      const credits = calculateCreditsUsed(mockGPT4Model, tokenUsage, extremeConfig);

      // Should handle extreme multipliers without overflow
      expect(credits).toBeGreaterThan(0);
      expect(Number.isFinite(credits)).toBe(true);
    });
  });

  describe("Real-world scenarios", () => {
    it("should handle typical short conversation", () => {
      // Typical short therapy conversation
      const tokenUsage: CompletionUsage = {
        prompt_tokens: 800, // Context + user message
        completion_tokens: 300, // AI response
        total_tokens: 1100,
      };

      const credits = calculateCreditsUsed(mockGPT4Model, tokenUsage);

      expect(credits).toBeGreaterThan(0);
      expect(credits).toBeLessThan(10); // Should be reasonable for short conversation
    });

    it("should handle long therapy session", () => {
      // Long therapy session with substantial context
      const tokenUsage: CompletionUsage = {
        prompt_tokens: 8000, // Large context
        completion_tokens: 1500, // Detailed response
        total_tokens: 9500,
      };

      const credits = calculateCreditsUsed(mockGPT4Model, tokenUsage);

      expect(credits).toBeGreaterThan(10);
      expect(credits).toBeLessThan(100); // Should be reasonable for long session
    });

    it("should be consistent with default configuration", () => {
      const tokenUsage: CompletionUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
      };

      // Test with explicit default config vs implicit default
      const creditsExplicit = calculateCreditsUsed(mockGPT4Model, tokenUsage, DEFAULT_CREDIT_CONFIG);
      const creditsImplicit = calculateCreditsUsed(mockGPT4Model, tokenUsage);

      expect(creditsExplicit).toBe(creditsImplicit);
    });
  });

  describe("Configuration validation", () => {
    it("should validate DEFAULT_CREDIT_CONFIG structure", () => {
      expect(DEFAULT_CREDIT_CONFIG).toHaveProperty("creditUsdValue");
      expect(DEFAULT_CREDIT_CONFIG).toHaveProperty("marginMultiplier");
      expect(DEFAULT_CREDIT_CONFIG).toHaveProperty("minimumChargeCredits");

      expect(typeof DEFAULT_CREDIT_CONFIG.creditUsdValue).toBe("number");
      expect(typeof DEFAULT_CREDIT_CONFIG.marginMultiplier).toBe("number");
      expect(typeof DEFAULT_CREDIT_CONFIG.minimumChargeCredits).toBe("number");

      expect(DEFAULT_CREDIT_CONFIG.creditUsdValue).toBeGreaterThan(0);
      expect(DEFAULT_CREDIT_CONFIG.marginMultiplier).toBeGreaterThan(0);
      expect(DEFAULT_CREDIT_CONFIG.minimumChargeCredits).toBeGreaterThanOrEqual(0);
    });
  });
});
