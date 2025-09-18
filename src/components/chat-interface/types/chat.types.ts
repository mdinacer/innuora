import { ReactNode } from 'react';
import { Session } from '@/lib/ai/mirael-core/v2/open-chat-session.types';

export type ChatMode = 'flow' | 'open';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
}

export interface ChatContainerProps {
  mode: ChatMode;
  session: Session;
  className?: string;
  variant?: 'default' | 'compact';
}

export interface MessageRendererProps<T = ChatMessage> {
  message: T;
  onUserInput?: (input: string) => void;
  onUserSelect?: (option: any) => void;
}

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}