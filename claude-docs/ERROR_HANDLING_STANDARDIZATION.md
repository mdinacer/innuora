# Error Handling Standardization Plan

**Date**: January 2025
**Status**: Analysis Complete - Ready for Implementation
**Priority**: High (affects maintainability and debugging)

---

## 🎯 Executive Summary

**Current State**: 3 different error handling patterns used inconsistently across codebase
**Target State**: Single standardized pattern with clear usage guidelines
**Impact**: Improved maintainability, consistent error responses, easier debugging

---

## 📊 Current Error Handling Patterns

### Pattern 1: `logger.wrapOperation()` (RECOMMENDED ✅)

**Usage**: 15 files (most Server Actions)
**Pattern**:

```typescript
export async function someAction(params): Promise<ActionResult<T>> {
  return await logger.wrapOperation(
    async () => {
      // Business logic
      return result;
    },
    ERROR_CODES.SPECIFIC_ERROR,
    { operation: "operation_name", metadata: { ... } }
  );
}
```

**Advantages**:

- ✅ Automatic error logging with structured context
- ✅ Returns `ActionResult<T>` (production-safe, no throws)
- ✅ Consistent error format for UI consumption
- ✅ Automatic audit trail via unified logger
- ✅ Handles Supabase error mapping automatically

**Files Using This Pattern**:

- `src/app/actions/credit-actions.ts` (all functions)
- `src/app/actions/auth-actions.ts` (all functions)
- `src/app/actions/user-actions.ts` (partial)
- `src/app/actions/billing-actions.ts` (partial)
- `src/app/actions/session-actions.ts` (partial)
- `src/lib/crypto/webcrypto-crypto.ts` (all functions)

---

### Pattern 2: `try/catch` with manual error handling (INCONSISTENT ⚠️)

**Usage**: Multiple files (mixed with Pattern 1)
**Pattern**:

```typescript
export async function someAction(params) {
  try {
    // Business logic
    return result;
  } catch (error) {
    // Manual error handling - VARIES BY FILE
    logger.logError(...); // Sometimes
    throw new Error("message"); // Sometimes
    return { error: ... }; // Sometimes
  }
}
```

**Problems**:

- ❌ Inconsistent error logging (sometimes missing)
- ❌ Inconsistent return types (throws vs returns error)
- ❌ Manual error code mapping required
- ❌ Easy to forget audit trail
- ❌ Harder to maintain

**Files Using This Pattern**:

- `src/domains/open-chat/open-chat.action.ts` (orchestrator functions)
- `src/app/actions/user-actions.ts` (mixed with Pattern 1)
- `src/app/actions/billing-actions.ts` (mixed with Pattern 1)

---

### Pattern 3: `logger.logErrorAndThrow()` (SPECIFIC USE CASE 🔧)

**Usage**: Internal library functions
**Pattern**:

```typescript
if (invalidCondition) {
  logger.logErrorAndThrow(
    ERROR_CODES.VALIDATION_FAILED,
    new Error("Validation error"),
    { operation: "operation_name", metadata: { ... } }
  );
}
```

**Advantages**:

- ✅ Automatic error logging
- ✅ Throws AppError with structured data
- ✅ Good for validation checks within larger operations

**Disadvantages**:

- ❌ Throws instead of returning (not production-safe for Server Actions)
- ❌ Requires caller to catch and handle
- ❌ Can't be used directly in Server Actions

**Legitimate Use Cases**:

- Internal validation checks (within wrapOperation)
- Library functions (not Server Actions)
- Early exits in complex operations

---

### Pattern 4: Direct `throw new Error()` (ANTI-PATTERN ❌)

**Usage**: 20+ instances across codebase
**Pattern**:

```typescript
if (error) {
  throw new Error("Something went wrong");
}
```

**Problems**:

- ❌ No automatic logging
- ❌ No structured error codes
- ❌ No audit trail
- ❌ Inconsistent error messages
- ❌ Hard to debug in production

**Where Found**:

- `src/app/actions/session-actions.ts:107` - "Session not found"
- `src/app/actions/billing-actions.ts` - Multiple instances
- `src/app/actions/user-actions.ts` - Multiple instances
- `src/app/actions/ai-client-actions.ts` - API errors

---

## 🎯 Standardization Decision

### **RECOMMENDED PATTERN: `logger.wrapOperation()` for ALL Server Actions**

**Rationale**:

1. **Production-Safe**: Returns `ActionResult<T>`, never throws to client
2. **Automatic Logging**: Error logging and audit trail built-in
3. **Consistent Format**: UI can rely on `{data, error}` structure
4. **Easy to Use**: Single function call wraps entire operation
5. **Supabase Integration**: Automatic error code mapping

---

## 📋 Implementation Plan

### Phase 1: Document Standards (CURRENT)

