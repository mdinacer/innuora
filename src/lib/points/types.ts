import { PointsTransactionType } from "@prisma/client";

/**
 * Consumption-Based Points System Types
 *
 * For purchasing AI services and tracking usage costs
 */

export type ServiceType =
  | "basic_message"
  | "session_analysis"
  | "advanced_insights"
  | "memory_enhancement"
  | "custom_prompts"
  | "data_export"
  | "priority_support"
  | "extended_session"
  | "therapeutic_assessment";

export interface ServiceCost {
  id: string;
  type: ServiceType;
  name: string;
  description: string;
  costPerUnit: number; // Cost in cents (e.g., 25 = $0.25)
  unit: string; // "per session", "per export", "per analysis", etc.
  category: "core" | "premium" | "utility";
  isActive: boolean;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  type: PointsTransactionType;
  amount: number; // Amount in cents
  reason: string | null;
  serviceType?: ServiceType;
  meta?: {
    sessionId?: string;
    purchaseId?: string;
    packageSize?: number;
    originalAmount?: number;
    [key: string]: any;
  };
  createdAt: Date;
}

export interface UserPointsData {
  balance: number; // Balance in cents
  totalPurchased: number; // Total purchased in cents
  totalSpent: number; // Total spent in cents
  history: PointsTransaction[];
}

export interface PurchasePackage {
  id: string;
  name: string;
  description: string;
  amount: number; // Amount in cents
  bonus: number; // Bonus percentage (e.g., 10 = 10% extra)
  priceUSD: number; // Price in USD
  isPopular?: boolean;
  isActive: boolean;
}

export interface ServiceUsageResult {
  success: boolean;
  cost: number;
  remainingBalance: number;
  error?: string;
  transactionId?: string;
}

export interface PurchaseResult {
  success: boolean;
  amount: number;
  bonus: number;
  newBalance: number;
  error?: string;
  transactionId?: string;
}

export interface PointsConfig {
  services: ServiceCost[];
  packages: PurchasePackage[];
  starterBonus: number; // Default starter amount in cents
}
