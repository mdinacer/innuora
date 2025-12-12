/**
 * Session Persistence Domain - Public API
 *
 * Responsibility: Local persistence and encryption of sessions
 */

// Store
export { useSessionStore } from "./session-persistence.store";

// Types
export type {
  EncryptedSession,
  ServerSessionData,
  SessionDataUpdate,
  SessionTelemetry,
  TokenUsageRecord,
} from "./session-persistence.types";

// Utils
export { getUniqueId, encryptSessionData, decryptSessionData } from "./session-persistence.utils";
