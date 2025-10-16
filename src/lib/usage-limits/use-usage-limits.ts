/**
 * React Hook for Usage Limits
 *
 * Automatically adapts to the configured limit mode.
 * Use this hook in any component that needs to check or display usage limits.
 */

import { useCallback, useEffect, useState } from "react";

import { SUBSCRIPTION_TIERS, USAGE_LIMITS_CONFIG, UsageLimitUtils } from "./usage-limits-config";
import { checkCurrentSessionLimit, checkUsageLimit, getUserSubscriptionTier } from "./usage-tracker";
import type { SessionUsageInfo, UsageStatus } from "./usage-tracker";

// =========================
// Hook: Usage Limit Check
// =========================

export interface UseUsageLimitResult {
  // Current status
  status: UsageStatus | null;
  loading: boolean;
  error: Error | null;

  // Limit info
  limitMode: string;
  canProceed: boolean;
  warningMessage: string | null;
  usageDisplay: string;

  // Actions
  refresh: () => Promise<void>;
}

/**
 * Check if user can start a new conversation
 */
export function useUsageLimit(userId: string | undefined): UseUsageLimitResult {
  const [status, setStatus] = useState<UsageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const checkLimit = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user's subscription tier
      const tier = await getUserSubscriptionTier(userId);

      // Check usage limit
      const result = await checkUsageLimit(userId, tier);
      setStatus(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      // Fail open - allow usage
      setStatus({
        canProceed: true,
        used: 0,
        limit: 0,
        remaining: 0,
        percentage: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    checkLimit();
  }, [checkLimit]);

  const limitMode = UsageLimitUtils.getLimitMode();
  const canProceed = status?.canProceed ?? true;
  const warningMessage = status?.warningMessage ?? null;
  const usageDisplay = status ? UsageLimitUtils.formatRemainingUsage(status.used, status.limit) : "";

  return {
    status,
    loading,
    error,
    limitMode,
    canProceed,
    warningMessage,
    usageDisplay,
    refresh: checkLimit,
  };
}

// =========================
// Hook: Session Usage Check
// =========================

export interface UseSessionUsageResult {
  sessionInfo: SessionUsageInfo | null;
  loading: boolean;
  error: Error | null;
  shouldEndSession: boolean;
  progressPercentage: number;
  refresh: () => void;
}

/**
 * Check current session usage (for session-based mode)
 */
export function useSessionUsage(
  sessionId: string | undefined,
  messageCount: number,
  tokenCount: number
): UseSessionUsageResult {
  const [sessionInfo, setSessionInfo] = useState<SessionUsageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const checkSession = useCallback(async () => {
    if (!sessionId || UsageLimitUtils.getLimitMode() !== "session") {
      setSessionInfo(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const info = await checkCurrentSessionLimit(sessionId, messageCount, tokenCount);
      setSessionInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [sessionId, messageCount, tokenCount]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const maxMessages = USAGE_LIMITS_CONFIG.sessionLimits.maxMessagesPerSession;
  const progressPercentage = maxMessages > 0 ? (messageCount / maxMessages) * 100 : 0;

  return {
    sessionInfo,
    loading,
    error,
    shouldEndSession: sessionInfo?.sessionLimitReached ?? false,
    progressPercentage,
    refresh: checkSession,
  };
}

// =========================
// Hook: Subscription Tier Info
// =========================

export interface UseSubscriptionTierResult {
  tier: string;
  tierInfo: (typeof SUBSCRIPTION_TIERS)[keyof typeof SUBSCRIPTION_TIERS] | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Get user's current subscription tier and info
 */
export function useSubscriptionTier(userId: string | undefined): UseSubscriptionTierResult {
  const [tier, setTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTier = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userTier = await getUserSubscriptionTier(userId);
      setTier(userTier);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setTier("free"); // Fallback to free
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTier();
  }, [fetchTier]);

  const tierInfo = SUBSCRIPTION_TIERS[tier] || null;

  return {
    tier,
    tierInfo,
    loading,
    error,
    refresh: fetchTier,
  };
}

// =========================
// Utility Hooks
// =========================

/**
 * Get formatted display text for current limit mode
 */
export function useUsageDisplayText() {
  const mode = UsageLimitUtils.getLimitMode();

  const getUnitName = (plural: boolean = false): string => {
    switch (mode) {
      case "session":
        return plural ? "sessions" : "session";
      case "message":
        return plural ? "messages" : "message";
      case "credit":
        return plural ? "credits" : "credit";
      default:
        return "";
    }
  };

  const getLimitDescription = (): string => {
    switch (mode) {
      case "session":
        return "therapy sessions per month";
      case "message":
        return "messages per month";
      case "credit":
        return "credits";
      default:
        return "usage";
    }
  };

  return {
    mode,
    getUnitName,
    getLimitDescription,
  };
}
