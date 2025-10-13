# Session Continuation Notes

**Last Updated**: January 2025
**Current Session**: Error Handling Standardization

---

## 🎯 Current Work in Progress

### **Task**: Standardize Error Handling Across Codebase

**Status**: Analysis Complete, Ready for Implementation

**Context**: User identified inconsistent error handling patterns as the main issue from COMPLEXITY_AUDIT.md. After discussion, we confirmed that Next.js strips error messages from Server Actions in production, making `throw new Error()` patterns completely broken in production.

---

## 🚨 Critical Insight: Next.js Production Error Stripping

**IMPORTANT**: Next.js strips ALL error messages from Server Actions in production for security.

**What happens**:

- Development: `throw new Error("Detailed message")` → Client sees full message
- Production: `throw new Error("Detailed message")` → Client sees: `"An error occurred"`

**Why this matters**:

- 20+ direct `throw new Error()` calls in codebase will break in production
- Users will see generic error messages with no actionable guidance
- Error details are completely lost client-side

**The solution**:

- NEVER throw errors from Server Actions
- ALWAYS return errors as data using `ActionResult<T>` pattern
- Use `logger.wrapOperation()` which returns `{data, error}` instead of throwing

---

## 📋 What We've Completed

1. ✅ **Analyzed current error handling patterns** across entire codebase
2. ✅ **Created comprehensive standardization plan** (`docs/ERROR_HANDLING_STANDARDIZATION.md`)
3. ✅ **Identified high-priority files** needing fixes:

   - `src/app/actions/ai-client-actions.ts` (17 direct throws - REVENUE CRITICAL)
   - `src/app/actions/user-actions.ts` (10+ direct throws - USER MGMT)
   - `src/app/actions/billing-actions.ts` (mixed patterns - REVENUE CRITICAL)
   - `src/app/actions/session-actions.ts` (mostly direct throws)

4. ✅ **Documented standardization plan** with:
   - Current state analysis
   - Recommended pattern (`logger.wrapOperation()`)
   - Usage guidelines and examples
   - Migration plan (3 phases, 8-10 hours total)
   - Common pitfalls to avoid

---

## 📝 Next Steps (Priority Order)

### **Immediate** (This Session or Next):

1. **Add Next.js error stripping warning** to ERROR_HANDLING_STANDARDIZATION.md

   - Explain why throwing errors breaks in production
   - Show before/after examples
   - Emphasize urgency (production bug)

2. **Start Phase 2: Fix High-Priority Server Actions**

   **File 1**: `src/app/actions/ai-client-actions.ts`

   - **Impact**: CRITICAL (core revenue function)
   - **Issues**: 17 direct `throw new Error()` calls
   - **Estimated effort**: 2-3 hours
   - **Pattern to apply**: Wrap ALL functions with `logger.wrapOperation()`

   **File 2**: `src/app/actions/user-actions.ts`

   - **Impact**: HIGH (user management)
   - **Issues**: 10+ direct throws
   - **Estimated effort**: 1-2 hours

   **File 3**: `src/app/actions/billing-actions.ts`

   - **Impact**: CRITICAL (revenue protection)
   - **Issues**: Mixed patterns in refund logic
   - **Estimated effort**: 1 hour

   **File 4**: `src/app/actions/session-actions.ts`

   - **Impact**: MEDIUM (session CRUD)
   - **Issues**: No structured error codes
   - **Estimated effort**: 2 hours

### **Short-term** (Next 2 weeks):

3. **Complete remaining Server Actions** (Phase 2 cleanup)
4. **Update test files** to expect `ActionResult<T>` returns
5. **Test error paths** in UI to verify error messages work

### **Long-term** (Next month):

6. **Add ESLint rule** to prevent direct throws in Server Actions
7. **Update CLAUDE.md** with error handling section

---

## 🎯 Success Metrics

**Target State**:

