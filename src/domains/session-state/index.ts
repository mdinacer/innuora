/**
 * Session State Domain - Public API
 *
 * Responsibility: Manage active session state in memory
 */

// Store
export { useActiveSessionStore } from "./session-state.store";

// Types
export type { ConversationSession, SessionMetadata, SessionPayload, SessionProcessType } from "./session-state.types";
export { SessionMetadataSchema, SessionCreateSchema } from "./session-state.types";
