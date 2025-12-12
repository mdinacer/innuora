/**
 * Conversation Domain - Public API
 *
 * Responsibility: Orchestrate conversation flow across domains
 */

// Actions
export { processUserInput } from "./conversation.actions";

// Types (re-export shared + domain-specific)
export type {
  ChatRole,
  ChatMessage,
  BaseChatMessage,
  UserChatMessage,
  ConversationMessage,
  AssistantChatMessage,
  InputProcessResults,
  ConversationMessageTyped,
} from "./conversation.types";
