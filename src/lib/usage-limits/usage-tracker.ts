/**
 * Flexible Usage Tracker
 *
 * Automatically adapts to the configured limit mode (session/message/credit).
 * All tracking logic is centralized here - no hardcoded limits in components.
 */

/* eslint-disable @typescript-eslint/no-use-before-define */
import { logger } from "@/lib/logging/unified-logger";
import { prisma } from "@/lib/prisma";
import { USAGE_LIMITS_CONFIG, UsageLimitUtils } from "./usage-limits-config";

// =========================
// Usage Tracking Types
// =========================

export interface UsageStatus {
  canProceed: boolean;
  reason?: string;
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  warningMessage?: string;
}

export interface SessionUsageInfo {
  messagesInCurrentSession: number;
  tokensInCurrentSession: number;
  sessionLimitReached: boolean;
  sessionEndMessage?: string;
}

// =========================
// Core Usage Checking
// =========================

/**
 * Check if user can start a new conversation
 * Adapts to current limit mode automatically
 */
export async function checkUsageLimit(userId: string, userTier: string = "free"): Promise<UsageStatus> {
  const mode = UsageLimitUtils.getLimitMode();
  const tierLimits = UsageLimitUtils.getTierLimits(userTier);

  if (!tierLimits) {
    throw new Error(`Invalid subscription tier: ${userTier}`);
  }

  // Unlimited mode - always allow
  if (mode === "unlimited" || tierLimits.type === "unlimited") {
    return {
      canProceed: true,
      used: 0,
      limit: Infinity,
      remaining: Infinity,
      percentage: 0,
    };
  }

  try {
    switch (mode) {
      case "session":
        return await checkSessionLimit(userId, tierLimits.limit);

      case "message":
        return await checkMessageLimit(userId, tierLimits.limit);

      case "credit":
        return await checkCreditLimit(userId, tierLimits.limit);

      default:
        throw new Error(`Unknown limit mode: ${mode}`);
    }
  } catch (error) {
    logger.logWarning("Failed to check usage limit", {
      operation: "check_usage_limit",
      userId,
      metadata: {
        mode,
        userTier,
        error: error instanceof Error ? error.message : String(error),
      },
    });

    // Fail open - allow usage to prevent blocking users due to tracking errors
    return {
      canProceed: true,
      used: 0,
      limit: tierLimits.limit,
      remaining: tierLimits.limit,
      percentage: 0,
    };
  }
}

// =========================
// Session-Based Tracking
// =========================

async function checkSessionLimit(userId: string, monthlyLimit: number): Promise<UsageStatus> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Count sessions this month
  const sessionCount = await prisma.session.count({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  const remaining = Math.max(0, monthlyLimit - sessionCount);
  const percentage = monthlyLimit > 0 ? (sessionCount / monthlyLimit) * 100 : 0;
  const canProceed = sessionCount < monthlyLimit;

  let warningMessage: string | undefined;
  if (!canProceed) {
    warningMessage = UsageLimitUtils.getLimitExceededMessage();
  } else if (UsageLimitUtils.isApproachingLimit(sessionCount, monthlyLimit)) {
    warningMessage = UsageLimitUtils.getWarningMessage(sessionCount, monthlyLimit);
  }

  return {
    canProceed,
    reason: canProceed ? undefined : "Monthly session limit reached",
    used: sessionCount,
    limit: monthlyLimit,
    remaining,
    percentage,
    warningMessage,
  };
}

/**
 * Check if current session has exceeded per-session limits
 */
export async function checkCurrentSessionLimit(
  sessionId: string,
  messageCount: number,
  tokenCount: number
): Promise<SessionUsageInfo> {
  const config = USAGE_LIMITS_CONFIG.sessionLimits;

  const messagesExceeded = messageCount >= config.maxMessagesPerSession;
  const tokensExceeded = tokenCount >= config.maxTokensPerSession;
  const limitReached = messagesExceeded || tokensExceeded;

  return {
    messagesInCurrentSession: messageCount,
    tokensInCurrentSession: tokenCount,
    sessionLimitReached: limitReached,
    sessionEndMessage: limitReached ? config.sessionEndMessage : undefined,
  };
}

// =========================
// Message-Based Tracking
// =========================

async function checkMessageLimit(userId: string, monthlyLimit: number): Promise<UsageStatus> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Get all sessions this month and sum their message counts from metadata
  const sessions = await prisma.session.findMany({
    where: {
      userId,
      createdAt: {
        gte: startOfMonth,
      },
    },
    select: {
      metadata: true,
    },
  });

  // Sum message counts from session metadata
  const messageCount = sessions.reduce((total, session) => {
    const metadata = session.metadata as { messageCount?: number };
    return total + (metadata.messageCount || 0);
  }, 0);

  const remaining = Math.max(0, monthlyLimit - messageCount);
  const percentage = monthlyLimit > 0 ? (messageCount / monthlyLimit) * 100 : 0;
  const canProceed = messageCount < monthlyLimit;

  let warningMessage: string | undefined;
  if (!canProceed) {
    warningMessage = UsageLimitUtils.getLimitExceededMessage();
  } else if (UsageLimitUtils.isApproachingLimit(messageCount, monthlyLimit)) {
    warningMessage = UsageLimitUtils.getWarningMessage(messageCount, monthlyLimit);
  }

  return {
    canProceed,
    reason: canProceed ? undefined : "Monthly message limit reached",
    used: messageCount,
    limit: monthlyLimit,
    remaining,
    percentage,
    warningMessage,
  };
}

