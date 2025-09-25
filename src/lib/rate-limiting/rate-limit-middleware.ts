/* eslint-disable @typescript-eslint/no-use-before-define */
import { NextRequest, NextResponse } from "next/server";

import { AppError } from "@/lib/errors/app-error";
import { ERROR_CODES } from "@/lib/errors/error-codes";
import { logger } from "@/lib/logging/unified-logger";
import { RATE_LIMIT_RULES, rateLimiter } from "./rate-limiter";

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
        if (config.skipIf && config.skipIf(request)) {
          return await handler(request);
        }

        const identifier = config.identifier ? config.identifier(request) : getDefaultIdentifier(request);

        const result = rateLimiter.checkLimit(identifier, config.ruleKey);

        const response = result.success
          ? await handler(request)
          : config.onLimitExceeded
            ? config.onLimitExceeded(request)
            : createRateLimitResponse(result);

        response.headers.set("X-RateLimit-Limit", result.total.toString());
        response.headers.set("X-RateLimit-Remaining", result.remaining.toString());
        response.headers.set("X-RateLimit-Reset", result.resetTime.toString());

        if (!result.success) {
          logger.logWarning("Rate limit exceeded", {
            userId: identifier,
            operation: "rate_limit_check",
            metadata: {
              ruleKey: config.ruleKey,
              path: request.nextUrl.pathname,
              userAgent: request.headers.get("user-agent"),
              remaining: result.remaining,
              resetTime: result.resetTime,
            },
          });
        }

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

        return await handler(request);
      }
    };
  };
}

function getDefaultIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = forwarded ? forwarded.split(",")[0].trim() : realIp || "unknown";

  const userAgent = request.headers.get("user-agent") || "unknown";
  const userAgentHash = simpleHash(userAgent);

  return `${ip}:${userAgentHash}`;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function createRateLimitResponse(result: { remaining: number; resetTime: number }): NextResponse {
  const error = new AppError(ERROR_CODES.RATE_LIMIT_EXCEEDED, {
    remaining: result.remaining,
    resetTime: result.resetTime,
    message: `Too many requests. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds`,
  });

  return NextResponse.json(
    {
      error: error.details.message,
      code: error.errorCode,
      details: error.details,
    },
    {
      status: 429,
      headers: {
        "Retry-After": Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
      },
    }
  );
}

export function createUserRateLimit(userId: string) {
  return function (request: NextRequest) {
    return userId;
  };
}

export function createIPRateLimit() {
  return function (request: NextRequest) {
    return getDefaultIdentifier(request);
  };
}

export function isProductionEnvironment() {
  return process.env.NODE_ENV === "production";
}

export function isDevelopmentEnvironment() {
  return process.env.NODE_ENV === "development";
}
