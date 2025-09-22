/**
 * Unit tests for cost estimation functions
 * Critical billing accuracy - ensures accurate cost calculations
 */

import { CompletionUsage } from "openai/resources";
import { describe, expect, it } from "vitest";

import { AiModel, AiModelPricing } from "@/types/ai-model.types";
import { calculateCost, calculateRoundCost, estimateCost } from "../cost-estimation";

describe("Cost Estimation Functions", () => {
  // Mock pricing configurations
  const mockGPT4Pricing: AiModelPricing = {
    prompt: 0.0025, // $0.0025 per 1K input tokens
    completion: 0.01, // $0.01 per 1K output tokens
  };

  const mockGPT35Pricing: AiModelPricing = {
    prompt: 0.0005, // $0.0005 per 1K input tokens
    completion: 0.0015, // $0.0015 per 1K output tokens
  };

  const mockFreePricing: AiModelPricing = {
    prompt: 0,
    completion: 0,
  };

  const mockGPT4Model: AiModel = {
    model: "gpt-4o",
    apiPath: "/v1/chat/completions",
    context: 128000,
    pricing: mockGPT4Pricing,
    vendor: "openai",
    mode: "paid",
  };

  describe("estimateCost", () => {
    it("should calculate cost correctly for GPT-4 pricing", () => {
      const cost = estimateCost(mockGPT4Pricing, 1000, 500);

      // Expected calculation:
      // Prompt cost: (1000/1000) * $0.0025 = $0.0025
      // Completion cost: (500/1000) * $0.01 = $0.005
      // Total: $0.0075
      expect(cost).toBe(0.0075);
    });

    it("should calculate cost correctly for GPT-3.5 pricing", () => {
      const cost = estimateCost(mockGPT35Pricing, 2000, 300);

      // Expected calculation:
      // Prompt cost: (2000/1000) * $0.0005 = $0.001
      // Completion cost: (300/1000) * $0.0015 = $0.00045
      // Total: $0.00145
      expect(cost).toBe(0.00145);
    });

    it("should handle zero tokens", () => {
      const cost = estimateCost(mockGPT4Pricing, 0, 0);
      expect(cost).toBe(0);
    });

    it("should handle only prompt tokens", () => {
      const cost = estimateCost(mockGPT4Pricing, 1000, 0);
      expect(cost).toBe(0.0025);
    });

    it("should handle only completion tokens", () => {
      const cost = estimateCost(mockGPT4Pricing, 0, 500);
      expect(cost).toBe(0.005);
    });

    it("should return 0 for null pricing", () => {
      const cost = estimateCost(null, 1000, 500);
      expect(cost).toBe(0);
    });

    it("should return 0 for undefined pricing", () => {
      const cost = estimateCost(undefined, 1000, 500);
      expect(cost).toBe(0);
    });

    it("should handle free model pricing", () => {
      const cost = estimateCost(mockFreePricing, 1000, 500);
      expect(cost).toBe(0);
    });

    it("should round to 6 decimal places", () => {
      // Use pricing that would result in more than 6 decimal places
      const precisePricing: AiModelPricing = {
        prompt: 0.000123456789,
        completion: 0.000987654321,
      };

      const cost = estimateCost(precisePricing, 1000, 1000);

      // Should be rounded to 6 decimal places
      expect(cost.toString().split(".")[1]?.length || 0).toBeLessThanOrEqual(6);
    });

    it("should handle large token counts", () => {
      const cost = estimateCost(mockGPT4Pricing, 100000, 50000);

      // Expected calculation:
      // Prompt cost: (100000/1000) * $0.0025 = $0.25
      // Completion cost: (50000/1000) * $0.01 = $0.5
      // Total: $0.75
      expect(cost).toBe(0.75);
    });
  });

  describe("calculateCost", () => {
    const basicUsage: CompletionUsage = {
      prompt_tokens: 1000,
      completion_tokens: 500,
      total_tokens: 1500,
    };

    it("should calculate cost correctly without cached tokens", () => {
      const cost = calculateCost(mockGPT4Pricing, basicUsage);

      // Expected calculation:
      // Prompt cost: (1000 * $0.0025) / 1000 = $0.0025
      // Completion cost: (500 * $0.01) / 1000 = $0.005
      // Total: $0.0075
      expect(cost).toBe(0.0075);
    });

    it("should handle cached tokens with 50% discount", () => {
      const usageWithCache: CompletionUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
        prompt_tokens_details: {
          cached_tokens: 400, // 400 of the 1000 prompt tokens are cached
        },
      };

      const cost = calculateCost(mockGPT4Pricing, usageWithCache);

      // Expected calculation:
      // Non-cached tokens: 1000 - 400 = 600
      // Cached tokens at half price: 400 * 0.5 = 200
      // Effective prompt tokens: 600 + 200 = 800
      // Prompt cost: (800 * $0.0025) / 1000 = $0.002
      // Completion cost: (500 * $0.01) / 1000 = $0.005
      // Total: $0.007
      expect(cost).toBe(0.007);
    });

    it("should handle usage with all tokens cached", () => {
      const usageAllCached: CompletionUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
        prompt_tokens_details: {
          cached_tokens: 1000, // All prompt tokens are cached
        },
      };

      const cost = calculateCost(mockGPT4Pricing, usageAllCached);

      // Expected calculation:
      // Non-cached tokens: 1000 - 1000 = 0
      // Cached tokens at half price: 1000 * 0.5 = 500
      // Effective prompt tokens: 0 + 500 = 500
      // Prompt cost: (500 * $0.0025) / 1000 = $0.00125
      // Completion cost: (500 * $0.01) / 1000 = $0.005
      // Total: $0.00625
      expect(cost).toBe(0.00625);
    });

    it("should handle missing cached tokens details", () => {
      const usageNoCacheDetails: CompletionUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
        // No prompt_tokens_details
      };

      const cost = calculateCost(mockGPT4Pricing, usageNoCacheDetails);

      // Should treat as no cached tokens
      expect(cost).toBe(0.0075);
    });

    it("should handle zero cached tokens", () => {
      const usageZeroCache: CompletionUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500,
        prompt_tokens_details: {
          cached_tokens: 0,
        },
      };

      const cost = calculateCost(mockGPT4Pricing, usageZeroCache);

      // Should be same as no cache
      expect(cost).toBe(0.0075);
    });

    it("should handle edge case where cached tokens exceed prompt tokens", () => {
      const usageInvalidCache: CompletionUsage = {
        prompt_tokens: 500,
        completion_tokens: 300,
        total_tokens: 800,
        prompt_tokens_details: {
          cached_tokens: 1000, // More cached than total prompt tokens
        },
      };

      const cost = calculateCost(mockGPT4Pricing, usageInvalidCache);

      // Should handle gracefully (negative non-cached tokens)
      // Non-cached: 500 - 1000 = -500
      // Cached at half: 1000 * 0.5 = 500
      // Effective: -500 + 500 = 0
      expect(cost).toBeGreaterThanOrEqual(0);
    });
  });

  describe("calculateRoundCost", () => {
    const usage1: CompletionUsage = {
      prompt_tokens: 1000,
      completion_tokens: 500,
      total_tokens: 1500,
    };

    const usage2: CompletionUsage = {
      prompt_tokens: 800,
      completion_tokens: 300,
      total_tokens: 1100,
    };

    const usage3: CompletionUsage = {
      prompt_tokens: 1200,
      completion_tokens: 600,
      total_tokens: 1800,
      prompt_tokens_details: {
        cached_tokens: 400,
      },
    };

    it("should calculate total cost for multiple usages", () => {
      const totalCost = calculateRoundCost(mockGPT4Model, [usage1, usage2]);

      // Usage1: $0.0075 (calculated above)
      // Usage2: (800 * $0.0025 + 300 * $0.01) / 1000 = $0.005
      // Total: $0.0125
      const expectedCost = 0.0075 + 0.005;
      expect(totalCost).toBe(expectedCost);
    });

    it("should handle single usage", () => {
      const totalCost = calculateRoundCost(mockGPT4Model, [usage1]);
      expect(totalCost).toBe(0.0075);
    });

    it("should handle empty usage array", () => {
      const totalCost = calculateRoundCost(mockGPT4Model, []);
      expect(totalCost).toBe(0);
    });

    it("should handle mix of cached and non-cached usages", () => {
      const totalCost = calculateRoundCost(mockGPT4Model, [usage1, usage3]);

      // Usage1: $0.0075 (no cache)
      // Usage3: calculated with cache discount
      // Non-cached: 1200 - 400 = 800
      // Cached at half: 400 * 0.5 = 200
      // Effective: 800 + 200 = 1000
      // Usage3 cost: (1000 * $0.0025 + 600 * $0.01) / 1000 = $0.0085
      const expectedCost = 0.0075 + 0.0085;
      expect(totalCost).toBe(expectedCost);
    });

    it("should throw error when model has no pricing", () => {
      const modelNoPricing: AiModel = {
        ...mockGPT4Model,
        pricing: undefined,
      };

      expect(() => {
        calculateRoundCost(modelNoPricing, [usage1]);
      }).toThrow("Pricing not defined for model: gpt-4o");
    });

    it("should handle large number of usages", () => {
      const manyUsages = Array(100).fill(usage1);
      const totalCost = calculateRoundCost(mockGPT4Model, manyUsages);

      // Should be approximately 100 * cost of usage1 (handle floating point precision)
      expect(totalCost).toBeCloseTo(100 * 0.0075, 10);
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle negative token values in estimateCost", () => {
      // Should handle gracefully without throwing
      expect(() => {
        estimateCost(mockGPT4Pricing, -100, 500);
      }).not.toThrow();
    });

    it("should handle extremely large token values", () => {
      const cost = estimateCost(mockGPT4Pricing, 1000000, 500000);

      // Should handle large numbers without overflow
      expect(Number.isFinite(cost)).toBe(true);
      expect(cost).toBeGreaterThan(0);
    });

    it("should handle extremely small pricing values", () => {
      const tinyPricing: AiModelPricing = {
        prompt: 0.000000001,
        completion: 0.000000001,
      };

      const cost = estimateCost(tinyPricing, 1000, 500);

      expect(Number.isFinite(cost)).toBe(true);
      // With extremely small pricing, cost might be rounded to 0 due to precision
      expect(cost).toBeGreaterThanOrEqual(0);
    });

    it("should handle precision correctly", () => {
      // Test with values that might cause floating point precision issues
      const cost = estimateCost(mockGPT4Pricing, 333, 333);

      expect(Number.isFinite(cost)).toBe(true);
      expect(cost).toBeGreaterThan(0);
    });
  });

  describe("Real-world scenarios", () => {
    it("should calculate cost for typical short conversation", () => {
      const shortConversation: CompletionUsage = {
        prompt_tokens: 800,
        completion_tokens: 300,
        total_tokens: 1100,
      };

      const cost = calculateCost(mockGPT4Pricing, shortConversation);

      expect(cost).toBeGreaterThan(0);
      expect(cost).toBeLessThan(0.02); // Should be reasonable for short conversation
    });

    it("should calculate cost for long therapy session", () => {
      const longSession: CompletionUsage = {
        prompt_tokens: 8000,
        completion_tokens: 1500,
        total_tokens: 9500,
      };

      const cost = calculateCost(mockGPT4Pricing, longSession);

      expect(cost).toBeGreaterThan(0.01);
      expect(cost).toBeLessThan(0.1); // Should be reasonable for long session
    });

    it("should calculate cost for conversation with context reuse (cached tokens)", () => {
      const contextReuseConversation: CompletionUsage = {
        prompt_tokens: 3000,
        completion_tokens: 400,
        total_tokens: 3400,
        prompt_tokens_details: {
          cached_tokens: 2000, // Significant context reuse
        },
      };

      const costWithCache = calculateCost(mockGPT4Pricing, contextReuseConversation);
      const costWithoutCache = calculateCost(mockGPT4Pricing, {
        ...contextReuseConversation,
        prompt_tokens_details: undefined,
      });

      // Cost with cache should be lower
      expect(costWithCache).toBeLessThan(costWithoutCache);
    });

    it("should handle multiple rounds in a session", () => {
      const round1: CompletionUsage = {
        prompt_tokens: 500,
        completion_tokens: 200,
        total_tokens: 700,
      };

      const round2: CompletionUsage = {
        prompt_tokens: 800,
        completion_tokens: 300,
        total_tokens: 1100,
        prompt_tokens_details: {
          cached_tokens: 300,
        },
      };

      const round3: CompletionUsage = {
        prompt_tokens: 1200,
        completion_tokens: 400,
        total_tokens: 1600,
        prompt_tokens_details: {
          cached_tokens: 600,
        },
      };

      const sessionCost = calculateRoundCost(mockGPT4Model, [round1, round2, round3]);

      expect(sessionCost).toBeGreaterThan(0);
      expect(sessionCost).toBeLessThan(0.05); // Should be reasonable for 3-round session
    });
  });
});