// =========================
// Credit-Based Tracking
// =========================

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function checkCreditLimit(userId: string, _monthlyAllocation: number): Promise<UsageStatus> {
  // Get user's current credit balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { creditsBalance: true },
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  const balance = user.creditsBalance || 0;
  const minimumRequired = USAGE_LIMITS_CONFIG.creditLimits.minimumToStart;
  const canProceed = balance >= minimumRequired;

  let warningMessage: string | undefined;
  if (!canProceed) {
    warningMessage = UsageLimitUtils.getLimitExceededMessage();
  } else if (balance <= USAGE_LIMITS_CONFIG.creditLimits.criticalThreshold) {
    warningMessage = `Critical: Only ${balance} credits remaining. Top up now to avoid interruption.`;
  } else if (balance <= USAGE_LIMITS_CONFIG.creditLimits.warningThreshold) {
    warningMessage = `Low balance: ${balance} credits remaining. Consider topping up soon.`;
  }

  return {
    canProceed,
    reason: canProceed ? undefined : `Insufficient credits. Minimum ${minimumRequired} required.`,
    used: 0, // Not applicable for credit mode
    limit: balance, // Current balance IS the limit
    remaining: balance,
    percentage: 0,
    warningMessage,
  };
}

// =========================
// Usage Increment Functions
// =========================

/**
 * Record usage after successful operation
 * Adapts to current mode automatically
 */
export async function recordUsage(
  userId: string,
  operation: {
    sessionId?: string;
    messageId?: string;
    tokensUsed?: number;
    creditsUsed?: number;
  }
): Promise<void> {
  const mode = UsageLimitUtils.getLimitMode();

  try {
    switch (mode) {
      case "session":
        // Sessions are auto-tracked via Prisma on session creation
        // No additional tracking needed
        break;

      case "message":
        // Messages are auto-tracked via Prisma on message creation
        // No additional tracking needed
        break;

      case "credit":
        // Credits are deducted in real-time via credit-actions.ts
        // No additional tracking needed
        break;

      case "unlimited":
        // No tracking needed
        break;
    }

    logger.logInfo("Usage recorded", {
      operation: "record_usage",
      userId,
      metadata: {
        mode,
        ...operation,
      },
    });
  } catch (error) {
    logger.logWarning("Failed to record usage (non-blocking)", {
      operation: "record_usage_failed",
      userId,
      metadata: {
        error: error instanceof Error ? error.message : String(error),
        ...operation,
      },
    });
  }
}

// =========================
// Utility Functions
// =========================

/**
 * Get user's subscription tier (with fallback to free)
 */
export async function getUserSubscriptionTier(userId: string): Promise<string> {
  // TODO: Implement actual subscription tier lookup from database
  // For now, return free tier
  // This should query the Subscription table and return the active tier

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ["active", "trialing"],
      },
    },
    select: {
      planId: true,
    },
  });

  return subscription?.planId || "free";
}

/**
 * Reset monthly usage (called by cron job on 1st of month)
 */
export async function resetMonthlyUsage(): Promise<void> {
  const mode = UsageLimitUtils.getLimitMode();

  logger.logInfo("Starting monthly usage reset", {
    operation: "reset_monthly_usage",
    metadata: { mode },
  });

  // For session and message modes, nothing to reset
  // Usage is calculated dynamically based on createdAt dates

  // For credit mode with monthly allocations:
  if (mode === "credit") {
    // TODO: Grant monthly credit allocations to active subscribers
    logger.logInfo("Monthly credit allocation would happen here", {
      operation: "reset_monthly_usage_credits",
    });
  }

  logger.logInfo("Monthly usage reset completed", {
    operation: "reset_monthly_usage_complete",
  });
}
