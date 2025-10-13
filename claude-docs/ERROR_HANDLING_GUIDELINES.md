# Error Handling Guidelines

This document outlines the standardized error handling patterns and best practices for the Innuora application.

## 🎯 Overview

We use a unified logging system and structured error handling to ensure:

- **Consistent error reporting** across the application
- **Actionable debugging information** for developers
- **Graceful user experience** with meaningful error messages
- **Audit trail** for production troubleshooting

## 📚 Core Components

### 1. Unified Logger (`@/lib/logging/unified-logger`)

All error logging should use the unified logger instead of `console.log/error`:

```typescript
import { logger } from "@/lib/logging/unified-logger";

// ✅ Good - Structured logging
logger.logWarning("Failed to load user session", {
  operation: "session_load_failed",
  userId: "user_123",
  metadata: {
    error: error.message,
    sessionId: "session_456",
  },
});

// ❌ Bad - Console logging
console.error("Session load failed:", error);
```

### 2. Error Codes (`@/lib/errors/error-codes`)

Use predefined error codes for consistency:

```typescript
import { ERROR_CODES } from "@/lib/errors/error-codes";

logger.logErrorAndThrow(ERROR_CODES.BILLING_OPERATION_FAILED, error, {
  operation: "payment_processing",
  metadata: { paymentIntentId },
});
```

### 3. App Error Classes (`@/lib/errors/app-error`)

Use structured error classes for better error handling:

```typescript
import { AppError } from "@/lib/errors/app-error";

throw new AppError("INVALID_INPUT", "Credit amount must be positive", { providedAmount: -10 });
```

## 🛠️ Standard Patterns

### Server Actions

```typescript
export async function createUser(data: UserData): Promise<ActionResult<User>> {
  return await logger.wrapOperation(
    async () => {
      // Validation
      if (!data.email) {
        return {
          success: false,
          error: "Email is required",
          errorCode: "VALIDATION_FAILED",
        };
      }

      // Business logic
      const user = await prisma.user.create({ data });

      return {
        success: true,
        data: user,
      };
    },
    ERROR_CODES.USER_CREATION_FAILED,
    {
      operation: "create_user",
      metadata: { email: data.email },
    },
    "User created successfully"
  );
}
```

### React Components

```typescript
export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await fetchUser(userId);
      if (!result.success) {
        setError(result.error || "Failed to load user");
        return;
      }

      setUser(result.data);
    } catch (err) {
      logger.logWarning("Failed to load user in component", {
        operation: "user_profile_load_failed",
        userId,
        metadata: {
          error: err instanceof Error ? err.message : String(err)
        },
      });
      setError("Unable to load user profile");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  if (error) {
    return <ErrorDisplay message={error} onRetry={loadUser} />;
  }

  // ... rest of component
}
```

### API Routes

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Process request
    const result = await processPayment(body);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.logWarning("API route failed", {
      operation: "api_payment_process",
      metadata: {
        error: error instanceof Error ? error.message : String(error),
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: "Payment processing failed",
      },
      { status: 500 }
    );
  }
}
```

### Service Classes

```typescript
export class PaymentService {
  async processPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      // Validation
      this.validatePaymentData(paymentData);

      // Business logic with retry
      const result = await this.retryService.retryWithBackoff(
        () => this.stripe.createPaymentIntent(paymentData),
        "payment_intent_creation"
      );

      logger.logInfo("Payment processed successfully", {
        operation: "payment_service_success",
        metadata: { paymentIntentId: result.id },
      });

      return { success: true, paymentIntent: result };
    } catch (error) {
      logger.logWarning("Payment processing failed", {
        operation: "payment_service_failed",
        metadata: {
          error: error instanceof Error ? error.message : String(error),
          paymentData: { amount: paymentData.amount }, // Safe subset
        },
      });

      throw error; // Re-throw for caller to handle
    }
  }
}
```

## 📋 Best Practices

### ✅ Do

1. **Use structured logging** with operation names and metadata
2. **Provide meaningful error messages** to users
3. **Log sufficient context** for debugging without sensitive data
4. **Use error boundaries** in React for graceful fallbacks
5. **Implement retry logic** for transient failures
6. **Validate inputs** early and provide clear feedback
7. **Use TypeScript** for compile-time error prevention

### ❌ Don't

1. **Don't use console.log/error** in production code
2. **Don't expose internal errors** directly to users
3. **Don't log sensitive information** (passwords, tokens, PII)
4. **Don't swallow errors** without logging
5. **Don't create generic "Something went wrong"** messages
6. **Don't retry non-retryable errors** (4xx HTTP errors)
7. **Don't forget to handle async errors** in useEffect

## 🎨 Error UI Patterns

### Loading States

```typescript
if (isLoading) {
  return <Skeleton className="h-6 w-24" />;
}
```

### Error States

```typescript
if (error) {
  return (
    <div className="error-state">
      <span className="text-red-500">{error}</span>
      <Button onClick={handleRetry} variant="outline" size="sm">
        Try Again
      </Button>
    </div>
  );
}
```

### Success Feedback

```typescript
if (success) {
  return (
    <div className="success-state">
      <CheckIcon className="text-green-500" />
      <span>Operation completed successfully</span>
    </div>
  );
}
```

## 🔧 Testing Error Scenarios

```typescript
describe("UserService", () => {
  it("should handle network errors gracefully", async () => {
    // Mock network failure
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    const result = await userService.fetchUser("user_123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Unable to fetch user data");
    expect(logger.logWarning).toHaveBeenCalledWith(
      "Failed to fetch user",
      expect.objectContaining({
        operation: "user_service_fetch_failed",
        userId: "user_123",
      })
    );
  });
});
```

## 📊 Monitoring and Alerting

### Log Levels

- **INFO**: Successful operations, important business events
- **WARNING**: Recoverable errors, retries, validation failures
- **ERROR**: Critical failures that require immediate attention

### Key Metrics to Monitor

- Error rates by operation
- Failed payment attempts
- Authentication failures
- API response times
- Database connection errors

### Alerting Thresholds

- Error rate > 5% over 5 minutes
- Payment failure rate > 2%
- API response time > 2 seconds
- Database errors > 10/minute

---

## 🚀 Migration from Legacy Patterns

When updating existing code:

1. **Replace console.log/error** with structured logging
2. **Add proper error types** and validation
3. **Implement graceful degradation** in UI components
4. **Add retry logic** for transient failures
5. **Write tests** for error scenarios

This ensures a consistent, maintainable, and debuggable error handling strategy across the entire application.