**Deliverables**:

- ✅ This standardization document
- [ ] Update CLAUDE.md with error handling guidelines
- [ ] Create migration guide for developers

---

### Phase 2: Fix High-Priority Files (Week 1)

**Target Files** (sorted by business impact):

1. **`src/app/actions/ai-client-actions.ts`**

   - **Current**: Mix of try/catch and throw new Error
   - **Issues**: 17 direct throws, inconsistent error logging
   - **Impact**: HIGH (core revenue function)
   - **Effort**: 2-3 hours

2. **`src/app/actions/user-actions.ts`**

   - **Current**: Mix of wrapOperation and throw new Error
   - **Issues**: 10+ direct throws in critical paths
   - **Impact**: HIGH (user management)
   - **Effort**: 1-2 hours

3. **`src/app/actions/billing-actions.ts`**

   - **Current**: Mix of wrapOperation and throw new Error
   - **Issues**: Error handling in refund logic inconsistent
   - **Impact**: HIGH (revenue protection)
   - **Effort**: 1 hour

4. **`src/app/actions/session-actions.ts`**
   - **Current**: Mostly direct throws
   - **Issues**: No structured error codes
   - **Impact**: MEDIUM (session CRUD)
   - **Effort**: 2 hours

---

### Phase 3: Domain Functions (Week 2)

**Target Files**:

5. **`src/domains/open-chat/open-chat.action.ts`**

   - **Current**: try/catch orchestrator (acceptable for orchestrators)
   - **Action**: Document as exception to rule (orchestrators can use try/catch)
   - **Ensure**: All nested calls use wrapOperation
   - **Effort**: 30 minutes (documentation only)

6. **`src/domains/therapeutic-analysis/therapeutic-analysis.action.ts`**
   - **Current**: Uses wrapOperation correctly
   - **Action**: Keep as-is (already following standard)

---

### Phase 4: Testing & Validation (Week 3)

**Actions**:

- [ ] Update all test files to expect `ActionResult<T>` returns
- [ ] Add integration tests for error paths
- [ ] Verify error codes map correctly to UI messages
- [ ] Test Supabase error mapping

---

## 📖 Usage Guidelines

### Rule 1: Server Actions MUST use `logger.wrapOperation()`

```typescript
// ✅ CORRECT
export async function myServerAction(params): Promise<ActionResult<T>> {
  return await logger.wrapOperation(
    async () => {
      // All business logic here
      return result;
    },
    ERROR_CODES.MY_ERROR,
    { operation: "my_server_action", metadata: { params } }
  );
}
```

```typescript
// ❌ WRONG - Direct throw
export async function myServerAction(params) {
  if (invalid) {
    throw new Error("Invalid params"); // NO!
  }
}
```

```typescript
// ❌ WRONG - Manual try/catch in Server Action
export async function myServerAction(params) {
  try {
    // logic
  } catch (error) {
    // Manual error handling - inconsistent!
  }
}
```

---

### Rule 2: Internal Validation SHOULD use `logger.logErrorAndThrow()`

**Use Case**: Early validation checks WITHIN a wrapOperation

```typescript
export async function processPayment(amount: number): Promise<ActionResult<T>> {
  return await logger.wrapOperation(
    async () => {
      // Validation check - throws to exit early
      if (amount <= 0) {
        logger.logErrorAndThrow(ERROR_CODES.VALIDATION_FAILED, new Error("Amount must be positive"), {
          operation: "process_payment_validation",
          metadata: { amount },
        });
      }

      // Business logic continues
      // wrapOperation will catch the throw and return {data: null, error: {...}}
    },
    ERROR_CODES.PAYMENT_PROCESSING_FAILED,
    { operation: "process_payment" }
  );
}
```

**Why This Works**:

- `logErrorAndThrow()` throws AppError
- `wrapOperation()` catches it and returns `ActionResult<T>`
- Client receives consistent `{data: null, error: {...}}` format

---

### Rule 3: Orchestrators CAN use `try/catch` (Exception to Rule)

**Use Case**: High-level orchestrator functions coordinating multiple operations

```typescript
// ✅ ACCEPTABLE for orchestrators
export async function handleComplexWorkflow(params) {
  try {
    // Call multiple wrapOperation functions
    const step1 = await operationA(params);
    if (step1.error) {
      // Handle step1 error
    }

    const step2 = await operationB(step1.data);
    if (step2.error) {
      // Handle step2 error
    }

    return { success: true };
  } catch (error) {
    // Catch unexpected errors
    logger.logError("Workflow failed", { error });
    throw error;
  }
}
```

**Requirements**:

1. ALL nested operations MUST use `wrapOperation()`
2. Orchestrator MUST document why it uses try/catch
3. Error logging MUST be explicit in catch block

**Examples**:

