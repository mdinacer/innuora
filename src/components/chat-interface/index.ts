// Main chat components
export { FlowChat } from './flow-chat/flow-chat';
export { OpenChat } from './open-chat/open-chat';

// Shared components
export { ChatContainer } from './shared/chat-container';
export { ChatHeader } from './shared/chat-header';
export { MessagesContainer } from './shared/messages-container';
export { MessageBubble } from './shared/message-bubble';

// Message renderers
export { FlowMessageRenderer } from './flow-chat/flow-message-renderer';
export { OpenMessageRenderer } from './open-chat/open-message-renderer';

// Input components
export { ChatInput } from './open-chat/chat-input';

// Types
export type {
  ChatMode,
  ChatMessage,
  ChatContainerProps,
  MessageRendererProps,
  ChatInputProps
} from './types/chat.types';