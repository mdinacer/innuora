# Improved Session Store Synchronization Architecture

## Current Issues:

- **Manual sync timing**: Sync happens at end of AI conversation rounds
- **Data inconsistency**: Active store can be ahead of encrypted store
- **Error recovery**: Failed syncs leave stores out of sync
- **Stale data**: User sees outdated content if sync fails

## Proposed Solution: Auto-Sync with Event-Driven Architecture

### 1. **Automatic Sync Triggers**

Instead of manual sync, trigger encryption automatically on:

- ✅ Message addition (immediate)
- ✅ Analysis updates (immediate)
- ✅ Metadata changes (immediate)
- ✅ Session modifications (immediate)
- ✅ Window/tab blur (preventive)
- ✅ Periodic intervals (backup - every 30s)

### 2. **Optimistic Updates with Rollback**

```typescript
// Active store updates immediately (optimistic)
// Encrypted store syncs in background
// If encryption fails, rollback active store to last known good state
```

### 3. **Sync Queue System**

```typescript
interface SyncOperation {
  id: string;
  sessionId: string;
  operation: "update" | "create" | "delete";
  data: Partial<Session>;
  timestamp: Date;
  retries: number;
}
```

### 4. **State Management**

```typescript
interface SyncState {
  pending: SyncOperation[];
  inProgress: Set<string>; // session IDs being synced
  lastSyncTime: Record<string, Date>;
  errors: Record<string, Error>;
}
```

## Implementation Strategy

### Phase 1: Add Sync Manager

Create a `SessionSyncManager` that:

- Handles all sync operations
- Maintains sync queue
- Provides rollback capabilities
- Manages error recovery

### Phase 2: Event-Driven Updates

Modify stores to:

- Emit events on changes
- Auto-queue sync operations
- Handle optimistic updates
- Rollback on failures

### Phase 3: Background Sync

Implement:

- Web Worker for encryption operations
- Periodic sync intervals
- Browser lifecycle event handling
- Network status awareness

## Benefits:

✅ **Immediate consistency** - No lag between stores
✅ **Error resilience** - Automatic retry with exponential backoff
✅ **Performance** - Non-blocking encryption in background
✅ **User experience** - No lost data, no stale content
✅ **Offline support** - Queue syncs for when connection returns

## Migration Plan:

1. Create SessionSyncManager (non-breaking)
2. Add event system to existing stores
3. Gradually replace manual sync calls
4. Add background worker optimization
5. Remove old sync logic

This approach ensures data consistency while maintaining performance and user experience.
