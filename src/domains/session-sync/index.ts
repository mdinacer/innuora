/**
 * Session Sync Domain
 *
 * Uses the lite implementation for simplicity and performance.
 * Provides session synchronization between Active Store → Encrypted Store → Database.
 */

// Export the lite synchronizer
export { sessionSynchronizer } from "./session-sync-lite";

// Export types
export * from "./session-sync.types";

// For backward compatibility
export { sessionSynchronizer as SessionSynchronizer } from "./session-sync-lite";