- 100% of Server Actions use `logger.wrapOperation()`
- 0 direct `throw new Error()` in Server Actions
- All errors return `ActionResult<T>` with structured error codes
- Error messages work correctly in production (not stripped)

**Current State**:

- ~75% Server Actions use `wrapOperation()`
- 20+ direct throws (will break in production)
- ~90% errors have structured codes

**Gap**: 25% - Estimated 8-10 hours to close

---

## 📖 Key Pattern to Remember

### ✅ **CORRECT Pattern** (Works in Production):

```typescript
export async function myServerAction(params): Promise<ActionResult<T>> {
  return await logger.wrapOperation(
    async () => {
      // Validation
      if (invalid) {
        logger.logErrorAndThrow(ERROR_CODES.VALIDATION_FAILED, new Error("Specific reason"), {
          operation: "my_action",
          metadata: { params },
        });
      }

      // Business logic
      return result;
    },
    ERROR_CODES.MY_ACTION_FAILED,
    { operation: "my_server_action", metadata: { params } }
  );
}
```

**Why this works**:

- `wrapOperation()` catches ALL errors (including from `logErrorAndThrow()`)
- Returns `{data: T, error: null}` on success
- Returns `{data: null, error: {message, code}}` on failure
- Error details are in the DATA payload, not thrown
- Next.js cannot strip the error message (it's in returned data)

### ❌ **BROKEN Pattern** (Fails in Production):

```typescript
export async function myServerAction(params) {
  if (invalid) {
    throw new Error("Specific reason"); // Production: "An error occurred"
  }
}
```

**Why this fails**:

- Next.js strips error messages in production
- Client receives generic "An error occurred"
- User has no idea what went wrong

---

## 🔍 Files Already Following Best Practices

**Keep as-is** (already correct):

- ✅ `src/app/actions/credit-actions.ts` - ALL functions use `wrapOperation()`
- ✅ `src/app/actions/auth-actions.ts` - ALL functions use `wrapOperation()`
- ✅ `src/lib/crypto/webcrypto-crypto.ts` - ALL functions use `wrapOperation()`
- ✅ `src/domains/therapeutic-analysis/therapeutic-analysis.action.ts` - Correct pattern

**Exception** (orchestrator - acceptable):

- ✅ `src/domains/open-chat/open-chat.action.ts` - Uses try/catch but all nested calls use `wrapOperation()`

---

## 💡 User Feedback & Insights

**User Quote**: "yes, after seeing how nextjs strips error message from error thrown from servers, we should avoid throwing error from server actions especially"

**Key Learning**:

- This is not just a "nice to have" consistency improvement
- This is a **production bug** that affects 20+ Server Actions
- Users are currently seeing generic error messages in production
- Every `throw new Error()` in Server Actions is broken in production

---

## 📚 Related Documentation

- **Analysis Document**: `docs/ERROR_HANDLING_STANDARDIZATION.md` (comprehensive plan)
- **Complexity Audit**: `docs/COMPLEXITY_AUDIT.md` (identified this issue)
- **Error Codes**: `src/lib/errors/error-codes.ts` (structured error codes)
- **Logger Implementation**: `src/lib/logging/unified-logger.ts` (wrapOperation function)
- **Type Definition**: `src/types/action-result.ts` (ActionResult<T> type)

---

## 🎬 How to Continue This Work

**For Next Session**:

1. Read this file first to understand context
2. Review `docs/ERROR_HANDLING_STANDARDIZATION.md` for detailed plan
3. Start with `src/app/actions/ai-client-actions.ts` (highest business impact)
4. Follow the pattern: Wrap each Server Action with `logger.wrapOperation()`
5. Update return types to `Promise<ActionResult<T>>`
6. Test in UI to verify error messages work

**Estimated Time**:

- First file (ai-client-actions.ts): 2-3 hours
- Remaining high-priority files: 4-5 hours
- Testing and validation: 2 hours
- **Total**: 8-10 hours

---

**Remember**: This is not just refactoring - this fixes a real production bug where users see generic error messages instead of actionable guidance.
