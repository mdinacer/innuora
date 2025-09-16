/**
 * Simplified Points System
 *
 * Replaces the over-engineered 1600+ line points system with simple credit management
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Simple service costs (in cents)
const SERVICE_COSTS = {
  basic_message: 5, // 5 cents per message
  session_analysis: 25, // 25 cents per analysis
  memory_enhancement: 15, // 15 cents per memory update
  extended_session: 50, // 50 cents for extended session
} as const;

type ServiceType = keyof typeof SERVICE_COSTS;

interface SimplePointsStore {
  balance: number; // Balance in cents
  canAfford: (service: ServiceType) => boolean;
  charge: (service: ServiceType) => boolean;
  getCost: (service: ServiceType) => number;
  addCredits: (amount: number) => void;
}

const useSimplePoints = create<SimplePointsStore>()(
  persist(
    (set, get) => ({
      balance: 1000, // Start with $10.00 worth of credits

      canAfford: (service: ServiceType) => {
        return get().balance >= SERVICE_COSTS[service];
      },

      charge: (service: ServiceType) => {
        const cost = SERVICE_COSTS[service];
        const currentBalance = get().balance;

        if (currentBalance >= cost) {
          set({ balance: currentBalance - cost });
          return true;
        }
        return false;
      },

      getCost: (service: ServiceType) => {
        return SERVICE_COSTS[service];
      },

      addCredits: (amount: number) => {
        set((state) => ({ balance: state.balance + amount }));
      },
    }),
    {
      name: "simple-points-storage",
    }
  )
);

// Hook that matches the existing interface
export function useSessionServices() {
  const { canAfford, charge, getCost } = useSimplePoints();

  return {
    canAffordService: (service: string) => {
      if (service in SERVICE_COSTS) {
        const serviceType = service as ServiceType;
        const cost = getCost(serviceType);
        const canAffordIt = canAfford(serviceType);

        return {
          canAfford: canAffordIt,
          reason: canAffordIt ? null : `Insufficient balance. Need ${cost} cents.`,
          cost: cost,
        };
      }
      return { canAfford: true, reason: null, cost: 0 };
    },

    consumeService: async (service: string, options?: { sessionId?: string } | string) => {
      if (service in SERVICE_COSTS) {
        const serviceType = service as ServiceType;
        const cost = getCost(serviceType);
        const success = charge(serviceType);
        return {
          success,
          cost,
          error: success ? undefined : `Insufficient balance. Need ${cost} cents.`,
        };
      }
      return { success: true, cost: 0 };
    },

    requestSessionAnalysis: async (sessionId?: string) => {
      const cost = getCost("session_analysis");
      const success = charge("session_analysis");
      return {
        success,
        cost,
        error: success ? undefined : "Insufficient balance for session analysis",
      };
    },

    requestMemoryEnhancement: async (sessionId?: string) => {
      const cost = getCost("memory_enhancement");
      const success = charge("memory_enhancement");
      return {
        success,
        cost,
        error: success ? undefined : "Insufficient balance for memory enhancement",
      };
    },

    requestExtendedSession: async (sessionId?: string) => {
      const cost = getCost("extended_session");
      const success = charge("extended_session");
      return {
        success,
        cost,
        error: success ? undefined : "Insufficient balance for extended session",
      };
    },

    getServiceCost: (service: string) => {
      if (service in SERVICE_COSTS) {
        return getCost(service as ServiceType);
      }
      return 0;
    },
  };
}

// Legacy compatibility hook
export function usePoints() {
  const { balance, addCredits, canAfford, getCost } = useSimplePoints();

  return {
    balance,
    addCredits,
    transactions: [], // Simplified - no transaction history
    canAfford: (cost: number) => balance >= cost,
    getBalance: () => balance,
    getBalanceUSD: () => balance / 100, // Convert cents to dollars
    isLoading: false, // Always loaded in simplified version
    canAffordService: (service: string) => {
      if (service in SERVICE_COSTS) {
        return canAfford(service as ServiceType);
      }
      return true;
    },
    getServiceCost: (service: string) => {
      if (service in SERVICE_COSTS) {
        return getCost(service as ServiceType);
      }
      return 0;
    },
    purchasePoints: async (packageId?: string) => ({ success: false, error: "Not implemented" }),
  };
}

// Mock purchase packages hook for UI compatibility
export function usePurchasePackages() {
  const packages: Array<{ id: string; name: string; description: string; isPopular?: boolean }> = []; // No packages in simplified version
  return {
    packages,
    purchasePackage: async () => ({ success: false, error: "Not implemented" }),
    getRecommendedPackage: () => null,
    formatPackageValue: (packageId?: string) => ({ total: "0", bonus: "0", base: "$0.00", price: "$0.00" }),
  };
}

export { useSimplePoints };
