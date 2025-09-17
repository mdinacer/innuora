# Session Sync Architecture Migration Guide

## Overview

This migration transforms the manual session sync system into an automatic, event-driven architecture that ensures data consistency between active and encrypted stores.

## New Components

### 1. SessionSyncManager (`session-sync-manager.ts`)

- **Purpose**: Central coordinator for all sync operations
- **Features**:
  - Auto-sync on session changes
  - Retry mechanism with exponential backoff
  - Error recovery and rollback
  - Browser lifecycle event handling

### 2. Auto-Sync Hooks (`auto-sync-hooks.ts`)

- **Purpose**: Drop-in replacements for direct store calls
- **Features**:
  - `useAutoSyncSessionStore()` - Main hook with automatic sync
  - `useSessionSyncStatus()` - Monitor sync status
  - `useBatchSessionUpdates()` - Batch operations with single sync
  - `useSessionRecovery()` - Error recovery utilities

### 3. SyncStatusIndicator (`sync-status-indicator.tsx`)

- **Purpose**: Visual feedback for users
- **Features**:
  - Real-time sync status display
  - Error notification and retry options
  - Network status awareness
  - Global error notifications

## Migration Steps

### Step 1: Replace Store Calls

**Before:**

```typescript
const sessionStore = useOpenChatSessionStore();
sessionStore.addMessage(sessionId, message);
// Manual sync required here
```

**After:**

```typescript
const sessionStore = useAutoSyncSessionStore();
sessionStore.addMessage(sessionId, message);
// Auto-sync happens automatically
```

### Step 2: Add Sync Status UI

```typescript
import { SyncStatusIndicator, GlobalSyncStatus } from '@/components/session-sync/sync-status-indicator';

// In your session component
<SyncStatusIndicator sessionId={sessionId} showDetails />

// In your app layout
<GlobalSyncStatus />
```

### Step 3: Initialize Sync Manager

```typescript
// In your app initialization
import { sessionSyncManager } from "@/lib/session-sync/session-sync-manager";

// The singleton initializes automatically
// No manual setup required
```

### Step 4: Remove Manual Sync Code

Find and remove all manual sync calls:

- `encryptedStore.updateSession()` calls after AI responses
- Manual sync triggers in conversation flows
- Error-prone sync timing logic

## Benefits After Migration

### ✅ **Data Consistency**

- No more stale data between stores
- Immediate sync on every change
- Automatic error recovery

### ✅ **Better User Experience**

- No lost messages or analysis
- Visual sync status feedback
- Seamless offline/online transitions

### ✅ **Improved Reliability**

- Automatic retry with exponential backoff
- Browser lifecycle event handling
- Network-aware sync operations

### ✅ **Developer Experience**

- Simpler API - just use the hooks
- No manual sync timing decisions
- Built-in error handling

## Testing the Migration

### 1. **Functional Testing**

```typescript
// Test auto-sync on message addition
const store = useAutoSyncSessionStore();
store.addMessage(sessionId, message);
// Verify encrypted store updates automatically

// Test error recovery
// Simulate encryption failure
// Verify retry mechanism activates
```

### 2. **Browser Event Testing**

- Switch tabs → Verify sync triggers
- Close/reopen browser → Verify data persistence
- Go offline/online → Verify queue behavior

### 3. **Performance Testing**

- Add many rapid messages → Verify efficient batching
- Monitor encryption performance → Verify non-blocking
- Check memory usage → Verify no leaks

## Rollback Plan

If issues arise, rollback is simple:

1. Replace `useAutoSyncSessionStore()` with `useOpenChatSessionStore()`
2. Re-add manual sync calls after AI responses
3. Remove sync status components
4. Disable SessionSyncManager

## Production Deployment

### Phase 1: Shadow Mode

- Deploy new system alongside old
- Monitor sync behavior
- Compare data consistency

### Phase 2: Gradual Migration

- Replace store calls in non-critical components
- Monitor error rates
- User feedback collection

### Phase 3: Full Migration

- Replace all store calls
- Remove old sync logic
- Monitor production metrics

## Monitoring & Metrics

Track these metrics post-migration:

- **Sync Success Rate**: Target >99.5%
- **Error Recovery Rate**: Target >95%
- **User Data Loss**: Target 0%
- **Performance Impact**: Target <10ms overhead

The new architecture provides a robust foundation for reliable session management with minimal developer overhead.
