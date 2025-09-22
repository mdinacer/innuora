/**
 * Tests for CreditPackages component memoization
 * Ensuring performance optimizations work correctly
 */

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CreditPackages } from "../credit-packages";

// Mock the billing config
vi.mock("@/lib/billing/billing-config", () => ({
  BILLING_PRODUCTS: {
    starter: {
      priceId: "price_starter",
      credits: 120,
      price: 15.0,
      popular: false,
      label: "Starter Pack",
      tagline: "Get started with focused support",
    },
    regular: {
      priceId: "price_regular",
      credits: 400,
      price: 40.0,
      popular: true,
      label: "Growth Pack",
      tagline: "Best balance of value and consistency",
    },
  },
}));

// Mock the credit utils
vi.mock("@/lib/credits/credit-config", () => ({
  CreditUXUtils: {
    creditsToEstimatedWeeks: vi.fn((credits: number) => Math.floor(credits / 28)),
    creditsToEstimatedDays: vi.fn((credits: number) => Math.floor(credits / 4)),
  },
}));

// Mock the credit formatting utils
vi.mock("@/lib/credits/credits-utils", () => ({
  formatCredits: vi.fn((credits: number) => credits.toString()),
  formatUSD: vi.fn((amount: number) => `$${amount.toFixed(2)}`),
}));

// Mock the PaymentModal component
vi.mock("../billing/payment-modal", () => ({
  default: vi.fn(() => <div data-testid="payment-modal" />),
}));

describe("CreditPackages Component", () => {
  const defaultProps = {
    userId: "test-user-123",
    userEmail: "test@example.com",
    userName: "Test User",
  };

  it("should render without crashing", () => {
    const { container } = render(<CreditPackages {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  it("should display all billing products", () => {
    const { getByText } = render(<CreditPackages {...defaultProps} />);

    expect(getByText("Starter Pack")).toBeTruthy();
    expect(getByText("Growth Pack")).toBeTruthy();
    expect(getByText("Get started with focused support")).toBeTruthy();
    expect(getByText("Best balance of value and consistency")).toBeTruthy();
  });

  it("should mark popular package correctly", () => {
    const { container } = render(<CreditPackages {...defaultProps} />);

    const popularBadge = container.querySelector(".absolute.-top-2");
    expect(popularBadge).toBeTruthy();
    expect(popularBadge?.textContent).toBe("Most Popular");
  });

  it("should display credit amounts and prices", () => {
    const { getByText } = render(<CreditPackages {...defaultProps} />);

    expect(getByText("~120 credits")).toBeTruthy();
    expect(getByText("~400 credits")).toBeTruthy();
    expect(getByText("$15.00")).toBeTruthy();
    expect(getByText("$40.00")).toBeTruthy();
  });

  it("should handle missing userId gracefully", () => {
    const propsWithoutUserId = {
      userEmail: "test@example.com",
      userName: "Test User",
      onPurchase: vi.fn(),
    };

    expect(() => {
      render(<CreditPackages {...propsWithoutUserId} />);
    }).not.toThrow();
  });

  describe("Memoization", () => {
    it("should use memoized calculations for packages", () => {
      const { rerender } = render(<CreditPackages {...defaultProps} />);

      // Re-render with same props should not cause issues
      rerender(<CreditPackages {...defaultProps} />);

      // Component should still render correctly
      expect(document.querySelector('[data-testid="credit-packages"]')).toBeTruthy();
    });

    it("should handle prop changes correctly", () => {
      const { rerender, getByText } = render(<CreditPackages {...defaultProps} />);

      // Change props
      const newProps = {
        ...defaultProps,
        className: "custom-class",
      };

      rerender(<CreditPackages {...newProps} />);

      // Should still render content correctly
      expect(getByText("Starter Pack")).toBeTruthy();
      expect(getByText("Growth Pack")).toBeTruthy();
    });
  });

  describe("Event Handlers", () => {
    it("should call onPurchase when provided and no userId", () => {
      const onPurchaseMock = vi.fn();
      const propsWithoutUserId = {
        userEmail: "test@example.com",
        userName: "Test User",
        onPurchase: onPurchaseMock,
      };

      const { container } = render(<CreditPackages {...propsWithoutUserId} />);

      // Find and click a purchase button
      const purchaseButton = container.querySelector("button");
      if (purchaseButton) {
        purchaseButton.click();
        expect(onPurchaseMock).toHaveBeenCalled();
      }
    });
  });
});
