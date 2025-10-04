interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  total: number;
}

export class MemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly rules: Record<string, RateLimitRule>;

  constructor(rules: Record<string, RateLimitRule>) {
    this.rules = rules;
    this.startCleanupTimer();
  }

  public checkLimit(identifier: string, ruleKey: string): RateLimitResult {
    const rule = this.rules[ruleKey];
    if (!rule) {
      throw new Error(`Rate limit rule '${ruleKey}' not found`);
    }

    const key = `${ruleKey}:${identifier}`;
    const now = Date.now();
    const windowStart = Math.floor(now / rule.windowMs) * rule.windowMs;

    let entry = this.store.get(key);

    if (!entry || entry.windowStart < windowStart) {
      entry = { count: 0, windowStart };
      this.store.set(key, entry);
    }

    const remaining = Math.max(0, rule.maxRequests - entry.count);
    const resetTime = windowStart + rule.windowMs;

    if (entry.count >= rule.maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetTime,
        total: rule.maxRequests,
      };
    }

    entry.count++;
    this.store.set(key, entry);

    return {
      success: true,
      remaining: remaining - 1,
      resetTime,
      total: rule.maxRequests,
    };
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of Array.from(this.store.entries())) {
        const ruleKey = key.split(":")[0];
        const rule = this.rules[ruleKey];

        if (rule && now - entry.windowStart > rule.windowMs * 2) {
          this.store.delete(key);
        }
      }
    }, 60000);
  }

  public getRemainingRequests(identifier: string, ruleKey: string): number {
    const rule = this.rules[ruleKey];
    if (!rule) return 0;

    const key = `${ruleKey}:${identifier}`;
    const entry = this.store.get(key);

    if (!entry) return rule.maxRequests;

    const now = Date.now();
    const windowStart = Math.floor(now / rule.windowMs) * rule.windowMs;

    if (entry.windowStart < windowStart) {
      return rule.maxRequests;
    }

    return Math.max(0, rule.maxRequests - entry.count);
  }
}

export const RATE_LIMIT_RULES = {
  AI_REQUESTS: {
    windowMs: 60 * 1000,
    maxRequests: 30,
  },
  AI_BURST: {
    windowMs: 10 * 1000,
    maxRequests: 5,
  },
  CREDIT_PURCHASE: {
    windowMs: 60 * 1000,
    maxRequests: 3,
  },
  SESSION_CREATION: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
  AUTH_ATTEMPTS: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },
  GENERAL_API: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },
  WEBHOOK_REQUESTS: {
    windowMs: 60 * 1000, // 1 minute window
    maxRequests: 100, // Allow up to 100 webhook requests per minute
  },
} as const;

export const rateLimiter = new MemoryRateLimiter(RATE_LIMIT_RULES);
