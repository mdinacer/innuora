// =======================
// CHAT MESSAGE TYPES - SIMPLIFIED
// =======================

import {
  ActionContent,
  FlowEndContent,
  FlowStep,
  OptionsContent,
  ParagraphsContent,
  StepType,
  SystemContent,
  UserInputContent,
} from "./flow-session.types";

export const MessageType = {
  TEXT: "text",
  PARAGRAPHS: "paragraphs",
  USER_INPUT: "user_input",
  OPTIONS: "options",
  ACTION: "action",
  REFLECTION: "reflection",
  SYSTEM: "system",
  FLOW_END: "flow_end",
  USER_MESSAGE: "user_message",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

interface BaseChatMessage {
  readonly id: string;
  readonly type: MessageType;
  readonly timestamp: number;
  readonly flowStepId?: string;
}

// Union type approach for chat messages - much cleaner
export type ChatMessage = BaseChatMessage &
  (
    | { type: typeof MessageType.TEXT; content: string; flowStepId: string }
    | {
        type: typeof MessageType.PARAGRAPHS;
        content: ParagraphsContent & { manualAdvance?: boolean };
        flowStepId: string;
      }
    | { type: typeof MessageType.USER_INPUT; content: UserInputContent; flowStepId: string }
    | { type: typeof MessageType.OPTIONS; content: OptionsContent; flowStepId: string }
    | { type: typeof MessageType.ACTION; content: ActionContent; flowStepId: string }
    | { type: typeof MessageType.REFLECTION; content: { title: string; reflection?: string; error?: string } }
    | { type: typeof MessageType.SYSTEM; content: SystemContent; flowStepId: string }
    | { type: typeof MessageType.FLOW_END; content: FlowEndContent; flowStepId: string }
    | { type: typeof MessageType.USER_MESSAGE; content: string | string[]; flowStepId?: never }
  );

// =======================
// UTILITY TYPES
// =======================

// Helper to get content type for a specific step/message type
export type ContentFor<T extends StepType | MessageType> = Extract<FlowStep | ChatMessage, { type: T }>["content"];

// Helper to get steps/messages of specific type
export type MessageOfType<T extends MessageType> = Extract<ChatMessage, { type: T }>;

// Grouping types
export type InteractiveMessage = MessageOfType<typeof MessageType.USER_INPUT | typeof MessageType.OPTIONS>;
export type FlowStepMessage = Exclude<ChatMessage, { type: typeof MessageType.USER_MESSAGE }>;
export type UserGeneratedMessage = MessageOfType<typeof MessageType.USER_MESSAGE | typeof MessageType.REFLECTION>;
