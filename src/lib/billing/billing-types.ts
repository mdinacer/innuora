/**
 * Billing Action Types
 *
 * Shared types for billing operations across the application
 */

export interface CreatePaymentIntentResult {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
  errorCode?: string;
}

export interface ProcessPaymentResult {
  success: boolean;
  creditsAdded?: number;
  newBalance?: number;
  transactionId?: string;
  error?: string;
  errorCode?: string;
}

export interface RefundPaymentResult {
  success: boolean;
  refundId?: string;
  creditsDeducted?: number;
  error?: string;
  errorCode?: string;
}

export interface PaymentStatusResult {
  success: boolean;
  status?: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, string>;
  error?: string;
  errorCode?: string;
}

export interface PurchaseHistoryResult {
  success: boolean;
  purchases?: Array<{
    id: string;
    amount: number;
    credits: number;
    status: string;
    createdAt: Date;
    metadata?: Record<string, any>;
  }>;
  error?: string;
  errorCode?: string;
}
