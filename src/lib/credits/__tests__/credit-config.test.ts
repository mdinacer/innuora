/**
 * Unit tests for credit configuration functions
 * Critical user experience - tests credit economy calculations and UX
 */

import { describe, expect, it } from "vitest";

import { CREDIT_CONFIG, CreditConfigType, CreditUtils, CreditUXUtils, RoundingMode } from "../credit-config";

describe("Credit Configuration", () => {
  describe("CREDIT_CONFIG constants", () => {
    it("should have valid configuration values", () => {
      expect(CREDIT_CONFIG.tokensPerCredit).toBeGreaterThan(0);
      expect(CREDIT_CONFIG.displayPrecision).toBeGreaterThanOrEqual(0);
      expect(CREDIT_CONFIG.minimumCharge).toBeGreaterThanOrEqual(0);
      expect(["up", "nearest", "down"]).toContain(CREDIT_CONFIG.roundingMode);
    });

    it("should have expected default values", () => {
      expect(CREDIT_CONFIG.tokensPerCredit).toBe(1000);
      expect(CREDIT_CONFIG.displayPrecision).toBe(0);
      expect(CREDIT_CONFIG.roundingMode).toBe("up");
      expect(CREDIT_CONFIG.minimumCharge).toBe(1);
    });

    it("should be readonly (const assertion)", () => {
      // TypeScript should enforce this at compile time
      expect(typeof CREDIT_CONFIG).toBe("object");
      expect(CREDIT_CONFIG).toBeDefined();
    });
  });

  describe("CreditUtils", () => {
    describe("tokensToCredits", () => {
      it("should convert tokens to credits correctly", () => {
        expect(CreditUtils.tokensToCredits(1000)).toBe(1);
        expect(CreditUtils.tokensToCredits(2000)).toBe(2);
        expect(CreditUtils.tokensToCredits(500)).toBe(0.5);
        expect(CreditUtils.tokensToCredits(1500)).toBe(1.5);
      });

      it("should handle zero tokens", () => {
        expect(CreditUtils.tokensToCredits(0)).toBe(0);
      });

      it("should handle fractional tokens", () => {
        expect(CreditUtils.tokensToCredits(250)).toBe(0.25);
        expect(CreditUtils.tokensToCredits(750)).toBe(0.75);
      });

      it("should handle large token amounts", () => {
        expect(CreditUtils.tokensToCredits(100000)).toBe(100);
        expect(CreditUtils.tokensToCredits(1000000)).toBe(1000);
      });
    });

    describe("creditsToTokens", () => {
      it("should convert credits to tokens correctly", () => {
        expect(CreditUtils.creditsToTokens(1)).toBe(1000);
        expect(CreditUtils.creditsToTokens(2)).toBe(2000);
        expect(CreditUtils.creditsToTokens(0.5)).toBe(500);
        expect(CreditUtils.creditsToTokens(1.5)).toBe(1500);
      });

      it("should handle zero credits", () => {
        expect(CreditUtils.creditsToTokens(0)).toBe(0);
      });

      it("should handle fractional credits", () => {
        expect(CreditUtils.creditsToTokens(0.25)).toBe(250);
        expect(CreditUtils.creditsToTokens(0.75)).toBe(750);
      });

      it("should be inverse of tokensToCredits", () => {
        const tokens = 2500;
        const credits = CreditUtils.tokensToCredits(tokens);
        const convertedBack = CreditUtils.creditsToTokens(credits);
        expect(convertedBack).toBe(tokens);
      });
    });

    describe("applyBillingRules", () => {
      describe("rounding mode: up", () => {
        it("should round up fractional credits", () => {
          expect(CreditUtils.applyBillingRules(0.1)).toBe(1);
          expect(CreditUtils.applyBillingRules(0.9)).toBe(1);
          expect(CreditUtils.applyBillingRules(1.1)).toBe(2);
          expect(CreditUtils.applyBillingRules(1.9)).toBe(2);
        });

        it("should not change whole numbers", () => {
          expect(CreditUtils.applyBillingRules(1)).toBe(1);
          expect(CreditUtils.applyBillingRules(2)).toBe(2);
          expect(CreditUtils.applyBillingRules(5)).toBe(5);
        });

        it("should apply minimum charge", () => {
          expect(CreditUtils.applyBillingRules(0)).toBe(1); // minimum charge
          expect(CreditUtils.applyBillingRules(0.1)).toBe(1);
        });
      });

      it("should handle negative credits", () => {
        // Should apply minimum charge even for negative values
        expect(CreditUtils.applyBillingRules(-1)).toBe(1);
        expect(CreditUtils.applyBillingRules(-0.5)).toBe(1);
      });

      it("should handle very large credits", () => {
        expect(CreditUtils.applyBillingRules(999.1)).toBe(1000);
        expect(CreditUtils.applyBillingRules(1000)).toBe(1000);
      });
    });

    describe("formatCreditsForDisplay", () => {
      it("should format with configured precision (0 decimal places)", () => {
        expect(CreditUtils.formatCreditsForDisplay(1)).toBe("1");
        expect(CreditUtils.formatCreditsForDisplay(1.5)).toBe("2");
        expect(CreditUtils.formatCreditsForDisplay(1.1)).toBe("1");
        expect(CreditUtils.formatCreditsForDisplay(1.9)).toBe("2");
      });

      it("should handle zero credits", () => {
        expect(CreditUtils.formatCreditsForDisplay(0)).toBe("0");
      });

      it("should handle large numbers", () => {
        expect(CreditUtils.formatCreditsForDisplay(1000)).toBe("1000");
        expect(CreditUtils.formatCreditsForDisplay(999.9)).toBe("1000");
      });
    });

    describe("calculateBillableCredits", () => {
      it("should convert tokens to billable credits with rounding", () => {
        // 500 tokens = 0.5 credits → rounded up to 1 credit
        expect(CreditUtils.calculateBillableCredits(500)).toBe(1);

        // 1000 tokens = 1 credit → stays 1 credit
        expect(CreditUtils.calculateBillableCredits(1000)).toBe(1);

        // 1500 tokens = 1.5 credits → rounded up to 2 credits
        expect(CreditUtils.calculateBillableCredits(1500)).toBe(2);
      });

      it("should apply minimum charge", () => {
        // Very few tokens should still result in minimum charge
        expect(CreditUtils.calculateBillableCredits(10)).toBe(1);
        expect(CreditUtils.calculateBillableCredits(0)).toBe(1);
      });

      it("should handle realistic usage scenarios", () => {
        // Typical conversation: 800 tokens
        expect(CreditUtils.calculateBillableCredits(800)).toBe(1);

        // Long conversation: 3500 tokens
        expect(CreditUtils.calculateBillableCredits(3500)).toBe(4);

        // Extended session: 8500 tokens
        expect(CreditUtils.calculateBillableCredits(8500)).toBe(9);
      });
    });
  });

  describe("CreditUXUtils", () => {
    describe("creditsToEstimatedDays", () => {
      it("should calculate days correctly with default assumptions", () => {
        // 2 credits per conversation × 1.5 conversations per day = 3 credits per day
        expect(CreditUXUtils.creditsToEstimatedDays(3)).toBe(1);
        expect(CreditUXUtils.creditsToEstimatedDays(6)).toBe(2);
        expect(CreditUXUtils.creditsToEstimatedDays(15)).toBe(5);
        expect(CreditUXUtils.creditsToEstimatedDays(30)).toBe(10);
      });

      it("should handle zero credits", () => {
        expect(CreditUXUtils.creditsToEstimatedDays(0)).toBe(0);
      });

      it("should handle fractional results (floor)", () => {
        // 2 credits = 0.67 days → floored to 0 days
        expect(CreditUXUtils.creditsToEstimatedDays(2)).toBe(0);

        // 4 credits = 1.33 days → floored to 1 day
        expect(CreditUXUtils.creditsToEstimatedDays(4)).toBe(1);
      });

      it("should handle large credit amounts", () => {
        expect(CreditUXUtils.creditsToEstimatedDays(300)).toBe(100);
        expect(CreditUXUtils.creditsToEstimatedDays(3000)).toBe(1000);
      });
    });

    describe("creditsToEstimatedWeeks", () => {
      it("should calculate weeks correctly", () => {
        // 21 credits = 7 days = 1 week
        expect(CreditUXUtils.creditsToEstimatedWeeks(21)).toBe(1);

        // 42 credits = 14 days = 2 weeks
        expect(CreditUXUtils.creditsToEstimatedWeeks(42)).toBe(2);

        // 150 credits = 50 days = 7 weeks
        expect(CreditUXUtils.creditsToEstimatedWeeks(150)).toBe(7);
      });

      it("should handle partial weeks (floor)", () => {
        // 18 credits = 6 days = 0 weeks
        expect(CreditUXUtils.creditsToEstimatedWeeks(18)).toBe(0);

        // 30 credits = 10 days = 1 week
        expect(CreditUXUtils.creditsToEstimatedWeeks(30)).toBe(1);
      });

      it("should handle zero credits", () => {
        expect(CreditUXUtils.creditsToEstimatedWeeks(0)).toBe(0);
      });
    });

    describe("isBalanceLow", () => {
      it("should detect low balance (≤ 5 days)", () => {
        // 5 days = 15 credits
        expect(CreditUXUtils.isBalanceLow(15)).toBe(true);
        expect(CreditUXUtils.isBalanceLow(12)).toBe(true);
        expect(CreditUXUtils.isBalanceLow(3)).toBe(true);
        expect(CreditUXUtils.isBalanceLow(0)).toBe(true);
      });

      it("should not flag sufficient balance (> 5 days)", () => {
        // 6 days = 18 credits
        expect(CreditUXUtils.isBalanceLow(18)).toBe(false);
        expect(CreditUXUtils.isBalanceLow(30)).toBe(false);
        expect(CreditUXUtils.isBalanceLow(100)).toBe(false);
      });
    });

    describe("isBalanceCritical", () => {
      it("should detect critical balance (≤ 2 days)", () => {
        // 2 days = 6 credits
        expect(CreditUXUtils.isBalanceCritical(6)).toBe(true);
        expect(CreditUXUtils.isBalanceCritical(3)).toBe(true);
        expect(CreditUXUtils.isBalanceCritical(0)).toBe(true);
      });

      it("should not flag non-critical balance (> 2 days)", () => {
        // 3 days = 9 credits
        expect(CreditUXUtils.isBalanceCritical(9)).toBe(false);
        expect(CreditUXUtils.isBalanceCritical(15)).toBe(false);
        expect(CreditUXUtils.isBalanceCritical(50)).toBe(false);
      });
    });

    describe("getBalanceDisplayText", () => {
      it("should show weeks for 4+ weeks", () => {
        // 28+ weeks = 84+ days = 252+ credits
        const text = CreditUXUtils.getBalanceDisplayText(300);
        expect(text).toContain("weeks of daily conversations");
        expect(text).toContain("300 credits available");
      });

      it("should show weeks for 7+ days but < 4 weeks", () => {
        // 14 days = 2 weeks = 42 credits
        const text = CreditUXUtils.getBalanceDisplayText(42);
        expect(text).toContain("weeks of support");
      });

      it("should show days for 3-6 days", () => {
        // 4 days = 12 credits
        const text = CreditUXUtils.getBalanceDisplayText(12);
        expect(text).toContain("days of conversations");
        expect(text).toContain("4 days");
      });

      it("should show singular day for 1-2 days", () => {
        // 1 day = 3 credits
        const text = CreditUXUtils.getBalanceDisplayText(3);
        expect(text).toContain("day remaining");
        expect(text).not.toContain("days");
      });

      it("should show top-up message for < 1 day", () => {
        const text = CreditUXUtils.getBalanceDisplayText(2);
        expect(text).toContain("time to top up");
        expect(text).toContain("uninterrupted support");
      });

      it("should format credits correctly", () => {
        const text = CreditUXUtils.getBalanceDisplayText(25);
        expect(text).toContain("25 credits available");
      });
    });

    describe("getConsumptionFeedback", () => {
      it("should show credits used and remaining balance", () => {
        const feedback = CreditUXUtils.getConsumptionFeedback(2, 98);
        expect(feedback).toContain("2 credits");
        expect(feedback).toContain("balance: 98 credits");
        expect(feedback).toContain("Today's reflection");
      });

      it("should calculate USD cost correctly", () => {
        const feedback = CreditUXUtils.getConsumptionFeedback(3, 47);
        // 3 credits × $0.05 = $0.15
        expect(feedback).toContain("≈ $0.15");
      });

      it("should handle zero usage", () => {
        const feedback = CreditUXUtils.getConsumptionFeedback(0, 100);
        expect(feedback).toContain("0 credits");
        expect(feedback).toContain("$0.00");
      });

      it("should handle large usage", () => {
        const feedback = CreditUXUtils.getConsumptionFeedback(20, 80);
        expect(feedback).toContain("20 credits");
        expect(feedback).toContain("$1.00");
      });
    });

    describe("getLowBalanceWarning", () => {
      it("should warn for ≤ 1 day", () => {
        const warning = CreditUXUtils.getLowBalanceWarning(2); // 0 days
        expect(warning).toContain("less than a day");
        expect(warning).toContain("Top up now");
      });

      it("should warn for 2-3 days", () => {
        const warning = CreditUXUtils.getLowBalanceWarning(9); // 3 days
        expect(warning).toContain("about 3 days");
        expect(warning).toContain("Top up now");
      });

      it("should warn for > 3 days", () => {
        const warning = CreditUXUtils.getLowBalanceWarning(15); // 5 days
        expect(warning).toContain("about 5 days");
        expect(warning).toContain("Consider topping up soon");
      });

      it("should be consistent with day calculations", () => {
        const credits = 12;
        const days = CreditUXUtils.creditsToEstimatedDays(credits);
        const warning = CreditUXUtils.getLowBalanceWarning(credits);
        expect(warning).toContain(`${days} days`);
      });
    });
  });

  describe("Type definitions", () => {
    it("should export proper TypeScript types", () => {
      // These should compile without errors
      const config: CreditConfigType = CREDIT_CONFIG;
      const roundingMode: RoundingMode = "up";

      expect(config).toBeDefined();
      expect(["up", "nearest", "down"]).toContain(roundingMode);
    });
  });

  describe("Real-world integration scenarios", () => {
    it("should handle typical user journey", () => {
      // User starts with 100 credits
      let balance = 100;
      expect(CreditUXUtils.isBalanceLow(balance)).toBe(false);

      // Has several conversations (8 credits each)
      for (let i = 0; i < 10; i++) {
        const tokensUsed = 1200; // ~1.2 credits, rounded up to 2
        const creditsCharged = CreditUtils.calculateBillableCredits(tokensUsed);
        balance -= creditsCharged;
      }

      // Balance should be reduced correctly
      expect(balance).toBe(80); // 100 - (10 × 2)
      expect(CreditUXUtils.isBalanceLow(balance)).toBe(false);

      // Continue until low balance
      while (!CreditUXUtils.isBalanceLow(balance)) {
        balance -= 2;
      }

      expect(CreditUXUtils.isBalanceLow(balance)).toBe(true);
      const warning = CreditUXUtils.getLowBalanceWarning(balance);
      expect(warning).toContain("balance is getting low");
    });

    it("should handle edge case pricing scenarios", () => {
      // Very small usage (micro-conversation)
      const microTokens = 50; // 0.05 credits
      const microCredits = CreditUtils.calculateBillableCredits(microTokens);
      expect(microCredits).toBe(1); // Minimum charge

      // Exactly 1 credit worth of tokens
      const exactTokens = 1000;
      const exactCredits = CreditUtils.calculateBillableCredits(exactTokens);
      expect(exactCredits).toBe(1);

      // Just over 1 credit
      const slightlyOverTokens = 1001;
      const slightlyOverCredits = CreditUtils.calculateBillableCredits(slightlyOverTokens);
      expect(slightlyOverCredits).toBe(2); // Rounded up
    });

    it("should provide consistent UX messaging", () => {
      const credits = 50;

      // All UX functions should be consistent
      const days = CreditUXUtils.creditsToEstimatedDays(credits);
      const weeks = CreditUXUtils.creditsToEstimatedWeeks(credits);
      const isLow = CreditUXUtils.isBalanceLow(credits);
      const displayText = CreditUXUtils.getBalanceDisplayText(credits);
      const warning = CreditUXUtils.getLowBalanceWarning(credits);

      // Display text should include the credit amount
      expect(displayText).toContain(CreditUtils.formatCreditsForDisplay(credits));

      // Warning should be consistent with low balance detection
      if (isLow) {
        expect(warning).toContain("balance is getting low");
      }

      // Display text should use either weeks or days format consistently
      if (weeks > 0 && days >= 7) {
        // When there are weeks, it should show weeks format
        expect(displayText).toContain(weeks.toString());
      } else if (days > 0) {
        // When less than a week, it should show days format
        expect(displayText).toContain(days.toString());
      }
    });
  });
});
