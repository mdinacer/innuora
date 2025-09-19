# Unified Logging Migration Guide

## Overview

This guide shows how to migrate from the current separate audit and error systems to the new unified logger.

## Migration Examples

### 1. Replace logAction calls

**Before:**

```typescript
import { logAction } from "@/app/actions/audit-actions";

// In auth-actions.ts
await logAction(data.user.id, "signup", `User registered: ${email}`);
```

**After:**

```typescript
import { logger } from "@/lib/logging/unified-logger";

// More structured and consistent
await logger.logSuccess("User registered", {
  userId: data.user.id,
  operation: "user_signup",
  metadata: { email, method: "email" },
});
```

### 2. Replace errorManager calls

**Before:**

```typescript
import { ERROR_CODES, errorManager } from "@/lib/errors";

errorManager.handleError(ERROR_CODES.AUTH_SESSION_EXPIRED, error, {
  operation: "requireCurrentUser",
});
```

**After:**

```typescript
import { ERROR_CODES, logger } from "@/lib/logging/unified-logger";

logger.logErrorAndThrow(ERROR_CODES.AUTH_SESSION_EXPIRED, error, {
  operation: "require_current_user",
  userId: authUser?.id,
});
```

### 3. Replace errorManager.wrapOperation

**Before:**

```typescript
return await errorManager.wrapOperation(
  () => prisma.session.create({ data: sessionData }),
  ERROR_CODES.SESSION_CREATE_FAILED,
  { userId: authUser.id, operation: "createSession" }
);
```

**After:**

```typescript
return await logger.wrapOperation(
  () => prisma.session.create({ data: sessionData }),
  ERROR_CODES.SESSION_CREATE_FAILED,
  {
    userId: authUser.id,
    operation: "session_create",
    metadata: { title: sessionData.title }
  },
  "Session created successfully" // Auto-logs success
);
```

### 4. Add missing audit logging for admin operations

**Before (no logging):**

```typescript
// In tester-actions.ts
export async function deleteTester(testerId: string) {
  await requireAdmin();
  return await prisma.tester.delete({ where: { id: testerId } });
}
```

**After (with audit logging):**

```typescript
import { logger } from "@/lib/logging/unified-logger";

export async function deleteTester(testerId: string) {
  const admin = await requireAdmin();

  return await logger.wrapOperation(
    async () => {
      const tester = await prisma.tester.findUnique({ where: { id: testerId } });
      if (!tester) throw new Error("Tester not found");

      await prisma.tester.delete({ where: { id: testerId } });
      return tester;
    },
    ERROR_CODES.TESTER_DELETE_FAILED,
    {
      userId: admin.id,
      operation: "admin_delete_tester",
      metadata: { testerId },
    },
    "Tester deleted by admin"
  );
}
```

### 5. Client-side error logging

**Before (inconsistent):**

```typescript
// In React components
try {
  await someAction();
} catch (error) {
  console.error("Something went wrong:", error);
  toast.error("Failed to save");
}
```

**After (structured):**

```typescript
import { logger } from "@/lib/logging/unified-logger";

try {
  await someAction();
} catch (error) {
  await logger.logWarning("Client operation failed", {
    operation: "client_save_session",
    metadata: {
      component: "SessionForm",
      error: error instanceof Error ? error.message : String(error),
    },
  });
  toast.error("Failed to save");
}
```

## Benefits of Migration

### 1. **Unified Interface**

- Single import for all logging needs
- Consistent patterns across the codebase
- Reduced cognitive overhead

### 2. **Better Context**

- Rich metadata for debugging
- Correlation between audit and error logs
- User and session tracking built-in

### 3. **Flexible Persistence**

- Reuses existing AuditLog table
- Environment-based logging control
- Ready for external service integration

### 4. **Backward Compatibility**

- Old functions still work via exports
- Gradual migration possible
- No breaking changes

## Migration Steps

### Phase 1: Install and Test

1. Import unified logger in one file
2. Test alongside existing system
3. Verify database logging works

### Phase 2: Critical Operations

1. Migrate auth operations first
2. Update session management
3. Add admin operation logging

### Phase 3: Complete Migration

1. Update all remaining files
2. Remove old error-manager and audit-actions
3. Update imports across codebase

### Phase 4: Enhancement

1. Add client-side structured logging
2. Integrate external services (Sentry, etc.)
3. Add monitoring dashboards

## Configuration

### Environment Variables

```env
# Development
NODE_ENV=development
ENABLE_LOGGING=true
ENABLE_DB_LOGGING=false

# Production
NODE_ENV=production
ENABLE_LOGGING=false
ENABLE_DB_LOGGING=true

# External services (optional)
SENTRY_DSN=your_sentry_dsn
WEBHOOK_URL=your_webhook_url
```

## Notes

1. **Non-Breaking**: Old functions still work during migration
2. **Performance**: Logging is non-blocking and won't slow operations
3. **Reliability**: Logging failures never break main operations
4. **Simple**: Minimal configuration, works out of the box
