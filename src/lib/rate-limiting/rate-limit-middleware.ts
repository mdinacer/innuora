/* eslint-disable @typescript-eslint/no-use-before-define */
import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { RATE_LIMIT_RULES, rateLimiter } from "./rate-limiter";

// Cache for hashed user agents to avoid repeated hashing
const userAgentHashCache = new Map<string, string>();
const MAX_CACHE_SIZE = 10000; // Prevent memory leaks

interface RateLimitConfig {
  ruleKey: keyof typeof RATE_LIMIT_RULES;
  identifier?: (request: NextRequest) => string;
  skipIf?: (request: NextRequest) => boolean;
  onLimitExceeded?: (request: NextRequest) => NextResponse;
}

export function withRateLimit(config: RateLimitConfig) {
  return function rateLimitMiddleware(handler: (request: NextRequest) => Promise<NextResponse> | NextResponse) {
    return async function (request: NextRequest): Promise<NextResponse> {
      try {
        // Early exit if skip condition is met
        if (config.skipIf?.(request)) {
          return await handler(request);
        }

        const identifier = config.identifier ? config.identifier(request) : getDefaultIdentifier(request);
        const result = rateLimiter.checkLimit(identifier, config.ruleKey);

        let response: NextResponse;

        if (result.success) {
          response = await handler(request);
        } else {
          // Log rate limit exceeded (separate from warnings to avoid noise)
          logger.logSuccess("Rate limit exceeded", {
            userId: identifier,
            operation: "rate_limit_exceeded",
            metadata: {
              ruleKey: config.ruleKey,
              path: request.nextUrl.pathname,
              userAgent: request.headers.get("user-agent")?.substring(0, 100), // Truncate for logs
              remaining: result.remaining,
              resetTime: result.resetTime,
            },
          });

          response = config.onLimitExceeded ? config.onLimitExceeded(request) : createRateLimitResponse(result);
        }

        // Safely set headers (defensive programming)
        setResponseHeaders(response, result);

        return response;
      } catch (error) {
        logger.logWarning("Rate limit middleware error", {
          operation: "rate_limit_middleware",
          metadata: {
            error: error instanceof Error ? error.message : "Unknown error",
            path: request.nextUrl.pathname,
            ruleKey: config.ruleKey,
          },
        });

        // Always allow request to proceed on middleware errors
        return await handler(request);
      }
    };
  };
}

function getDefaultIdentifier(request: NextRequest): string {
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "unknown";
  const userAgentHash = getCachedHash(userAgent);

  return `${ip}:${userAgentHash}`;
}

function getClientIP(request: NextRequest): string {
  // Handle multiple proxy layers and IPv6
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip"); // Cloudflare

  if (forwarded) {
    // Get the first (original) IP from the chain, handle IPv6 brackets
    const firstIp = forwarded.split(",")[0].trim();
    return firstIp.replace(/^\[|\]$/g, ""); // Remove IPv6 brackets if present
  }

  return cfConnectingIp || realIp || "unknown";
}

function getCachedHash(userAgent: string): string {
  // Check cache first
  if (userAgentHashCache.has(userAgent)) {
    return userAgentHashCache.get(userAgent)!;
  }

  // Generate hash using Node.js crypto (more efficient for server-side rate limiting)
  const hash = createHash("sha256").update(userAgent, "utf8").digest("hex").substring(0, 8);

  // Cache management - prevent memory leaks
  if (userAgentHashCache.size >= MAX_CACHE_SIZE) {
    const firstKey = userAgentHashCache.keys().next().value;
    if (firstKey !== undefined) {
      userAgentHashCache.delete(firstKey);
    }
  }

  userAgentHashCache.set(userAgent, hash);
  return hash;
}

function setResponseHeaders(response: NextResponse, result: { total: number; remaining: number; resetTime: number }) {
  try {
    response.headers.set("X-RateLimit-Limit", result.total.toString());
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
    response.headers.set("X-RateLimit-Reset", result.resetTime.toString());
  } catch (error) {
    // Headers might be frozen in some edge cases - fail gracefully
    logger.logWarning("Failed to set rate limit headers", {
      operation: "set_rate_limit_headers",
      metadata: { error: error instanceof Error ? error.message : "Unknown error" },
    });
  }
}

function createRateLimitResponse(result: { remaining: number; resetTime: number }): NextResponse {
  // Defensive time calculation - ensure positive values
  const secondsUntilReset = Math.max(0, Math.ceil((result.resetTime - Date.now()) / 1000));

  const error = new AppError(ERROR_CODES.RATE_LIMIT_EXCEEDED, {
    remaining: result.remaining,
    resetTime: result.resetTime,
    message: `Too many requests. Try again in ${secondsUntilReset} seconds`,
  });

  return NextResponse.json(
    {
      error: error.details.message,
      code: error.errorCode,
      details: {
        ...error.details,
        retryAfter: secondsUntilReset,
      },
    },
    {
      status: 429,
      headers: {
        "Retry-After": secondsUntilReset.toString(),
        "X-RateLimit-Reset-Seconds": secondsUntilReset.toString(),
      },
    }
  );
}

// Simplified identifier functions (remove unnecessary request parameter wrapping)
export const createUserRateLimit = (userId: string) => () => userId;
export const createIPRateLimit = () => getDefaultIdentifier;

// Environment helpers
export const isProductionEnvironment = () => process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = () => process.env.NODE_ENV === "development";

// Cache management utilities
export function clearUserAgentCache(): void {
  userAgentHashCache.clear();
}

export function getUserAgentCacheSize(): number {
  return userAgentHashCache.size;
}
