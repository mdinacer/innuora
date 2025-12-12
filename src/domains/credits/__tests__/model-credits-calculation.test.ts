/**
 * Unit tests for model credits calculation (NEW SYSTEM)
 * Critical revenue protection - tests billing accuracy for 4 model categories
 */

import { describe, expect, it } from "vitest";

import { AIModelCategory } from "@/domains/ai-conversation/ai-models";
import { ModelTokenUsage } from "@/domains/shared-types";
import { calculateCreditsFromUsage, DEFAULT_CREDIT_CONFIG } from "../model-credits-calculation";

describe("calculateCreditsFromUsage", () => {
  const createTokenUsage = (
    promptTokens: number,
    completionTokens: number,
    cachedTokens: number = 0
  ): ModelTokenUsage => ({
    promptTokens,
    completionTokens,
    cachedTokens,
    totalTokens: promptTokens + completionTokens,
    timestamp: new Date().toISOString(),
    responseLength: 0,
  });

  describe("GPT-4o (reflection model)", () => {
    const model: AIModelCategory = "reflection";

    it("should calculate credits correctly for standard usage", () => {
      // 1000 input tokens × $0.0025/1K = $0.0025
      // 500 output tokens × $0.01/1K = $0.005
      // Total: $0.0075 × 2 (margin) = $0.015
      // Credits: $0.015 / $0.0025 = 6 credits
      const result = calculateCreditsFromUsage(model, createTokenUsage(1000, 500));

      expect(result.credits).toBe(6);
      expect(result.rawCostUsd).toBe(0.0075);
      expect(result.adjustedCostUsd).toBe(0.015);
    });

    it("should apply cached token discount (50% off)", () => {
      // 500 regular input × $0.0025/1K = $0.00125
      // 500 cached input × $0.00125/1K = $0.000625
      // 500 output × $0.01/1K = $0.005
      // Total: $0.006875 × 2 = $0.01375
      // Credits: $0.01375 / $0.0025 = 5.5 → 5.5 credits
      const result = calculateCreditsFromUsage(model, createTokenUsage(1000, 500, 500));

      expect(result.credits).toBe(5.5);
      expect(result.breakdown.cachedTokens).toBe(500);
      expect(result.breakdown.cachedCost).toBe(0.000625);
    });

    it("should enforce minimum credits (0.01)", () => {
      // Very small usage: 1 input, 1 output token
      const result = calculateCreditsFromUsage(model, createTokenUsage(1, 1));

      expect(result.credits).toBeGreaterThanOrEqual(DEFAULT_CREDIT_CONFIG.minimumCredits);
      expect(result.credits).toBe(0.01);
    });
  });

  describe("GPT-4.1 (diagnostic model)", () => {
    const model: AIModelCategory = "diagnostic";

    it("should calculate credits correctly", () => {
      // 1000 input × $0.002/1K = $0.002
      // 500 output × $0.008/1K = $0.004
      // Total: $0.006 × 2 = $0.012
      // Credits: $0.012 / $0.0025 = 4.8 credits
      const result = calculateCreditsFromUsage(model, createTokenUsage(1000, 500));

      expect(result.credits).toBe(4.8);
      expect(result.rawCostUsd).toBe(0.006);
    });
  });

  describe("GPT-4.1-mini (background model)", () => {
    const model: AIModelCategory = "background";

    it("should calculate credits correctly (cheaper model)", () => {
      // 1000 input × $0.0004/1K = $0.0004
      // 500 output × $0.0016/1K = $0.0008
      // Total: $0.0012 × 2 = $0.0024
      // Credits: $0.0024 / $0.0025 = 0.96 → 0.96 credits
      const result = calculateCreditsFromUsage(model, createTokenUsage(1000, 500));

      expect(result.credits).toBe(0.96);
      expect(result.rawCostUsd).toBe(0.0012);
    });
  });

  describe("GPT-4o-mini (auxiliary model)", () => {
    const model: AIModelCategory = "auxiliary";

    it("should calculate credits correctly (cheapest model)", () => {
      // 1000 input × $0.00015/1K = $0.00015
      // 500 output × $0.0006/1K = $0.0003
      // Total: $0.00045 × 2 = $0.0009
      // Credits: $0.0009 / $0.0025 = 0.36 → 0.36 credits
      const result = calculateCreditsFromUsage(model, createTokenUsage(1000, 500));

      expect(result.credits).toBe(0.36);
      expect(result.rawCostUsd).toBe(0.00045);
    });
  });

  describe("Edge cases", () => {
    it("should handle zero tokens", () => {
      const result = calculateCreditsFromUsage("reflection", createTokenUsage(0, 0));

      expect(result.credits).toBe(DEFAULT_CREDIT_CONFIG.minimumCredits);
      expect(result.rawCostUsd).toBe(0);
    });

    it("should handle very large token counts", () => {
      // 100K input, 50K output
      const result = calculateCreditsFromUsage("reflection", createTokenUsage(100000, 50000));

      expect(result.credits).toBeGreaterThan(0);
      expect(result.breakdown.inputTokens).toBe(100000);
      expect(result.breakdown.outputTokens).toBe(50000);
    });

    it("should round to 2 decimal places", () => {
      // Small usage that results in fractional credits
      const result = calculateCreditsFromUsage("reflection", createTokenUsage(100, 50));

      // Should be rounded to 2 decimal places
      expect(Number.isInteger(result.credits * 100)).toBe(true);
    });
  });

  describe("Margin and pricing configuration", () => {
    it("should apply 2x margin multiplier", () => {
      const result = calculateCreditsFromUsage("reflection", createTokenUsage(1000, 500));

      // Verify margin was applied
      expect(result.adjustedCostUsd).toBe(result.rawCostUsd * 2);
    });

    it("should use $0.0025 per credit value", () => {
      const result = calculateCreditsFromUsage("reflection", createTokenUsage(1000, 500));

      // Credits = adjustedCostUsd / creditUsdValue
      const expectedCredits = Math.max(
        DEFAULT_CREDIT_CONFIG.minimumCredits,
        Math.round((result.adjustedCostUsd / DEFAULT_CREDIT_CONFIG.creditUsdValue) * 100) / 100
      );

      expect(result.credits).toBe(expectedCredits);
    });
  });

  describe("Cost breakdown verification", () => {
    it("should provide detailed cost breakdown", () => {
      const result = calculateCreditsFromUsage("reflection", createTokenUsage(1000, 500, 200));

      expect(result.breakdown).toHaveProperty("model");
      expect(result.breakdown).toHaveProperty("vendor", "openai");
      expect(result.breakdown).toHaveProperty("inputTokens", 1000);
      expect(result.breakdown).toHaveProperty("cachedTokens", 200);
      expect(result.breakdown).toHaveProperty("outputTokens", 500);
      expect(result.breakdown).toHaveProperty("inputCost");
      expect(result.breakdown).toHaveProperty("cachedCost");
      expect(result.breakdown).toHaveProperty("outputCost");
      expect(result.breakdown).toHaveProperty("total");
    });

    it("should sum cost components correctly", () => {
      const result = calculateCreditsFromUsage("reflection", createTokenUsage(1000, 500, 200));

      const totalFromComponents =
        result.breakdown.inputCost + result.breakdown.cachedCost + result.breakdown.outputCost;

      expect(result.breakdown.total).toBeCloseTo(totalFromComponents, 6);
    });
  });
});
