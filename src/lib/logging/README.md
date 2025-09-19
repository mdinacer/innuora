# Unified Logging System

A simple, efficient logging system that combines audit trails and error management into one unified interface.

## Features

- **Enhanced Database Schema**: Structured columns for better performance and querying
- **Multiple Log Levels**: INFO, WARN, ERROR, AUDIT with proper enum types
- **Rich Context**: User IDs, session IDs, error codes, and metadata tracking
- **Environment Aware**: Console logging in development, database persistence in production
- **Non-blocking**: Logging failures never break main operations
- **Performance Optimized**: Dedicated indexes for fast queries

## Usage

### Basic Logging

```typescript
import { logger } from "@/lib/logging/unified-logger";

// Success operations (audit trail)
await logger.logSuccess("User login successful", {
  operation: "user_login",
  userId: user.authId,
  metadata: { method: "email", ip: req.ip }
});

// Error logging with throwing
logger.logErrorAndThrow(ERROR_CODES.AUTH_FAILED, error, {
  operation: "user_authentication",
  userId: user.authId,
  metadata: { attempt: 3 }
});

// Warnings (non-critical issues)
await logger.logWarning("API rate limit approaching", {
  operation: "api_rate_monitoring",
  userId: user.authId,
  metadata: { current: 90, limit: 100 }
});

// General information
await logger.logInfo("System maintenance completed", {
  operation: "system_maintenance",
  metadata: { duration: "30 minutes" }
});
```

### Wrap Operations (Recommended)

```typescript
// Automatically logs success and handles errors
const session = await logger.wrapOperation(
  () => prisma.session.create({ data: sessionData }),
  ERROR_CODES.SESSION_CREATE_FAILED,
  {
    operation: "session_create",
    userId: user.authId,
    metadata: { title: sessionData.title }
  },
  "Session created successfully"
);
```

## Database Schema

The enhanced `AuditLog` table includes:

```sql
-- Core fields
operation VARCHAR(100)  -- Clean operation name (e.g., "user_signup")
level LogLevel          -- INFO | WARN | ERROR | AUDIT
message TEXT            -- Human-readable message

-- Context fields  
userId VARCHAR(255)     -- Optional user reference (authId)
sessionId VARCHAR(255)  -- Session correlation
errorCode VARCHAR(50)   -- Structured error codes
userAgent TEXT          -- Client information
ipAddress VARCHAR(45)   -- Request IP

-- Additional data
metadata JSON           -- Flexible additional context
```

## Environment Configuration

```env
# Development - console logging only
NODE_ENV=development
ENABLE_LOGGING=true
ENABLE_DB_LOGGING=false

# Production - database persistence
NODE_ENV=production  
ENABLE_LOGGING=false
ENABLE_DB_LOGGING=true
```

## Querying Logs

### Find Error Logs
```typescript
const errors = await prisma.auditLog.findMany({
  where: { level: 'ERROR' },
  orderBy: { createdAt: 'desc' }
});
```

### Find User Activity
```typescript
const userActivity = await prisma.auditLog.findMany({
  where: { 
    userId: user.authId,
    level: 'AUDIT'
  },
  orderBy: { createdAt: 'desc' }
});
```

### Find Session Issues
```typescript
const sessionErrors = await prisma.auditLog.findMany({
  where: {
    operation: { startsWith: 'session_' },
    level: 'ERROR'
  }
});
```

## Operation Naming Convention

Use snake_case with descriptive prefixes:

- **User operations**: `user_signup`, `user_login`, `user_update`
- **Session operations**: `session_create`, `session_update`, `session_delete`
- **Admin operations**: `admin_create_tester`, `admin_delete_user`
- **System operations**: `system_backup`, `system_maintenance`

## Migration from Old System

The unified logger replaces both:
- `logAction()` calls → `logger.logSuccess()` or `logger.wrapOperation()`
- `errorManager.handleError()` → `logger.logErrorAndThrow()`
- `errorManager.wrapOperation()` → `logger.wrapOperation()`

All existing functionality is preserved with enhanced features and better performance.