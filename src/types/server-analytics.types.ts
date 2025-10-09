/**
 * Server-Only Analytics Types
 *
 * This data is NEVER sent to the client - stored only in database
 * for billing verification, debugging, and business intelligence.
 */

import { z } from "zod";

/**
 * Detailed token usage breakdown for a single AI operation
 */
export interface TokenUsageRecord {
  /** Type of operation that consumed tokens */
  operation:
    | "analysis" // User input analysis
    | "response" // AI response generation
    | "memory_update" // Session memory consolidation
    | "memory_recall" // Memory retrieval
    | "session_wellness" // Session wellness check
    | "session_summary" // Session summary generation
    | "title_update" // Auto title update
    | "diagnostic"; // Diagnostic report generation

  /** Associated message ID (if applicable) */
  messageId?: string;

  /** Model used for this operation */
  model: string;

  /** Input/prompt tokens consumed */
  inputTokens: number;

  /** Output/completion tokens consumed */
  outputTokens: number;

  /** Total tokens for this operation */
  totalTokens: number;

  /** Credits charged to user for this operation */
  creditsCharged: number;

  /** Raw USD cost from AI provider */
  rawCostUSD: number;

  /** Timestamp of operation */
  timestamp: string;

  /** Additional context (optional) */
  metadata?: {
    /** Was this a retry? */
    isRetry?: boolean;
    /** Analysis value (for analysis operations) */
    analysisValue?: "low" | "medium" | "high";
    /** Was lightweight response used? */
    isLightweight?: boolean;
    /** Any other relevant context */
    [key: string]: any;
  };
}

/**
 * Aggregated metrics per operation type
 */
export interface OperationMetrics {
  /** Total operations of this type */
  count: number;

  /** Total tokens consumed */
  totalTokens: number;

  /** Total credits charged */
  totalCredits: number;

  /** Total raw API cost */
  totalCostUSD: number;

  /** Average tokens per operation */
  avgTokens: number;

  /** Average credits per operation */
  avgCredits: number;
}

/**
 * Complete server analytics for a session
 */
export interface ServerAnalytics {
  /** Detailed breakdown of every AI operation */
  tokenUsageBreakdown: TokenUsageRecord[];

  /** Aggregated metrics by operation type */
  operationMetrics: {
    analysis?: OperationMetrics;
    response?: OperationMetrics;
    memory_update?: OperationMetrics;
    memory_recall?: OperationMetrics;
    session_wellness?: OperationMetrics;
    session_summary?: OperationMetrics;
    title_update?: OperationMetrics;
    diagnostic?: OperationMetrics;
  };

  /** Total session statistics */
  totals: {
    /** Total AI operations performed */
    totalOperations: number;

    /** Total tokens consumed across all operations */
    totalTokens: number;

    /** Total credits charged */
    totalCreditsCharged: number;

    /** Total raw API cost */
    totalRawCostUSD: number;

    /** Revenue (credits charged in USD) */
    revenueUSD: number;

    /** Profit margin (revenue - raw cost) */
    profitUSD: number;

    /** Effective markup multiplier */
    effectiveMarkup: number;
  };

  /** Validation flags */
  validation: {
    /** Does sum of breakdown match session totals? */
    breakdownMatchesTotals: boolean;

    /** Any operations missing from breakdown? */
    hasMissingOperations: boolean;

    /** Last validation timestamp */
    lastValidated: string;
  };
}

/**
 * Zod Schemas for JSON serialization validation
 */

const TokenUsageRecordSchema = z.object({
  operation: z.enum([
    "analysis",
    "response",
    "memory_update",
    "memory_recall",
    "session_wellness",
    "session_summary",
    "title_update",
    "diagnostic",
  ]),
  messageId: z.string().optional(),
  model: z.string(),
  inputTokens: z.number(),
  outputTokens: z.number(),
  totalTokens: z.number(),
  creditsCharged: z.number(),
  rawCostUSD: z.number(),
  timestamp: z.string(),
  metadata: z
    .object({
      isRetry: z.boolean().optional(),
      analysisValue: z.enum(["low", "medium", "high"]).optional(),
      isLightweight: z.boolean().optional(),
    })
    .catchall(z.any())
    .optional(),
});

const OperationMetricsSchema = z.object({
  count: z.number(),
  totalTokens: z.number(),
  totalCredits: z.number(),
  totalCostUSD: z.number(),
  avgTokens: z.number(),
  avgCredits: z.number(),
});

export const ServerAnalyticsSchema = z.object({
  tokenUsageBreakdown: z.array(TokenUsageRecordSchema),
  operationMetrics: z.object({
    analysis: OperationMetricsSchema.optional(),
    response: OperationMetricsSchema.optional(),
    memory_update: OperationMetricsSchema.optional(),
    memory_recall: OperationMetricsSchema.optional(),
    session_wellness: OperationMetricsSchema.optional(),
    session_summary: OperationMetricsSchema.optional(),
    title_update: OperationMetricsSchema.optional(),
    diagnostic: OperationMetricsSchema.optional(),
  }),
  totals: z.object({
    totalOperations: z.number(),
    totalTokens: z.number(),
    totalCreditsCharged: z.number(),
    totalRawCostUSD: z.number(),
    revenueUSD: z.number(),
    profitUSD: z.number(),
    effectiveMarkup: z.number(),
  }),
  validation: z.object({
    breakdownMatchesTotals: z.boolean(),
    hasMissingOperations: z.boolean(),
    lastValidated: z.string(),
  }),
});

