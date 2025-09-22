// For backward compatibility, also export the singleton with the old name
import { sessionSynchronizer as syncInstance } from "./session-synchronizer-v2";

/**
 * Session Sync Module - Refactored Entry Point
 *
 * This module has been refactored from a 629-line god class into
 * focused, composable services for better maintainability.
 *
 * Architecture:
 * - SyncConfigManager: Configuration management
 * - SyncStateManager: State and event management
 * - LocalSyncService: Active → Encrypted store sync
 * - CloudSyncService: Encrypted → Database sync
 * - RetryService: Exponential backoff retry logic
 * - SessionSynchronizerV2: Orchestrator
 */

// Export the new refactored synchronizer
export { SessionSynchronizerV2, sessionSynchronizer } from "./session-synchronizer-v2";

// Export individual services for advanced usage
export { SyncConfigManager } from "./config/sync-config";
export { SyncStateManager } from "./state/sync-state-manager";
export { LocalSyncService } from "./services/local-sync-service";
export { CloudSyncService } from "./services/cloud-sync-service";
export { RetryService } from "./utils/retry-service";

// Export types
export * from "./session-sync.types";

export { syncInstance as SessionSynchronizer };

/**
 * Migration Guide:
 *
 * The public API remains the same, so existing code should work without changes:
 *
 * ```ts
 * import { sessionSynchronizer } from "@/domains/session-sync";
 *
 * // All these methods work exactly the same:
 * sessionSynchronizer.queueLocalSync(sessionId, "update", session);
 * sessionSynchronizer.queueCloudSync(sessionId, "update");
 * sessionSynchronizer.getSyncStatus(sessionId);
 * sessionSynchronizer.retryFailedSync(sessionId, "both");
 * ```
 *
 * Benefits of the refactor:
 * - 629 lines → ~200 lines orchestrator + focused services
 * - Single Responsibility Principle
 * - Easier testing (each service can be tested independently)
 * - Better error handling and logging
 * - Cleaner dependency injection
 * - Type safety improvements
 */
