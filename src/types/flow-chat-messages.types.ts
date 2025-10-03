// =======================
// SIMPLIFIED MESSAGE TYPES
// =======================

import { EndContent, ParagraphsContent, UserInputContent, UserSelectContent } from "./flow-session.types";

// Message types - reduced to just 2 main types
export const MessageType = {
  APP: "app", // Any message from the app
  USER: "user", // Any message from the user
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

// Message display variants for APP messages
export const AppMessageVariant = {
  TEXT: "text",
  PARAGRAPHS: "paragraphs",
  INPUT: "input",
  SELECT: "select",
  END: "end",
} as const;

export type AppMessageVariant = (typeof AppMessageVariant)[keyof typeof AppMessageVariant];

// =======================
// MESSAGE DEFINITIONS
// =======================

interface BaseMessage {
  readonly id: string;
  readonly type: MessageType;
  readonly timestamp: number;
}

export type AppMessage = BaseMessage & {
  type: typeof MessageType.APP;
  flowStepId: string;
} & (
    | { variant: typeof AppMessageVariant.TEXT; content: string }
    | { variant: typeof AppMessageVariant.PARAGRAPHS; content: ParagraphsContent }
    | { variant: typeof AppMessageVariant.INPUT; content: UserInputContent }
    | { variant: typeof AppMessageVariant.SELECT; content: UserSelectContent }
    | { variant: typeof AppMessageVariant.END; content: EndContent }
  );

export type UserMessage = BaseMessage & {
  type: typeof MessageType.USER;
  content: string | string[];
  flowStepId?: string; // Optional reference to which step this was responding to
};

export type ChatMessage = AppMessage | UserMessage;

// Helper to create messages
export function createAppMessage(flowStepId: string, variant: AppMessageVariant, content: any): AppMessage {
  return {
    id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: MessageType.APP,
    timestamp: Date.now(),
    flowStepId,
    variant,
    content,
  } as AppMessage;
}

export function createUserMessage(content: string | string[], flowStepId?: string): UserMessage {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: MessageType.USER,
    timestamp: Date.now(),
    content,
    flowStepId,
  };
}