/**
 * Utility functions for server analytics
 */
export class ServerAnalyticsUtils {
  /**
   * Add a token usage record to server analytics
   */
  static addTokenUsage(currentAnalytics: ServerAnalytics | null, record: TokenUsageRecord): ServerAnalytics {
    const analytics = currentAnalytics || ServerAnalyticsUtils.createEmpty();

    // Add to breakdown
    analytics.tokenUsageBreakdown.push(record);

    // Update operation metrics
    const opType = record.operation;
    if (!analytics.operationMetrics[opType]) {
      analytics.operationMetrics[opType] = {
        count: 0,
        totalTokens: 0,
        totalCredits: 0,
        totalCostUSD: 0,
        avgTokens: 0,
        avgCredits: 0,
      };
    }

    const metrics = analytics.operationMetrics[opType]!;
    metrics.count++;
    metrics.totalTokens += record.totalTokens;
    metrics.totalCredits += record.creditsCharged;
    metrics.totalCostUSD += record.rawCostUSD;
    metrics.avgTokens = metrics.totalTokens / metrics.count;
    metrics.avgCredits = metrics.totalCredits / metrics.count;

    // Update totals
    analytics.totals.totalOperations++;
    analytics.totals.totalTokens += record.totalTokens;
    analytics.totals.totalCreditsCharged += record.creditsCharged;
    analytics.totals.totalRawCostUSD += record.rawCostUSD;

    // Calculate revenue and profit (assuming $0.005 per credit)
    const CREDIT_UNIT_USD = 0.005;
    analytics.totals.revenueUSD = analytics.totals.totalCreditsCharged * CREDIT_UNIT_USD;
    analytics.totals.profitUSD = analytics.totals.revenueUSD - analytics.totals.totalRawCostUSD;
    analytics.totals.effectiveMarkup =
      analytics.totals.totalRawCostUSD > 0 ? analytics.totals.revenueUSD / analytics.totals.totalRawCostUSD : 0;

    // Update validation
    analytics.validation.lastValidated = new Date().toISOString();

    return analytics;
  }

  /**
   * Create empty server analytics
   */
  static createEmpty(): ServerAnalytics {
    return {
      tokenUsageBreakdown: [],
      operationMetrics: {},
      totals: {
        totalOperations: 0,
        totalTokens: 0,
        totalCreditsCharged: 0,
        totalRawCostUSD: 0,
        revenueUSD: 0,
        profitUSD: 0,
        effectiveMarkup: 0,
      },
      validation: {
        breakdownMatchesTotals: true,
        hasMissingOperations: false,
        lastValidated: new Date().toISOString(),
      },
    };
  }

  /**
   * Validate server analytics integrity
   */
  static validate(
    analytics: ServerAnalytics,
    sessionTotalTokens: number,
    sessionTotalCredits: number
  ): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check if breakdown matches totals
    const breakdownTokens = analytics.tokenUsageBreakdown.reduce((sum, r) => sum + r.totalTokens, 0);
    const breakdownCredits = analytics.tokenUsageBreakdown.reduce((sum, r) => sum + r.creditsCharged, 0);

    if (breakdownTokens !== sessionTotalTokens) {
      issues.push(
        `Token mismatch: breakdown=${breakdownTokens}, session=${sessionTotalTokens}, diff=${sessionTotalTokens - breakdownTokens}`
      );
    }

    if (breakdownCredits !== sessionTotalCredits) {
      issues.push(
        `Credit mismatch: breakdown=${breakdownCredits}, session=${sessionTotalCredits}, diff=${sessionTotalCredits - breakdownCredits}`
      );
    }

    // Check for missing operations
    if (analytics.tokenUsageBreakdown.length === 0 && sessionTotalTokens > 0) {
      issues.push("No token usage records but session has tokens consumed");
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  /**
   * Generate summary report for debugging
   */
  static generateReport(analytics: ServerAnalytics): string {
    const lines: string[] = [];

    lines.push("=== SERVER ANALYTICS REPORT ===");
    lines.push("");
    lines.push("TOTALS:");
    lines.push(`  Operations: ${analytics.totals.totalOperations}`);
    lines.push(`  Tokens: ${analytics.totals.totalTokens.toLocaleString()}`);
    lines.push(`  Credits: ${analytics.totals.totalCreditsCharged}`);
    lines.push(`  Revenue: $${analytics.totals.revenueUSD.toFixed(2)}`);
    lines.push(`  Profit: $${analytics.totals.profitUSD.toFixed(2)}`);
    lines.push(`  Markup: ${analytics.totals.effectiveMarkup.toFixed(2)}x`);
    lines.push("");

    lines.push("BY OPERATION:");
    Object.entries(analytics.operationMetrics).forEach(([op, metrics]) => {
      lines.push(`  ${op}:`);
      lines.push(`    Count: ${metrics.count}`);
      lines.push(`    Tokens: ${metrics.totalTokens.toLocaleString()} (avg: ${Math.round(metrics.avgTokens)})`);
      lines.push(`    Credits: ${metrics.totalCredits} (avg: ${metrics.avgCredits.toFixed(2)})`);
    });

    return lines.join("\n");
  }
}