- `src/domains/open-chat/open-chat.action.ts:handleUserInput()` ✅ (orchestrates analysis + AI + credits)

---

### Rule 4: NEVER use direct `throw new Error()`

```typescript
// ❌ BANNED
if (error) {
  throw new Error("Something went wrong");
}

// ✅ USE THIS INSTEAD (in Server Actions)
return await logger.wrapOperation(
  async () => {
    if (error) {
      logger.logErrorAndThrow(ERROR_CODES.SPECIFIC_ERROR, error, context);
    }
  },
  ERROR_CODES.OPERATION_FAILED,
  context
);
```

---

## 🔍 Error Code Requirements

### Every Error MUST Have a Structured Error Code

**Location**: `src/lib/errors/error-codes.ts`

**Format**:

```typescript
export const ERROR_CODES = {
  // Category prefix (AUTH_, AI_, BILLING_, etc.)
  CATEGORY_SPECIFIC_ERROR: "CATEGORY_SPECIFIC_ERROR",
} as const;
```

**Before Adding New Error**:

1. Check if existing error code covers the case
2. If not, add to appropriate category in `error-codes.ts`
3. Add user-friendly message to `src/locales/*/errors.json`

---

## 📊 Migration Checklist

### For Each File:

- [ ] **Identify pattern**: wrapOperation / try-catch / throw
- [ ] **Check Server Action**: If "use server", MUST use wrapOperation
- [ ] **Replace throws**: Convert direct throws to logErrorAndThrow
- [ ] **Verify error codes**: All errors have structured codes
- [ ] **Update tests**: Expect ActionResult<T> returns
- [ ] **Test error paths**: Verify error responses work in UI
- [ ] **Update docs**: Add JSDoc if missing

---

## 🎓 Benefits After Standardization

### Developer Experience:

- ✅ Clear mental model (one pattern for Server Actions)
- ✅ Less cognitive load (no "which pattern should I use?")
- ✅ Easier code reviews (violations are obvious)
- ✅ Better onboarding (simpler to teach)

### Production Quality:

- ✅ Consistent error logging (never miss an error)
- ✅ Complete audit trail (all operations logged)
- ✅ Better debugging (structured context in logs)
- ✅ Safer error handling (no unhandled throws to client)

### UI/UX:

- ✅ Predictable error format (`ActionResult<T>`)
- ✅ User-friendly error messages (via error codes)
- ✅ Better error recovery (structured error data)

---

## 🚨 Common Pitfalls to Avoid

### Pitfall 1: Forgetting to await wrapOperation

```typescript
// ❌ WRONG - Missing await
return logger.wrapOperation(async () => {...}, ERROR_CODES.FOO, context);

// ✅ CORRECT
return await logger.wrapOperation(async () => {...}, ERROR_CODES.FOO, context);
```

### Pitfall 2: Throwing from Server Action top-level

```typescript
// ❌ WRONG - Throws to client
export async function myAction() {
  if (invalid) throw new Error("Invalid");
}

// ✅ CORRECT - Returns error
export async function myAction(): Promise<ActionResult<T>> {
  return await logger.wrapOperation(async () => {
    if (invalid) {
      logger.logErrorAndThrow(ERROR_CODES.VALIDATION_FAILED, ...);
    }
  }, ERROR_CODES.MY_ACTION_FAILED, context);
}
```

### Pitfall 3: Not handling ActionResult in caller

```typescript
// ❌ WRONG - Not checking error
const result = await myAction();
const data = result.data; // Could be null!

// ✅ CORRECT
const result = await myAction();
if (result.error) {
  // Handle error
  return;
}
const data = result.data; // Safe to use
```

---

## 📝 Next Steps

**Immediate** (This Week):

- [ ] Review this document with team
- [ ] Update CLAUDE.md with error handling section
- [ ] Start Phase 2: Fix `ai-client-actions.ts`

**Short-term** (Next 2 Weeks):

- [ ] Complete Phase 2: High-priority files
- [ ] Complete Phase 3: Domain functions
- [ ] Update test suite

**Long-term** (Next Month):

- [ ] Add ESLint rule to prevent direct throws in Server Actions
- [ ] Create error handling examples in docs
- [ ] Monitor production logs for improvement

---

## 🏆 Success Metrics

**Target**:

- 100% of Server Actions use `wrapOperation()`
- 0 direct `throw new Error()` in Server Actions
- All errors have structured error codes
- Complete audit trail for all operations

**Current State**:

- ~75% Server Actions use wrapOperation
- 20+ direct throws across codebase
- ~90% errors have structured codes

**Gap to Close**: 25% - Estimated effort: 8-10 hours

---

**Conclusion**: Standardizing on `logger.wrapOperation()` for all Server Actions will significantly improve code maintainability, debugging, and production error handling with minimal migration effort.
