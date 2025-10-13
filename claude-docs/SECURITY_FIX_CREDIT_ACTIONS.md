# Security Fix: Credit Actions

## Problem

Current credit actions accept `authId` or `userId` from client, making them vulnerable to parameter injection attacks.

## Solution Pattern

1. **Public functions** (called from client): No user parameters, get from session
2. **Internal functions** (called from server/webhooks): Accept authId, prefix with `_`
3. **Admin functions**: Accept target user, verify caller is admin

## Changes Made

### ✅ Completed

1. **Created `user-context.ts`**

   - `getAuthenticatedUserContext()` - Single DB lookup with all user data
   - `_getUserByAuthIdInternal(authId)` - Internal helper

2. **Created internal helpers in `credit-actions.ts`**

   - `_getUserCreditsBalanceInternal(authId)`
   - `_addCreditsInternal(authId, ...)`
   - `_deductCreditsInternal(authId, ...)`

3. **Fixed `getUserCreditsBalance()`**
   - ❌ Before: `getUserCreditsBalance(authId: string)`
   - ✅ After: `getUserCreditsBalance()` - gets user from session
   - Added: `getUserCreditsBalanceByAuthId(authId)` for webhooks

### 🔄 Need to Fix

#### High Priority (Called from Client)

1. **`addCredits()`** - Currently: `addCredits(authId, amount, reason, metadata)`

   - New public: `addCredits(amount, reason, metadata)` - for manual top-ups
   - Keep internal: `addCreditsToUser(authId, amount, reason, metadata)` - for webhooks

2. **`deductCredits()`** - Currently: `deductCredits(authId, amount, reason, sessionId, metadata)`

   - New public: Should NOT be public (only server should deduct)
   - Keep internal: `deductCreditsFromUser(authId, amount, reason, sessionId, metadata)` - for AI/webhooks

3. **`getUserCreditHistory()`** - Currently: `getUserCreditHistory(authId, limit, offset)`

   - New public: `getUserCreditHistory(limit, offset)` - gets user from session
   - Keep internal: `getUserCreditHistoryByAuthId(authId, limit, offset)` - for admin

4. **`checkSufficientCredits()`** - Currently: `checkSufficientCredits(authId, required)`
   - New public: `checkSufficientCredits(required)` - gets user from session
   - Keep internal: `checkSufficientCreditsForUser(authId, required)` - for webhooks

#### Medium Priority (Admin Functions)

5. **`adminAdjustCredits()`** - Currently: `adminAdjustCredits(adminUserId, targetUserId, ...)`
   - Fix: Remove `adminUserId` parameter, get from session
   - Verify caller is admin before proceeding

### Performance Impact

**NONE** - We're not adding extra DB calls:

- Before: Client passes authId → Server looks up user in each function
- After: Server gets authId from session → Looks up user once, reuses context

## Recommended Refactor Order

1. ✅ Create helper functions (`user-context.ts`)
2. ✅ Fix `getUserCreditsBalance()`
3. ⏳ Fix `deductCredits()` (most critical - used in AI calls)
4. ⏳ Fix `addCredits()` (used in webhooks)
5. ⏳ Fix `getUserCreditHistory()`
6. ⏳ Update all callers to remove authId parameters
7. ⏳ Test end-to-end

## Migration Strategy

To avoid breaking existing code:

1. Keep old functions with deprecation warning
2. Add new secure functions
3. Update callers one by one
4. Remove old functions after full migration

OR (faster, riskier):

1. Update functions in place
2. Fix all TypeScript errors in one go
3. Test thoroughly

## Files That Call Credit Actions

Based on grep results:

- `src/components/credits/credits-transaction-history.tsx` - calls `getUserCreditHistory(userId, ...)`
- `src/components/credits/insufficient-credits-warning.tsx` - calls `getUserCreditsBalance(user.id)`
- AI action files (need to find) - call `deductCredits(authId, ...)`
- Webhook handlers - call `addCredits(authId, ...)`

These all need to be updated to not pass user IDs.
