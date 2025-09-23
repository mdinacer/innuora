# Rate Limiting Implementation

This module provides comprehensive rate limiting functionality to prevent API abuse and ensure fair usage of the Innuora platform.

## Features

- **Memory-based Rate Limiter**: In-memory storage for development and small deployments
- **Multiple Rate Limit Rules**: Different limits for different types of operations
- **User-specific Limits**: Rate limiting based on user ID
- **Window-based Limiting**: Fixed time windows with automatic reset
- **Comprehensive Error Handling**: Detailed error messages with retry information

## Rate Limit Rules

### AI Operations

- **AI_BURST**: 5 requests per 10 seconds (prevents rapid-fire abuse)
- **AI_REQUESTS**: 30 requests per minute (general AI usage limit)

### Security Operations

- **AUTH_ATTEMPTS**: 5 attempts per 15 minutes (login security)

### Financial Operations

- **CREDIT_PURCHASE**: 3 purchases per minute (prevents accidental multiple purchases)

### General Operations

- **SESSION_CREATION**: 10 sessions per minute
- **GENERAL_API**: 100 requests per minute (catch-all for other APIs)

## Usage

### Basic Rate Limiting

```typescript
import { rateLimiter } from "@/lib/rate-limiting/rate-limiter";

// Check if user can make a request
const result = rateLimiter.checkLimit("user123", "AI_REQUESTS");

if (!result.success) {
  throw new Error(`Rate limited. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds`);
}

// Proceed with operation
```

### AI Client Actions Integration

The AI client actions now support rate limiting:

```typescript
import { SendPromptsToAi } from "@/app/actions/ai-client-actions";

// Rate limiting applied automatically when userId provided
const response = await SendPromptsToAi(prompts, model, options, userId);
```

### HTTP Middleware (for API routes)

```typescript
import { createUserRateLimit, withRateLimit } from "@/lib/rate-limiting/rate-limit-middleware";

const rateLimitedHandler = withRateLimit({
  ruleKey: "AI_REQUESTS",
  identifier: createUserRateLimit(userId),
})(originalHandler);
```

## Architecture

### MemoryRateLimiter

The core rate limiter uses a sliding window approach:

1. **Window Calculation**: `Math.floor(now / windowMs) * windowMs`
2. **Counter Storage**: In-memory Map with automatic cleanup
3. **Thread Safety**: Single-threaded Node.js environment (no locks needed)

### Error Handling

Rate limit errors include:

- `remaining`: Number of requests left in current window
- `resetTime`: Timestamp when the window resets
- `total`: Total requests allowed in window

### Integration Points

1. **AI Actions**: Integrated directly into `SendPromptsToAi`
2. **Error Codes**: `RATE_LIMIT_EXCEEDED` with translations
3. **Logging**: Automatic logging of rate limit violations

## Production Considerations

### Scaling Beyond Memory

For production deployments with multiple servers, consider:

1. **Redis-based Rate Limiter**: Replace MemoryRateLimiter with Redis backend
2. **Database Rate Limiting**: Store counters in PostgreSQL
3. **External Services**: Use services like Upstash, Redis Cloud, or API Gateway rate limiting

### Example Redis Implementation

```typescript
import Redis from "ioredis";

class RedisRateLimiter {
  private redis: Redis;

  async checkLimit(identifier: string, ruleKey: string): Promise<RateLimitResult> {
    const key = `${ruleKey}:${identifier}`;
    const rule = this.rules[ruleKey];

    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, Math.ceil(rule.windowMs / 1000));
    }

    return {
      success: current <= rule.maxRequests,
      remaining: Math.max(0, rule.maxRequests - current),
      resetTime: Date.now() + rule.windowMs,
      total: rule.maxRequests,
    };
  }
}
```

### Monitoring and Alerting

Monitor these metrics:

- Rate limit violations by user
- Rate limit violations by endpoint
- Average requests per user per window
- Rate limit effectiveness (blocked vs allowed requests)

## Testing

Comprehensive test suite covers:

- Basic rate limiting functionality
- Window boundary conditions
- Multi-user isolation
- Production abuse scenarios
- Error handling and recovery

Run tests:

```bash
pnpm test src/lib/rate-limiting
```

## Security Benefits

1. **DoS Prevention**: Prevents users from overwhelming the system
2. **Cost Control**: Limits expensive AI API calls per user
3. **Fair Usage**: Ensures all users get fair access to resources
4. **Fraud Prevention**: Limits rapid payment attempts
5. **Brute Force Protection**: Limits authentication attempts

## Performance Impact

- **Memory Usage**: ~1KB per active user per rule
- **CPU Overhead**: ~0.1ms per rate limit check
- **Cleanup**: Automatic cleanup every 60 seconds removes stale entries

## Configuration

Rate limits can be adjusted in `RATE_LIMIT_RULES`:

```typescript
export const RATE_LIMIT_RULES = {
  AI_REQUESTS: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
  // ... other rules
};
```

## Error Messages

Rate limit errors are properly internationalized:

- **English**: "Too many requests. Please wait before trying again"
- **French**: "Trop de requêtes. Veuillez attendre avant de réessayer"
- **Arabic**: "طلبات كثيرة جداً. يرجى الانتظار قبل المحاولة مرة أخرى"

## Implementation Status

- ✅ **Core Rate Limiter**: Fully implemented and tested
- ✅ **AI Integration**: Rate limiting added to AI client actions
- ✅ **Error Handling**: Comprehensive error messages and codes
- ✅ **Internationalization**: Translated error messages
- ✅ **Testing**: 17 comprehensive test cases
- 🟡 **Middleware**: HTTP middleware implemented but not yet integrated
- 🟡 **Production Scaling**: Redis implementation recommended for production

## Next Steps

1. **API Route Integration**: Add rate limiting to API endpoints
2. **Redis Backend**: Implement Redis-based rate limiter for production
3. **Monitoring**: Add metrics collection for rate limit violations
4. **Dynamic Configuration**: Allow runtime adjustment of rate limits
5. **User-specific Limits**: Implement different limits for different user tiers
