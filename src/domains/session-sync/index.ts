// For backward compatibility, also export the singleton with the old name
import { sessionSynchronizer as syncInstance } from "./session-synchronizer-v2";

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
