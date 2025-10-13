# Server Action Security Patterns

## Critical Security Principle

**NEVER trust client-provided user identifiers (userId, authId, or any user identification data).**

All user identity must be derived from server-side session validation.

---

## ✅ Correct Pattern: Public Server Actions

Server actions that are called directly from client components **MUST** derive user identity from the session:

```typescript
"use server";

import { getAuthenticatedUserContext } from "@/app/actions/user-context";
import { requireCurrentUser } from "@/lib/auth/supabase-server";

// Pattern 1: Use getAuthenticatedUserContext() for full user context
export async function myServerAction(
  someData: string
  // ❌ NEVER: userId?: string
  // ❌ NEVER: authId?: string
) {
  // ✅ Step 1: Get authenticated user from session
  const authenticatedUser = await getAuthenticatedUserContext();

  // ✅ Step 2: Use server-verified user ID for all operations
  await prisma.someModel.create({
    data: {
      userId: authenticatedUser.id, // Database CUID
      // OR
      user: { connect: { authId: authenticatedUser.authId } }, // Supabase auth ID
      content: someData,
    },
  });

  return { success: true };
}

// Pattern 2: Use requireCurrentUser() for simple auth check
export async function anotherServerAction(someData: string) {
  // ✅ Get auth user from session
  const authUser = await requireCurrentUser();

  // ✅ Use session-derived ID
  await prisma.session.findMany({
    where: { user: { authId: authUser.id } },
  });
}
```

---

## ✅ Correct Pattern: Internal Server Functions

Internal functions (called only by other server code, never exposed to client) **MAY** accept user IDs as parameters:

```typescript
// Internal function - NOT exported as server action
async function internalProcessing(
  authId: string, // ✅ OK - this comes from server-verified source
  sessionId: string
) {
  await prisma.user.update({
    where: { authId },
    data: { lastActive: new Date() },
  });
}

// Public server action - derives user ID and passes to internal function
export async function publicAction(sessionId: string) {
  const authenticatedUser = await getAuthenticatedUserContext();

  // ✅ Pass server-verified ID to internal function
  await internalProcessing(authenticatedUser.authId, sessionId);
}
```

**When to use this pattern:**

- Webhook handlers (Stripe, etc.) - server-to-server communication
- Admin operations - already verified admin access
- AI processing functions - called after user validation
- Background jobs - user ID comes from database records

---

## ❌ Anti-Pattern: Accepting Client User IDs

**NEVER DO THIS:**

```typescript
// ❌ WRONG: Accepting user ID from client
export async function insecureAction(
  userId: string, // ❌ Client could manipulate this!
  authId: string, // ❌ Client could impersonate another user!
  data: string
) {
  // ❌ Server trusts client-provided user ID
  await prisma.user.update({
    where: { authId }, // ❌ Could be any user!
    data: { someField: data },
  });
}
```

**Why this is dangerous:**

- Client can modify the `authId` parameter in browser DevTools
- User could access/modify other users' data
- No server-side validation of identity

---

## Database Field Reference

**User Model Fields:**

- `User.id` - Database CUID (internal identifier)
- `User.authId` - Supabase authentication ID (from session)

**Lookup Patterns:**

```typescript
// ✅ Lookup by authId (from session)
const user = await prisma.user.findUnique({
  where: { authId: authUser.id },
});

// ❌ NEVER lookup by client-provided ID
const user = await prisma.user.findUnique({
  where: { authId: clientProvidedAuthId }, // ❌ Insecure!
});
```

---

## Authentication Helpers

### `getAuthenticatedUserContext()`

**Location:** `src/app/actions/user-context.ts`

**Use when:** You need full user context (credits, role, tier)

```typescript
const authenticatedUser = await getAuthenticatedUserContext();
// Returns: { authId, id, tier, creditsBalance, role }
```

### `requireCurrentUser()`

**Location:** `src/lib/auth/supabase-server.ts`

**Use when:** You only need basic auth check

```typescript
const authUser = await requireCurrentUser();
// Returns: { id: authId, email, ... } from Supabase
```

---

## Security Audit Checklist

When reviewing server actions, check:

- [ ] No `userId` or `authId` parameters in public server action signatures
- [ ] First line calls `getAuthenticatedUserContext()` or `requireCurrentUser()`
- [ ] All database operations use server-verified user IDs
- [ ] Internal functions clearly documented as "server-only"
- [ ] Webhook handlers validate signatures before processing
- [ ] No client state (Zustand, React state) used for user identification

---

## Examples from Codebase

### ✅ Secure: `open-chat.action.ts`

```typescript
export async function handleUserInput(
  userInput: string,
  messages: OpenChatMessage[] = [],
  profile: Profile | null,
  locale: AppLocales = "en",
  sessionId?: string, // ✅ No user ID parameter
  messageId?: string
): Promise<HandleUserInputResult> {
  // ✅ Step 1: Get authenticated user from session (server-side, secure)
  const authenticatedUser = await getAuthenticatedUserContext();

  try {
    // ✅ All operations use server-verified ID
    const { analysis } = await processTherapeuticAnalysis(
      userInput,
      prevAnalysis,
      messages,
      authenticatedUser.authId, // ✅ Server-verified
      sessionId
    );
  }
}
```

### ✅ Secure: `session-actions.ts`

```typescript
export async function listSessionsByUser(): Promise<SessionOverview[]> {
  // ✅ Derive user from session
  const authUser = await requireCurrentUser();

  // ✅ Use server-verified ID
  const data = await prisma.session.findMany({
    where: { user: { authId: authUser.id } },
  });
}
```

### ✅ Secure: `billing-actions.ts`

```typescript
export async function createCreditPurchaseIntent(
  packageType: CreditPackageType
): Promise<ActionResult<PaymentIntentResult>> {
  // ✅ Verify authentication first
  const authUser = await requireCurrentUser();

  // ✅ Use session-derived ID
  const user = await prisma.user.findUnique({
    where: { authId: authUser.id },
  });
}
```

---

## Migration Guide

If you find code accepting client user IDs:

**Step 1:** Remove the parameter

```typescript
// Before:
export async function myAction(data: string, userId: string) { }

// After:
export async function myAction(data: string) { }
```

**Step 2:** Add authentication

```typescript
export async function myAction(data: string) {
  const authenticatedUser = await getAuthenticatedUserContext();
  // ... rest of function uses authenticatedUser.authId
}
```

**Step 3:** Update client calls

```typescript
// Before:
const userId = useAppUserStore.getState().user?.authId;
await myAction(data, userId);

// After:
await myAction(data); // Server derives user
```

**Step 4:** TypeScript will prevent re-introduction

- Removed parameters will cause type errors if client tries to pass them
- Forces developers to use secure pattern

---

## Last Updated

January 26, 2025 - Comprehensive security audit completed

## Related Documentation

- `src/app/actions/user-context.ts` - Authentication helpers
- `src/lib/auth/supabase-server.ts` - Session validation
- `SECURITY_FIX_ACTION_PLAN.md` - Detailed security audit results
